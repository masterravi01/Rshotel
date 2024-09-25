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

const addSharedGuestToReservation = asyncHandler(async (req, res) => {
  let data = {};
  let { reservationId, userDetails } = req.body;
  delete userDetails._id; // Removing _id to avoid conflicts if it exists
  reservationId = new ObjectId(reservationId);
  let guestObj = new User({ ...userDetails, userType: UserTypesEnum.GUEST });
  let guestAddress = new Address(userDetails);
  guestObj.addressId = guestAddress._id;
  await Promise.all([
    guestObj.save(),
    guestAddress.save(),
    Reservation.updateOne(
      {
        _id: reservationId,
      },
      { $push: { secondaryUserIds: guestObj._id } }
    ),
  ]);

  return res
    .status(201)
    .json(
      new ApiResponse(201, data, "Guest added to reservation successfully!")
    );
});

const updateGuestToReservation = asyncHandler(async (req, res) => {
  let data = {};
  let { userDetails } = req.body;
  let userId = new ObjectId(userDetails._id);
  delete userDetails._id;

  const userData = await User.findById(userId);
  if (!userData) {
    throw new ApiError(404, "User not found.");
  }

  await Promise.all([
    User.updateOne({ _id: userId }, { $set: userDetails }),
    Address.updateOne({ _id: userData.addressId }, { $set: userDetails }),
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, data, "Guest updated successfully!"));
});

const deleteSharedGuest = asyncHandler(async (req, res) => {
  let data = {};
  let { reservationId, userDetails } = req.body;
  let userId = new ObjectId(userDetails._id);
  const userData = await User.findById(userId);

  if (!userData) {
    throw new ApiError(404, "User not found.");
  }

  if (
    Array.isArray(userDetails.documents) &&
    userDetails.documents.length > 0
  ) {
    for (let imageUrl of userDetails.documents) {
      const isDelete = await deleteFromCloudinary(imageUrl);
      if (!isDelete) {
        throw new ApiError(400, `Image Delete failed for ${imageUrl}`);
      }
    }
  }

  await Promise.all([
    User.deleteOne({ _id: userId }),
    Address.deleteOne({ _id: userData.addressId }),
  ]);

  if (reservationId) {
    await Reservation.updateOne(
      { _id: new ObjectId(reservationId) },
      { $pull: { secondaryUserIds: userId } }
    );
  }

  return res
    .status(204)
    .json(new ApiResponse(204, data, "Guest deleted successfully!"));
});

export default {
  addSharedGuestToReservation,
  updateGuestToReservation,
  deleteSharedGuest,
};
