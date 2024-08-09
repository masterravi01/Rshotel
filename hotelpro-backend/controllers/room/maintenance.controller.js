import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import {
  RoomType,
  Room,
  Reservation,
  RoomMaintenance,
} from "../../database/database.schema.js";
import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;

// GET all room maintenance
const getRoomMaintenance = asyncHandler(async (req, res) => {
  let body = req.body;
  let data = {};

  let StartDate = new Date(body.StartDate);
  let EndDate = new Date(body.EndDate);

  let [Rooms, reservation, roommaintainance] = await Promise.all([
    RoomType.aggregate([
      {
        $match: {
          PropertyUnitId: ObjectId(body.PropertyUnitId),
        },
      },
      {
        $lookup: {
          from: "rooms",
          localField: "_id",
          foreignField: "RoomTypeId",
          as: "rooms",
        },
      },
      {
        $unwind: "$rooms",
      },
      {
        $project: {
          RoomId: "$rooms._id",
          RoomType: "$RoomTypeName",
          RoomNumber: "$rooms.RoomNumber",
          RoomName: "$rooms.RoomName",
          RoomStatus: "$rooms.RoomStatus",
          RoomCondition: "$rooms.RoomCondition",
          Smoking: "$rooms.Smoking",
          Pets: "$rooms.Pets",
          Handcapped: "$rooms.Handcapped",
          Reservation: [],
          RoomMaintainance: [],
        },
      },
      {
        $sort: {
          RoomNumber: 1,
        },
      },
    ]),
    Reservation.aggregate([
      {
        $match: {
          $and: [
            {
              Departure: {
                $gt: StartDate,
              },
            },
            {
              Arrival: {
                $lt: EndDate,
              },
            },
            {
              PropertyUnitId: ObjectId(body.PropertyUnitId),
            },
            {
              $or: [
                { ReservationStatus: "In house" },
                { ReservationStatus: "Reserved" },
                { ReservationStatus: "Checked out" },
              ],
            },
          ],
        },
      },
      {
        $lookup: {
          from: "guest_room_details",
          localField: "_id",
          foreignField: "ReservationId",
          as: "guest_room_details",
        },
      },
      {
        $unwind: "$guest_room_details",
      },
      {
        $lookup: {
          from: "users",
          localField: "guest_room_details.UserId",
          foreignField: "_id",
          as: "users",
        },
      },
      {
        $unwind: "$users",
      },
      {
        $lookup: {
          from: "room_balances",
          localField: "guest_room_details.RoomId",
          foreignField: "RoomId",
          as: "RoomBalanceDetails",
        },
      },
      {
        $unwind: "$RoomBalanceDetails",
      },
      {
        $match: {
          $expr: {
            $eq: [
              "$guest_room_details.ReservationId",
              "$RoomBalanceDetails.ReservationId",
            ],
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          Arrival: {
            $first: "$Arrival",
          },
          Departure: {
            $first: "$Departure",
          },
          Nights: { $first: "$Nights" },
          RoomId: { $first: "$guest_room_details.RoomId" },
          Tantative: { $first: "$Tantative" },
          Tantative: { $first: "$Tantative" },
          LockRoom: { $first: "$LockRoom" },
          ReservationStatus: { $first: "$ReservationStatus" },
          GuestName: {
            $first: {
              $concat: ["$users.Name.First", " ", "$users.Name.Last"],
            },
          },
          Balance: { $sum: "$RoomBalanceDetails.Balance" },
          EstimatedCost: { $first: "$guest_room_details.SharedRoomCharges" },
          Version: { $first: "$Version" },
        },
      },
    ]),
    RoomMaintenance.aggregate([
      {
        $match: {
          $and: [
            {
              EndDate: {
                $gt: StartDate,
              },
            },
            {
              StartDate: {
                $lt: EndDate,
              },
            },
            {
              PropertyUnitId: ObjectId(body.PropertyUnitId),
            },
          ],
        },
      },
    ]),
  ]);
  for (let r of roommaintainance) {
    let u = await User.findOne({ _id: r.RoomUserId });
    if (u != null) {
      r.email = u.Email;
    }
  }

  data.Rooms = Rooms;
  for (var i = 0; i < data.Rooms.length; i++) {
    reservation.forEach((s) => {
      if (s.Version.length > 1 && s.ReservationStatus != "Reserved") {
        s.Version.forEach((v) => {
          if (v.RoomChanged == true && v.Checked != true) {
            let obj = { ...s };
            obj.Departure = new Date(v.Date);
            s.Arrival = new Date(v.Date);
            v.Checked = true;
            for (var k = 0; k < data.Rooms.length; k++) {
              if (v.OldRoomId == data.Rooms[k].RoomId.toString()) {
                delete obj.Version;
                obj.GuestName += " →";
                data.Rooms[k].Reservation.push(obj);
              }
            }
          }
        });
      }

      if (s.RoomId.toString() == data.Rooms[i].RoomId.toString()) {
        s.RoomNumber = data.Rooms[i].RoomNumber;
        s.RoomName = data.Rooms[i].RoomName;
        s.RoomType = data.Rooms[i].RoomType;
        s.Version = [];
        data.Rooms[i].Reservation.push(s);
      }
    });
    roommaintainance.forEach((s) => {
      if (s.RoomId.toString() == data.Rooms[i].RoomId.toString()) {
        s.RoomNumber = data.Rooms[i].RoomNumber;
        s.RoomName = data.Rooms[i].RoomName;
        s.RoomType = data.Rooms[i].RoomType;
        data.Rooms[i].RoomMaintainance.push(s);
      }
    });
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, roomTypes, "All room types retrieved successfully")
    );
});

