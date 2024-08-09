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
} from "../../database/database.schema.js";
import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;
import { UserTypesEnum } from "../../constants.js";

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
  const { groupDetails, reservationsArray } = req.body;
  let ReservationEntries = [];
  let ReservationDetailEntries = [];
  let UserEntries = [];
  let AddressEntries = [];
  let RoomBalanceEntries = [];

  const groupData = new GroupReservation(groupDetails);
  let customerDetails = new User(groupDetails);
  customerDetails.userType = UserTypesEnum.GUEST;
  let customerAddress = new Address(groupDetails);
  customerDetails.addressId = customerAddress._id;

  UserEntries.push(customerDetails);
  AddressEntries.push(customerAddress);

  for (let reservation of reservationsArray) {
    let reservationObj = new Reservation(reservation);
    reservationObj.propertyUnitId = groupData.propertyUnitId;
    reservationObj.arrival = groupData.arrival;
    reservationObj.departure = groupData.departure;
    reservationObj.groupId = groupData._id;

    let reservationDetailObj = new ReservationDetail(reservation);
    reservationDetailObj.reservationId = reservationObj._id;
    reservationDetailObj.adults = reservationObj.adultOccupant;
    reservationDetailObj.childs = reservationObj.childOccupant;
    ReservationDetailEntries.push(reservationDetailObj);
    reservation.guests.forEach((guest, index) => {
      if (index === 0) {
        if (guest.isSameAsCustomer) {
          reservationObj.userId = customerDetails._id;
        } else {
          let guestObj = new User(guest);
          guestObj.userType = UserTypesEnum.GUEST;
          let guestAddress = new Address(guest);
          guestObj.addressId = guestAddress._id;
          reservationObj.userId = guestObj._id;
          UserEntries.push(guestObj);
          AddressEntries.push(guestAddress);
        }
      } else {
        if (guest.isSameAsCustomer) {
          reservationObj.secondaryUserIds.push(customerDetails._id);
        } else {
          let guestObj = new User(guest);
          guestObj.userType = UserTypesEnum.GUEST;
          let guestAddress = new Address(guest);
          guestObj.addressId = guestAddress._id;
          reservationObj.secondaryUserIds.push(customerDetails._id);
          UserEntries.push(guestObj);
          AddressEntries.push(guestAddress);
        }
      }
    });
    reservation.dateRate.forEach((rate, index) => {
      let rb = new RoomBalance(rate);
      rb.balanceDate = rate.date;
      rb.reservationId = reservationObj._id;
      rb.balance = -rate.baseRate;
      rb.roomId = reservationObj.roomId;
      RoomBalanceEntries.push(rb);
    });
    ReservationEntries.push(reservationObj);
    await Promise.all([
      groupData.save(),
      User.insertMany(UserEntries),
      Address.insertMany(AddressEntries),
      Reservation.insertMany(ReservationEntries),
      RoomBalance.insertMany(RoomBalanceEntries),
      ReservationDetail.insertMany(ReservationDetailEntries),
    ]);
  }
  return res
    .status(201)
    .json(new ApiResponse(201, {}, "Reservation created successfully"));
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

export default {
  getAllReservations,
  getReservationById,
  createReservation,
  updateReservationById,
  deleteReservationById,
  readReservationRate,
};
