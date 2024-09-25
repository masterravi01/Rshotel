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
  const { propertyUnitId } = req.params;

  // Check if files are provided
  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, "At least one image is required!");
  }

  // Array to hold the uploaded image URLs
  const uploadedImages = [];

  // Upload each file to Cloudinary
  for (const file of req.files) {
    const localFilePath = file.path;

    const uploadedImage = await uploadOnCloudinary(
      localFilePath,
      CLOUD_USER_DOC_FOLDER_NAME
    );

    if (!uploadedImage) {
      throw new ApiError(400, `Image upload failed for ${file.originalname}!`);
    }

    // Push the uploaded image URL to the array
    uploadedImages.push(uploadedImage.url);
  }

  // Return the uploaded images URLs
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { images: uploadedImages },
        "Images uploaded successfully!"
      )
    );
});
export default {
  checkoutReservation,
};