// POST create a new room maintenance
const createRoomMaintenance = asyncHandler(async (req, res) => {
  const { roomTypes } = req.body;
  const { propertyUnitId } = req.params;
  for (let r of roomTypes) {
    r.propertyUnitId = propertyUnitId;
  }
  await RoomType.insertMany(roomTypes);

  return res
    .status(201)
    .json(new ApiResponse(201, roomTypes, "Room types created successfully"));
});

// PUT update a room maintenance
const updateRoomMaintenance = asyncHandler(async (req, res) => {
  const { roomTypeId } = req.params;
  const {
    roomTypeName,
    active,
    roomTypeCategory,
    description,
    images,
    adultOccupancy,
    childOccupancy,
  } = req.body;

  const roomType = await RoomType.findByIdAndUpdate(
    roomTypeId,
    {
      roomTypeName,
      active,
      roomTypeCategory,
      description,
      images,
      adultOccupancy,
      childOccupancy,
    },
    { new: true }
  );

  if (!roomType) {
    throw new ApiError(404, "Room type not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, roomType, "Room type updated successfully"));
});

// DELETE a room maintenance
const deleteRoomMaintenance = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const roomType = await RoomType.findByIdAndDelete(id);
  if (!roomType) {
    throw new ApiError(404, "Room type not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, { id }, "Room type deleted successfully"));
});

const updateRoomMaintenanceRange = asyncHandler(async (req, res) => {
  const {
    roomTypeName,
    active,
    roomTypeCategory,
    description,
    adultOccupancy,
    childOccupancy,
    totalrooms,
    rooms,
  } = req.body;
  const { propertyUnitId } = req.params;

  // Create the room type
  const newRoomType = new RoomType({
    roomTypeName,
    active,
    roomTypeCategory,
    description,
    adultOccupancy,
    childOccupancy,
    totalrooms,
    propertyUnitId,
  });

  await newRoomType.save();

  // Create the rooms
  const roomDocuments = [];
  let totalCount = 0;

  rooms.forEach((room) => {
    const { prefix, start, end } = room;
    for (let i = start; i <= end; i++) {
      roomDocuments.push({
        roomName: `${prefix}${i}`,
        roomNumber: i.toString(),
        roomTypeId: newRoomType._id,
        roomStatus: "vacant",
        roomCondition: "clean",
        dnd: false,
      });
      totalCount++;
    }
  });

  // Validate room count
  if (totalCount !== totalrooms) {
    return res
      .status(400)
      .json(
        new ApiResponse(
          400,
          null,
          "Total rooms do not match the sum of the ranges"
        )
      );
  }

  await Room.insertMany(roomDocuments);

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { newRoomType, roomDocuments },
        "Room type and rooms created successfully"
      )
    );
});

export default {
  getRoomMaintenance,
  createRoomMaintenance,
  updateRoomMaintenance,
  deleteRoomMaintenance,
  updateRoomMaintenanceRange,
};
