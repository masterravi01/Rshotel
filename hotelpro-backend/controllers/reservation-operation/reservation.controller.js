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
} from "../../database/database.schema.js";
import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;
import { UserTypesEnum } from "../../constants.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../../utils/cloudinary.js";
import { deleteLocalImage } from "../../utils/helpers.js";
import {
  CLOUD_AVATAR_FOLDER_NAME,
  CLOUD_COVERPIC_FOLDER_NAME,
} from "../../constants.js";

// GET all reservations
const getAllReservations = asyncHandler(async (req, res) => {
  const reservations = await Reservation.find();
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        reservations,
        "All reservations retrieved successfully"
      )
    );
});

// GET a single reservation by ID
const getReservationById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const reservation = await Reservation.findById(id);
  if (!reservation) {
    throw new ApiError(404, "Reservation not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, reservation, "Reservation retrieved successfully")
    );
});

// POST create a new reservation

const createReservation = asyncHandler(async (req, res) => {
  let session = null;
  try {
    session = await mongoose.startSession();
    console.log("Session started:", session.id);

    await session.withTransaction(async () => {
      console.log("Transaction started");
      let { groupDetails, reservationsArray, paymentEntries, propertyUnitId } =
        req.body;
      propertyUnitId = new ObjectId(propertyUnitId);
      let ReservationEntries = [];
      let ReservationDetailEntries = [];
      let UserEntries = [];
      let AddressEntries = [];
      let RoomBalanceEntries = [];
      let TransactionCodeEntries = [];
      let GuestTransactionEntries = [];

      // Group reservation data
      const groupData = new GroupReservation(groupDetails);
      let customerDetails = new User(groupDetails);
      customerDetails.userType = UserTypesEnum.GUEST;
      let customerAddress = new Address(groupDetails);
      customerDetails.addressId = customerAddress._id;

      groupData.customerId = customerDetails._id;
      UserEntries.push(customerDetails);
      AddressEntries.push(customerAddress);

      // Handling reservations array
      for (let reservation of reservationsArray) {
        let reservationObj = new Reservation(reservation);
        reservationObj.propertyUnitId = propertyUnitId;
        reservationObj.arrival = groupData.arrival;
        reservationObj.departure = groupData.departure;
        reservationObj.groupId = groupData._id;

        let reservationDetailObj = new ReservationDetail(reservation);
        reservationDetailObj.reservationId = reservationObj._id;
        reservationDetailObj.adults =
          reservation.adultOccupant + reservation.extraAdults;
        reservationDetailObj.childs =
          reservation.childOccupant + reservation.extraChilds;
        ReservationDetailEntries.push(reservationDetailObj);

        // Handling guests
        reservation.guests.forEach((guest, index) => {
          let guestObj;
          let guestAddress;

          if (index === 0) {
            if (guest.isSameAsCustomer) {
              reservationObj.userId = customerDetails._id;
            } else {
              guestObj = new User(guest);
              guestObj.userType = UserTypesEnum.GUEST;
              guestAddress = new Address(guest);
              guestObj.addressId = guestAddress._id;
              reservationObj.userId = guestObj._id;
              UserEntries.push(guestObj);
              AddressEntries.push(guestAddress);
            }
          } else {
            if (guest.isSameAsCustomer) {
              reservationObj.secondaryUserIds.push(customerDetails._id);
            } else {
              guestObj = new User(guest);
              guestObj.userType = UserTypesEnum.GUEST;
              guestAddress = new Address(guest);
              guestObj.addressId = guestAddress._id;
              reservationObj.secondaryUserIds.push(guestObj._id);
              UserEntries.push(guestObj);
              AddressEntries.push(guestAddress);
            }
          }
        });

        // Handling date rates
        reservation.dateRate.forEach((rate) => {
          let rb = new RoomBalance(rate);
          rb.balanceDate = rate.date;
          rb.reservationId = reservationObj._id;
          rb.balance = -(
            rate.baseRate +
            reservation.extraAdults * rate.adultRate +
            reservation.extraChilds * rate.childRate
          );
          rb.roomId = reservationObj.roomId;
          RoomBalanceEntries.push(rb);

          let rbtax = new RoomBalance();
          rbtax.balanceDate = rate.date;
          rbtax.reservationId = reservationObj._id;
          rbtax.balanceName = "Tax";
          rbtax.balance =
            -(
              (rate.baseRate +
                reservation.extraAdults * rate.adultRate +
                reservation.extraChilds * rate.childRate) *
              reservation.taxPercentage
            ) / 100;
          rbtax.roomId = reservationObj.roomId;
          RoomBalanceEntries.push(rbtax);
        });

        ReservationEntries.push(reservationObj);
      }

      // Create Billing Account
      let billing_account = new BillingAccount();
      billing_account.billingAccountName =
        groupDetails.firstName + " " + groupDetails.lastName;
      billing_account.billingAccountDescription = "";
      billing_account.propertyUnitId = propertyUnitId;
      billing_account.userId = customerDetails._id;

      // Handling payments
      if (paymentEntries && paymentEntries.length > 0) {
        for (let i = 0; i < paymentEntries.length; i++) {
          if (paymentEntries[i].paymentType === "cash") {
            let transaction_code = {};
            transaction_code.transactionCode = String(new ObjectId());
            transaction_code.transactionRate = paymentEntries[i].amount;
            transaction_code.transactionDetail = paymentEntries[i].remark;
            transaction_code.receipt = Math.floor(
              100000 + Math.random() * 900000
            );
            transaction_code.transactionType = "Reservation";
            transaction_code.date = Date.now();
            transaction_code = new TransactionCode(transaction_code);
            TransactionCodeEntries.push(transaction_code);

            let guest_transaction = {};
            guest_transaction.transactionCodeId = transaction_code._id;
            guest_transaction.groupId = groupData._id;
            guest_transaction.userId = customerDetails._id;
            guest_transaction.isDeposit = paymentEntries[i].deposit;
            guest_transaction.transactionDate = Date.now();
            guest_transaction.billingAccountId = billing_account._id;
            guest_transaction = new GuestTransaction(guest_transaction);
            GuestTransactionEntries.push(guest_transaction);

            if (paymentEntries[i].deposit) {
              groupData.totalDeposit += paymentEntries[i].amount;
            } else {
              groupData.totalBalance += paymentEntries[i].amount;
              groupData.totalPayment += paymentEntries[i].amount;
            }
          }
        }
      }

      // Saving all entries to the database
      await Promise.all([
        groupData.save({ session }),
        billing_account.save({ session }),
        User.insertMany(UserEntries, { session }),
        Address.insertMany(AddressEntries, { session }),
        Reservation.insertMany(ReservationEntries, { session }),
        RoomBalance.insertMany(RoomBalanceEntries, { session }),
        ReservationDetail.insertMany(ReservationDetailEntries, { session }),
        TransactionCode.insertMany(TransactionCodeEntries, { session }),
        GuestTransaction.insertMany(GuestTransactionEntries, { session }),
      ]);

      console.log("Transaction committed successfully");
      return res
        .status(201)
        .json(new ApiResponse(201, {}, "Reservation created successfully"));
    });
  } catch (error) {
    console.error("Error during transaction:", error.message);
    console.error("Stack trace:", error.stack);
    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          {},
          "An error occurred while creating the reservation"
        )
      );
  } finally {
    if (session) {
      console.log("Ending session");
      session.endSession();
    }
  }
});

