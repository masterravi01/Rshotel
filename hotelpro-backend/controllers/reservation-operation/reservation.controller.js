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
} from "./room-reservation-concurrency.js";

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
  let AllInsertedRoomLockIds = [];
  let transaction_retry_count = 0;
  let data = {};
  try {
    session = await mongoose.startSession();
    console.log("Session started:", session.id);

    await session.withTransaction(async () => {
      console.log("Transaction started");

      let { groupDetails, reservationsArray, paymentEntries, propertyUnitId } =
        req.body;

      if (transaction_retry_count > 0) {
        console.log("in retry");
        // if we are retrying then, deallocate old rooms
        await deallocateMultipleRooms(AllInsertedRoomLockIds);
        AllInsertedRoomLockIds = [];
      }

      transaction_retry_count++;
      propertyUnitId = new ObjectId(propertyUnitId);
      let reservationsRoomTypeIds = [];
      let assigncheckindate = new Date(groupDetails.arrival);
      let assigncheckoutdate = new Date(groupDetails.departure);

      // Get unique roomTypeIds from reservationsArray
      reservationsArray.forEach((r) => {
        const roomTypeId = new ObjectId(r.roomTypeId);
        if (!reservationsRoomTypeIds.includes(roomTypeId)) {
          reservationsRoomTypeIds.push(roomTypeId);
        }
      });

      let [
        OldReservations,
        TotalRooms,
        RoomMaintainanceDetails,
        BookingControlDetails,
      ] = await Promise.all([
        Reservation.aggregate([
          {
            $match: {
              $and: [
                { departure: { $gt: assigncheckindate } },
                { arrival: { $lt: assigncheckoutdate } },
                { propertyUnitId },
                { roomTypeId: { $in: reservationsRoomTypeIds } },
                {
                  $or: [
                    { reservationStatus: ReservationStatusEnum.INHOUSE },
                    { reservationStatus: ReservationStatusEnum.RESERVED },
                  ],
                },
              ],
            },
          },
          { $project: { roomId: 1, tantative: 1, roomTypeId: 1 } },
        ]),
        RoomType.aggregate([
          {
            $match: {
              propertyUnitId,
              _id: { $in: reservationsRoomTypeIds },
            },
          },
          {
            $lookup: {
              from: "rooms",
              localField: "_id",
              foreignField: "roomTypeId",
              as: "TotalRoomDetails",
            },
          },
          { $unwind: "$TotalRoomDetails" },
          {
            $group: {
              _id: "$_id",
              rooms: { $push: "$TotalRoomDetails" },
              roomId: { $push: { $toString: "$TotalRoomDetails._id" } },
            },
          },
        ]),
        RoomMaintenance.aggregate([
          {
            $match: {
              $and: [
                { endDate: { $gt: assigncheckindate } },
                { startDate: { $lt: assigncheckoutdate } },
                { isCompleted: { $ne: true } },
                { propertyUnitId },
              ],
            },
          },
          {
            $lookup: {
              from: "rooms",
              localField: "roomId",
              foreignField: "_id",
              as: "RoomMaintainanceDetails",
            },
          },
          { $unwind: "$RoomMaintainanceDetails" },
          {
            $group: {
              _id: null,
              MaintainanceRoomId: {
                $push: { $toString: "$RoomMaintainanceDetails._id" },
              },
            },
          },
        ]),
        BookingControl.find({
          propertyUnitId,
          date: { $gte: assigncheckindate, $lte: assigncheckoutdate },
        }).lean(),
      ]);

      RoomMaintainanceDetails = RoomMaintainanceDetails[0];

      // Update TotalRooms with booking controls and maintenance
      BookingControlDetails.forEach((b) => {
        if (
          b.soldOut &&
          b.date >= assigncheckindate &&
          b.date < assigncheckoutdate
        ) {
          TotalRooms.forEach((r) => {
            r.rooms = r.rooms.filter(
              (room) => room._id.toString() !== b.roomId.toString()
            );
            r.roomId = r.roomId.filter((id) => id !== b.roomId);
          });
        }
      });

      TotalRooms.forEach((r) => {
        r.TotalRoom = r.rooms.length;
      });

      // Adjust room availability based on old reservations and maintenance
      for (let i = 0; i < TotalRooms.length; i++) {
        if (OldReservations.length > 0) {
          OldReservations.forEach((r) => {
            if (r.tantative && r.roomTypeId.equals(TotalRooms[i]._id)) {
              TotalRooms[i].TotalRoom -= 1;
            } else {
              const index = TotalRooms[i].roomId.indexOf(String(r.roomId));
              if (index > -1 && !r.tantative) {
                TotalRooms[i].rooms.splice(index, 1);
                TotalRooms[i].roomId.splice(index, 1);
                TotalRooms[i].TotalRoom -= 1;
              }
            }
          });
        }

        if (RoomMaintainanceDetails?.MaintainanceRoomId.length > 0) {
          RoomMaintainanceDetails.MaintainanceRoomId.forEach((id) => {
            const index = TotalRooms[i].roomId.indexOf(id);
            if (index > -1) {
              TotalRooms[i].rooms.splice(index, 1);
              TotalRooms[i].roomId.splice(index, 1);
              TotalRooms[i].TotalRoom -= 1;
            }
          });
        }
      }

      // Handle room reservations and locks
      for (let reservation of reservationsArray) {
        for (let r of TotalRooms) {
          if (String(r._id) === reservation.roomTypeId) {
            if (r.TotalRoom <= 0)
              throw prepareInternalError("Rooms not available");
            if (reservation.roomId == "assign") {
              delete reservation.roomId;
              reservation.tantative = true;
              r.TotalRoom -= 1;
              continue;
            }
            if (reservation.roomId && !r.roomId.includes(reservation.roomId)) {
              throw prepareInternalError("Selected room is not available");
            }
            if (reservation.roomId && r.roomId.includes(reservation.roomId)) {
              const AllocatedRoomLockResponse = await checkAndAllocateRoom(
                propertyUnitId,
                reservation.roomId,
                assigncheckindate,
                assigncheckoutdate
              );
              if (!AllocatedRoomLockResponse.isRoomAvailable) {
                throw prepareInternalError(
                  "The selected room is not available!"
                );
              }
              reservation.roomLockId = AllocatedRoomLockResponse.roomLockId;
              AllInsertedRoomLockIds.push(reservation.roomLockId);
              r.TotalRoom -= 1;
            }
          }
        }
      }

      // Save group reservation and related entries
      const groupData = new GroupReservation({
        ...groupDetails,
        propertyUnitId,
      });
      let customerDetails = new User({
        ...groupDetails,
        userType: UserTypesEnum.GUEST,
      });
      let customerAddress = new Address(groupDetails);
      customerDetails.addressId = customerAddress._id;
      groupData.customerId = customerDetails._id;

      let ReservationEntries = [];
      let ReservationDetailEntries = [];
      let RoomBalanceEntries = [];
      let UserEntries = [customerDetails];
      let AddressEntries = [customerAddress];
      let TransactionCodeEntries = [];
      let GuestTransactionEntries = [];

      // Handle reservations and guests
      for (let reservation of reservationsArray) {
        let reservationObj = new Reservation({
          ...reservation,
          propertyUnitId,
          groupId: groupData._id,
          arrival: groupData.arrival,
          departure: groupData.departure,
        });

        let reservationDetailObj = new ReservationDetail({
          ...reservation,
          reservationId: reservationObj._id,
          adults: reservation.adultOccupant + reservation.extraAdults,
          childs: reservation.childOccupant + reservation.extraChilds,
        });

        // Handle guests and guest transactions
        for (let [index, guest] of reservation.guests.entries()) {
          let guestObj, guestAddress;
          if (index === 0) {
            if (guest.isSameAsCustomer) {
              reservationObj.userId = customerDetails._id;
            } else {
              guestObj = new User({ ...guest, userType: UserTypesEnum.GUEST });
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
              guestObj = new User({ ...guest, userType: UserTypesEnum.GUEST });
              guestAddress = new Address(guest);
              guestObj.addressId = guestAddress._id;
              reservationObj.secondaryUserIds.push(guestObj._id);
              UserEntries.push(guestObj);
              AddressEntries.push(guestAddress);
            }
          }
        }
        reservationObj.confirmationNumber = await generateConfirmationNumber(
          propertyUnitId
        );
        ReservationEntries.push(reservationObj);
        ReservationDetailEntries.push(reservationDetailObj);

        // Handle date rates
        reservation.dateRate.forEach((rate) => {
          let rb = new RoomBalance({
            balanceDate: rate.date,
            reservationId: reservationObj._id,
            balance: -(
              rate.baseRate +
              reservation.extraAdults * rate.adultRate +
              reservation.extraChilds * rate.childRate
            ),
            roomId: reservationObj.roomId,
          });
          RoomBalanceEntries.push(rb);

          let rbtax = new RoomBalance({
            balanceDate: rate.date,
            reservationId: reservationObj._id,
            balanceName: BalanceNameEnum.TAX,
            balance:
              (-(
                rate.baseRate +
                reservation.extraAdults * rate.adultRate +
                reservation.extraChilds * rate.childRate
              ) *
                reservation.taxPercentage) /
              100,
            roomId: reservationObj.roomId,
          });
          RoomBalanceEntries.push(rbtax);
        });
      }

      let billing_account = new BillingAccount({
        billingAccountName: `${groupDetails.firstName} ${groupDetails.lastName}`,
        propertyUnitId,
        userId: customerDetails._id,
        groupId: groupData._id,
      });

      // Handle payments
      if (paymentEntries?.length > 0) {
        for (let payment of paymentEntries) {
          if (payment.paymentType === "cash") {
            let transactionCode = new TransactionCode({
              transactionCode: String(new ObjectId()),
              transactionType: "Reservation",
              transactionRate: payment.amount,
              transactionDetail: payment.remark,
              receipt: Math.floor(100000 + Math.random() * 900000),
              date: Date.now(),
            });

            let guestTransaction = new GuestTransaction({
              transactionCodeId: transactionCode._id,
              isDeposit: payment.deposit,
              transactionDate: Date.now(),
              userId: customerDetails._id,
              groupId: groupData._id,
              billingAccountId: billing_account._id,
            });

            TransactionCodeEntries.push(transactionCode);
            GuestTransactionEntries.push(guestTransaction);
            if (payment.deposit) {
              groupData.totalDeposit += payment.amount;
            } else {
              groupData.totalBalance += payment.amount;
              groupData.totalPayment += payment.amount;
            }
          }
        }
      }
      groupData.groupNumber = await generateGroupNumber(propertyUnitId);

      // // for live
      // try {
      //   console.log("Saving All data...");
      //   await Promise.all([
      //     groupData.save({ session }),
      //     Reservation.insertMany(ReservationEntries, { session }),
      //     ReservationDetail.insertMany(ReservationDetailEntries, { session }),
      //     RoomBalance.insertMany(RoomBalanceEntries, { session }),
      //     BillingAccount.insertMany([billing_account], { session }),
      //     User.insertMany(UserEntries, { session }),
      //     Address.insertMany(AddressEntries, { session }),
      //     TransactionCode.insertMany(TransactionCodeEntries, { session }),
      //     GuestTransaction.insertMany(GuestTransactionEntries, { session }),
      //   ]);
      // } catch (error) {
      //   console.error("Error saving All data :", error);
      //   throw error;
      // }

      //for debugging
      try {
        console.log("Saving group data...");
        await groupData.save({ session });
      } catch (error) {
        console.error("Error saving group data:", error);
        throw error;
      }

      try {
        console.log("Saving reservation entries...");
        await Reservation.insertMany(ReservationEntries, { session });
      } catch (error) {
        console.error("Error saving reservation entries:", error);
        throw error;
      }

      try {
        console.log("Saving reservation detail entries...");
        await ReservationDetail.insertMany(ReservationDetailEntries, {
          session,
        });
      } catch (error) {
        console.error("Error saving reservation detail entries:", error);
        throw error;
      }

      try {
        console.log("Saving room balance entries...");
        await RoomBalance.insertMany(RoomBalanceEntries, { session });
      } catch (error) {
        console.error("Error saving room balance entries:", error);
        throw error;
      }

      try {
        console.log("Saving billing account...");
        await BillingAccount.insertMany([billing_account], { session });
      } catch (error) {
        console.error("Error saving billing account:", error);
        throw error;
      }

      try {
        console.log("Saving user entries...");
        await User.insertMany(UserEntries, { session });
      } catch (error) {
        console.error("Error saving user entries:", error);
        throw error;
      }

      try {
        console.log("Saving address entries...");
        await Address.insertMany(AddressEntries, { session });
      } catch (error) {
        console.error("Error saving address entries:", error);
        throw error;
      }

      try {
        console.log("Saving transaction code entries...");
        await TransactionCode.insertMany(TransactionCodeEntries, { session });
      } catch (error) {
        console.error("Error saving transaction code entries:", error);
        throw error;
      }

      try {
        console.log("Saving guest transaction entries...");
        await GuestTransaction.insertMany(GuestTransactionEntries, { session });
      } catch (error) {
        console.error("Error saving guest transaction entries:", error);
        throw error;
      }

      data = groupData;
    });
    console.log("Transaction committed successfully");
    return res
      .status(201)
      .json(new ApiResponse(201, data, "Reservation created successfully"));
  } catch (error) {
    const DeallocatedRoomLocks = await deallocateMultipleRooms(
      AllInsertedRoomLockIds
    );
    console.log("Error in transaction:", error);
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
        groupReservationDetails?.[0],
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
