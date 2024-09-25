import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import {
  Reservation,
  ReservationDetail,
  RatePlanSetup,
  RatePlanRoomType,
  RatePlanRoomRate,
  RoomType,
  RoomBalance,
  GroupReservation,
  User,
  Address,
  BillingAccount,
  TransactionCode,
  GuestTransaction,
  BookingControl,
  RoomMaintenance,
} from "../../database/database.schema.js";
import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;
import {
  UserTypesEnum,
  ReservationStatusEnum,
  BalanceNameEnum,
  AvailableChangeValueEnum,
  ChangeValueEnum,
} from "../../constants.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../../utils/cloudinary.js";
import {
  deleteLocalImage,
  prepareInternalError,
  generateConfirmationNumber,
  generateGroupNumber,
} from "../../utils/helpers.js";
import {
  CLOUD_AVATAR_FOLDER_NAME,
  CLOUD_COVERPIC_FOLDER_NAME,
  CLOUD_USER_DOC_FOLDER_NAME,
} from "../../constants.js";

import {
  checkAndAllocateRoom,
  deallocateMultipleRooms,
  deallocateRoom,
} from "./room-reservation-concurrency.js";

const readNoshowCharge = asyncHandler(async (req, res) => {
  let { propertyUnitId, reservationId } = req.body;
  reservationId = new ObjectId(reservationId);
  let noShowReservationDetails = await Reservation.aggregate([
    {
      $match: {
        _id: reservationId,
      },
    },
    {
      $lookup: {
        from: "reservationdetails",
        localField: "_id",
        foreignField: "reservationId",
        as: "reservationDetails",
      },
    },
    {
      $unwind: {
        path: "$reservationDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "rateplansetups",
        localField: "rateplanId",
        foreignField: "_id",
        as: "rateDetails",
        pipeline: [
          {
            $lookup: {
              from: "noshowpolicies",
              localField: "noShowPolicyId",
              foreignField: "_id",
              as: "noshowPolicyDetails",
            },
          },
          {
            $unwind: {
              path: "$noshowPolicyDetails",
              preserveNullAndEmptyArrays: true,
            },
          },
        ],
      },
    },
    {
      $unwind: {
        path: "$rateDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
  ]);
  let penalty = 0;
  noShowReservationDetails = noShowReservationDetails[0];

  if (
    noShowReservationDetails.rateDetails.noshowPolicyDetails.chargeType ==
    ChangeValueEnum.PERCENTAGE
  ) {
    penalty =
      (noShowReservationDetails.reservationDetails.roomCost *
        noShowReservationDetails.rateDetails.noshowPolicyDetails.chargeValue) /
      100;
  } else {
    penalty =
      noShowReservationDetails.rateDetails.noshowPolicyDetails.chargeValue;
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        ...noShowReservationDetails.rateDetails.noshowPolicyDetails,
        penalty,
      },
      "Reservation Rate get successfully!"
    )
  );
});
const noShowReservation = asyncHandler(async (req, res) => {
  let { propertyUnitId, reservation } = req.body;
  propertyUnitId = new ObjectId(propertyUnitId);
  let reservationId = new ObjectId(reservation._id);

  if (reservation.roomId && reservation.roomLockId) {
    const DeallocatedRoomLock = await deallocateRoom(
      new ObjectId(reservation.roomLockId)
    );
    if (!DeallocatedRoomLock) {
      throw prepareInternalError("error while deallocated room !");
    }
  }
  await Promise.all([
    Reservation.updateOne(
      {
        _id: reservationId,
      },
      {
        $set: {
          reservationStatus: ReservationStatusEnum.NOSHOW,
        },
      }
    ),
    ReservationDetail.updateOne(
      { reservationId: reservationId },
      {
        $set: {
          noShowDate: Date.now(),
        },
      }
    ),
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Reservation Rate get successfully!"));
});

const readCancelReservationCharge = asyncHandler(async (req, res) => {
  let { propertyUnitId, reservationId } = req.body;
  reservationId = new ObjectId(reservationId);
  let cancelReservationDetails = await Reservation.aggregate([
    {
      $match: {
        _id: reservationId,
      },
    },
    {
      $lookup: {
        from: "reservationdetails",
        localField: "_id",
        foreignField: "reservationId",
        as: "reservationDetails",
      },
    },
    {
      $unwind: {
        path: "$reservationDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "rateplansetups",
        localField: "rateplanId",
        foreignField: "_id",
        as: "rateDetails",
        pipeline: [
          {
            $lookup: {
              from: "cancellationpolicies",
              localField: "cancellationPolicyId",
              foreignField: "_id",
              as: "cancelPolicyDetails",
            },
          },
          {
            $unwind: {
              path: "$cancelPolicyDetails",
              preserveNullAndEmptyArrays: true,
            },
          },
        ],
      },
    },
    {
      $unwind: {
        path: "$rateDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
  ]);
  let penalty = 0;
  cancelReservationDetails = cancelReservationDetails[0];
  let hours = Number(
    cancelReservationDetails.rateDetails.cancelPolicyDetails.windowRange.split(
      "h"
    )[0]
  );
  let currDate = new Date();
  currDate.setUTCHours(currDate.getUTCHours() + hours);
  let isInsideRange = currDate >= new Date(cancelReservationDetails.arrival);
  if (
    cancelReservationDetails.rateDetails.cancelPolicyDetails.windowType ==
    ChangeValueEnum.PERCENTAGE
  ) {
    penalty = isInsideRange
      ? (cancelReservationDetails.reservationDetails.roomCost *
          cancelReservationDetails.rateDetails.cancelPolicyDetails
            .insideWindowCharge) /
        100
      : (cancelReservationDetails.reservationDetails.roomCost *
          cancelReservationDetails.rateDetails.cancelPolicyDetails
            .outsideWindowCharge) /
        100;
  } else {
    penalty = isInsideRange
      ? cancelReservationDetails.rateDetails.cancelPolicyDetails
          .insideWindowCharge
      : cancelReservationDetails.rateDetails.cancelPolicyDetails
          .outsideWindowCharge;
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        ...cancelReservationDetails.rateDetails.cancelPolicyDetails,
        penalty,
        isInsideRange,
      },
      "Reservation Rate get successfully!"
    )
  );
});
const cancelReservation = asyncHandler(async (req, res) => {
  let { propertyUnitId, reservation, cancelDetails } = req.body;
  propertyUnitId = new ObjectId(propertyUnitId);
  let groupId = new ObjectId(reservation.groupId);
  let reservationId = new ObjectId(reservation._id);
  if (reservation.roomId && reservation.roomLockId) {
    const DeallocatedRoomLock = await deallocateRoom(
      new ObjectId(reservation.roomLockId)
    );
    if (!DeallocatedRoomLock) {
      throw prepareInternalError("error while deallocated room !");
    }
  }
  // if (cancelDetails.penalty > 0) {
  //   let roomBalance = new RoomBalance();
  //   roomBalance.balance = -cancelDetails.penalty;
  //   roomBalance.reason = "penalty";
  //   roomBalance.balanceDate = Date.now();
  //   roomBalance.balanceName = BalanceNameEnum.ROOMSERVICES;
  //   await Promise.all([
  //     GroupReservation.updateOne(
  //       {
  //         _id: groupId,
  //       },
  //       {
  //         $inc: {
  //           totalBalance: roomBalance.balance,
  //           totalCost: cancelDetails.penalty,
  //           totalPrice: cancelDetails.penalty,
  //         },
  //       }
  //     ),
  //     roomBalance.save(),
  //     Reservation.updateOne(
  //       {
  //         _id: reservationId,
  //       },
  //       {
  //         $set: {
  //           reservationStatus: ReservationStatusEnum.CANCELLED,
  //         },
  //       }
  //     ),
  //     ReservationDetail.updateOne(
  //       { reservationId: reservationId },
  //       {
  //         $set: {
  //           cancellationDate: Date.now(),
  //         },
  //         $inc: {
  //           roomCost: cancelDetails.penalty,
  //         },
  //       }
  //     ),
  //   ]);
  // } else {
  await Promise.all([
    Reservation.updateOne(
      {
        _id: reservationId,
      },
      {
        $set: {
          reservationStatus: ReservationStatusEnum.CANCELLED,
        },
      }
    ),
    ReservationDetail.updateOne(
      { reservationId: reservationId },
      {
        $set: {
          cancellationDate: Date.now(),
        },
      }
    ),
  ]);
  // }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Reservation Rate get successfully!"));
});

export default {
  readNoshowCharge,
  noShowReservation,
  readCancelReservationCharge,
  cancelReservation,
};