// PUT update a reservation by ID
const updateReservationById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    roomIds,
    propertyUnitId,
    arrival,
    departure,
    reservationStatus,
    notes,
    ratePlanSetupId,
    userId,
  } = req.body;
  const reservation = await Reservation.findByIdAndUpdate(
    id,
    {
      roomIds,
      propertyUnitId,
      arrival,
      departure,
      reservationStatus,
      notes,
      ratePlanSetupId,
      userId,
    },
    { new: true }
  );
  if (!reservation) {
    throw new ApiError(404, "Reservation not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, reservation, "Reservation updated successfully")
    );
});

// DELETE a reservation by ID
const deleteReservationById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const reservation = await Reservation.findByIdAndDelete(id);
  if (!reservation) {
    throw new ApiError(404, "Reservation not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, { id }, "Reservation deleted successfully"));
});

const readReservationRate = asyncHandler(async (req, res) => {
  const { propertyUnitId } = req.params;
  let { arrival, departure, adults, childs } = req.body;
  let nextDate = new Date(arrival);
  arrival = new Date(arrival);
  departure = new Date(departure);

  let ratesData = await RoomType.aggregate([
    {
      $match: {
        propertyUnitId: new ObjectId(propertyUnitId),
      },
    },
    {
      $lookup: {
        from: "rooms",
        localField: "_id",
        foreignField: "roomTypeId",
        as: "rooms",
      },
    },
    {
      $lookup: {
        from: "taxes",
        localField: "propertyUnitId",
        foreignField: "propertyUnitId",
        as: "taxes",
      },
    },
    {
      $lookup: {
        from: "rateplanroomtypes",
        localField: "_id",
        foreignField: "roomTypeId",
        as: "rateRoomTypes",
        pipeline: [
          {
            $lookup: {
              from: "rateplansetups",
              localField: "ratePlanSetupId",
              foreignField: "_id",
              as: "rateSetup",
            },
          },
          {
            $unwind: {
              path: "$rateSetup",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $addFields: {
              ratePlanName: "$rateSetup.ratePlanName",
            },
          },
          {
            $unset: "rateSetup",
          },
          {
            $lookup: {
              from: "rateplanroomrates",
              localField: "_id",
              foreignField: "ratePlanRoomDetailId",
              as: "roomTypeRates",
            },
          },
        ],
      },
    },
    {
      $unwind: {
        path: "$rateRoomTypes",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 0,
        roomTypeId: "$_id",
        rooms: {
          $map: {
            input: "$rooms",
            as: "room",
            in: {
              id: "$$room._id",
              roomStatus: "$$room.roomStatus",
              roomCondition: "$$room.roomCondition",
              roomNumber: "$$room.roomNumber",
              roomName: "$$room.roomName",
            },
          },
        },
        roomAmenities: [], // Assuming roomAmenities is an empty array for now
        rateplanId: "$rateRoomTypes.ratePlanSetupId",
        rateName: "$rateRoomTypes.ratePlanName",
        adultOccupant: "$adultOccupancy",
        childOccupant: "$childOccupancy",
        images: "$images",
        rates: "$rateRoomTypes.roomTypeRates",
        roomtype: "$roomTypeName",
        totalRoom: { $size: "$rooms" },
        roomPrice: { $literal: 0 },
        roomCost: { $literal: 0 },
        taxPercentage: { $sum: "$taxes.taxPercentage" },
      },
    },
  ]);
  for (let roomtype of ratesData) {
    roomtype["rateType"] = {};
    roomtype["dateRate"] = [];
    for (let rate of roomtype.rates) {
      roomtype.rateType[rate.rateType] = rate.baseRate;
    }
    delete roomtype.rates;
  }
  for (let j = 0; nextDate < departure; j++) {
    for (let roomtype of ratesData) {
      roomtype.rateType.date = nextDate;
      let obj = JSON.parse(JSON.stringify(roomtype.rateType));
      roomtype.dateRate.push(obj);
    }
    nextDate.setDate(nextDate.getDate() + 1);
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, ratesData, "Reservation Rate get successfully!")
    );
});

