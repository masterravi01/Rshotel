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

const postReservationPayment = asyncHandler(async (req, res) => {
  let data = {};
  let transactionCode;
  let guestTransaction;
  let { propertyUnitId, groupId, userId, payment } = req.body;
  groupId = new ObjectId(groupId);
  userId = new ObjectId(userId);
  propertyUnitId = new ObjectId(propertyUnitId);

  let [billing_account, userDetails] = await Promise.all([
    BillingAccount.findOne({
      groupId,
    }),
    User.findById(userId),
  ]);
  if (!billing_account) {
    billing_account = new BillingAccount({
      billingAccountName: `${userDetails.firstName} ${userDetails.lastName}`,
      propertyUnitId,
      userId: userId,
      groupId: groupId,
    });
    await billing_account.save();
  }
  if (payment.paymentType === "cash") {
    transactionCode = new TransactionCode({
      transactionCode: String(new ObjectId()),
      transactionType: "Reservation",
      transactionRate: payment.amount,
      transactionDetail: payment.remark,
      receipt: Math.floor(100000 + Math.random() * 900000),
      date: Date.now(),
    });

    guestTransaction = new GuestTransaction({
      transactionCodeId: transactionCode._id,
      isDeposit: payment.deposit,
      transactionDate: Date.now(),
      userId: userId,
      groupId: groupId,
      billingAccountId: billing_account._id,
    });
  }
  await Promise.all([
    GroupReservation.updateOne(
      {
        _id: groupId,
      },
      {
        $inc: {
          totalBalance: payment.deposit ? 0 : payment.amount,
          totalPayment: payment.deposit ? 0 : payment.amount,
          totalDeposit: payment.deposit ? payment.amount : 0,
        },
      }
    ),
    transactionCode.save(),
    guestTransaction.save(),
  ]);
  return res
    .status(201)
    .json(new ApiResponse(201, data, "Payment made successfully!"));
});

const refundPayment = asyncHandler(async (req, res) => {
  let data = {};
  let transactionCode;
  let guestTransaction;
  let { propertyUnitId, groupId, userId, payment } = req.body;
  groupId = new ObjectId(groupId);
  userId = new ObjectId(userId);
  propertyUnitId = new ObjectId(propertyUnitId);

  let billing_account = await BillingAccount.findOne({
    groupId,
  });

  if (payment.paymentType === "cash") {
    payment.amount = -payment.amount;
    transactionCode = new TransactionCode({
      transactionCode: String(new ObjectId()),
      transactionType: "Reservation",
      transactionRate: payment.amount,
      transactionDetail: payment.remark,
      receipt: Math.floor(100000 + Math.random() * 900000),
      date: Date.now(),
    });

    guestTransaction = new GuestTransaction({
      transactionCodeId: transactionCode._id,
      isDeposit: payment.deposit,
      transactionDate: Date.now(),
      userId: userId,
      groupId: groupId,
      billingAccountId: billing_account._id,
    });
  }
  await Promise.all([
    GroupReservation.updateOne(
      {
        _id: groupId,
      },
      {
        $inc: {
          totalBalance: payment.deposit ? 0 : payment.amount,
          totalPayment: payment.deposit ? 0 : payment.amount,
          totalDeposit: payment.deposit ? payment.amount : 0,
        },
      }
    ),
    transactionCode.save(),
    guestTransaction.save(),
  ]);
  return res
    .status(201)
    .json(new ApiResponse(201, data, "Refund Payment  successfully!"));
});
export default {
  postReservationPayment,
  refundPayment,
};
