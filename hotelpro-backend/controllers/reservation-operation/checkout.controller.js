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

const checkoutReservation = asyncHandler(async (req, res) => {
  let { propertyUnitId, reservation } = req.body;
  propertyUnitId = new ObjectId(propertyUnitId);
  let reservationId = new ObjectId(reservation._id);
  if (reservation.roomLockId) {
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
          reservationStatus: ReservationStatusEnum.CHECKEDOUT,
        },
      }
    ),
    ReservationDetail.updateOne(
      {
        reservationId: reservationId,
      },
      {
        $set: {
          checkOutDate: new Date(),
          checkOutTime: new Date(),
        },
      }
    ),
  ]);
  // Return the uploaded images URLs
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "checked out successfully!"));
});
export default {
  checkoutReservation,
};