const uploadReservationImages = asyncHandler(async (req, res) => {
  const { propertyUnitId } = req.params;
  const avatarLocalPath = req.files[0]?.path;

  // Check if avatar is provided
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required!");
  }
  const avatar = await uploadOnCloudinary(
    avatarLocalPath,
    CLOUD_AVATAR_FOLDER_NAME
  );
  if (!avatar) {
    throw new ApiError(400, "Avatar upload failed!");
  }
  console.log(avatar.url);
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Reservation Rate get successfully!"));
});

const guestFolio = asyncHandler(async (req, res) => {
  const { propertyUnitId } = req.params;
  const { groupId } = req.body;

  const groupReservationDetails = await GroupReservation.aggregate([
    {
      $match: {
        _id: new ObjectId(groupId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "customerId",
        foreignField: "_id",
        as: "customerDetails",
        pipeline: [
          {
            $lookup: {
              from: "addresses",
              localField: "addressId",
              foreignField: "_id",
              as: "customerAddress",
            },
          },
          {
            $unwind: {
              path: "$customerAddress",
              preserveNullAndEmptyArrays: true,
            },
          },
        ],
      },
    },
    {
      $unwind: {
        path: "$customerDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "reservations",
        localField: "_id",
        foreignField: "groupId",
        as: "reservations",
        pipeline: [
          {
            $lookup: {
              from: "rooms",
              localField: "roomId",
              foreignField: "_id",
              as: "roomDetails",
              pipeline: [
                {
                  $lookup: {
                    from: "roomtypes",
                    localField: "roomTypeId",
                    foreignField: "_id",
                    as: "roomTypeDetails",
                  },
                },
                {
                  $unwind: {
                    path: "$roomTypeDetails",
                    preserveNullAndEmptyArrays: true,
                  },
                },
              ],
            },
          },
          {
            $unwind: {
              path: "$roomDetails",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "guestDetails",
              pipeline: [
                {
                  $lookup: {
                    from: "addresses",
                    localField: "addressId",
                    foreignField: "_id",
                    as: "guestAddress",
                  },
                },
                {
                  $unwind: {
                    path: "$guestAddress",
                    preserveNullAndEmptyArrays: true,
                  },
                },
              ],
            },
          },
          {
            $unwind: {
              path: "$guestDetails",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "secondaryUserIds",
              foreignField: "_id",
              as: "secondaryGuests",
              pipeline: [
                {
                  $lookup: {
                    from: "addresses",
                    localField: "addressId",
                    foreignField: "_id",
                    as: "guestAddress",
                  },
                },
                {
                  $unwind: {
                    path: "$guestAddress",
                    preserveNullAndEmptyArrays: true,
                  },
                },
              ],
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
            },
          },
          {
            $unwind: {
              path: "$rateDetails",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: "roombalances",
              localField: "_id",
              foreignField: "reservationId",
              as: "roomBalances",
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "guesttransactions",
        localField: "_id",
        foreignField: "groupId",
        as: "paymentDetails",
        pipeline: [
          {
            $lookup: {
              from: "transactioncodes",
              localField: "transactionCodeId",
              foreignField: "_id",
              as: "transactionDetails",
            },
          },
          {
            $unwind: {
              path: "$transactionDetails",
              preserveNullAndEmptyArrays: true,
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        groupReservationDetails,
        "Reservation retrieved successfully!"
      )
    );
});

export default {
  getAllReservations,
  getReservationById,
  createReservation,
  updateReservationById,
  deleteReservationById,
  readReservationRate,
  uploadReservationImages,
  guestFolio,
};
