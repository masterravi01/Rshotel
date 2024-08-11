import mongo from "../../database/database.service.js";
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
import { RoomConditionEnum, RoomStatusEnum } from "../../constants.js";
const ObjectId = mongoose.Types.ObjectId;

// GET all room maintenance
const getRoomMaintenance = asyncHandler(async (req, res) => {
  let { startDate, endDate, PropertyUnitId } = req.body;
  let data = {};
  startDate = new Date(startDate);
  startDate.setUTCHours(0, 0, 0, 0);
  endDate = new Date(endDate);
  endDate.setUTCHours(0, 0, 0, 0);

  let [Rooms, reservation, roommaintainance] = await Promise.all([
    RoomType.aggregate([
      {
        $match: {
          propertyUnitId: new ObjectId(PropertyUnitId),
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
        $unwind: "$rooms",
      },
      {
        $project: {
          RoomId: "$rooms._id",
          RoomType: "$roomTypeName",
          RoomNumber: "$rooms.roomNumber",
          RoomName: "$rooms.roomName",
          RoomStatus: "$rooms.roomStatus",
          RoomCondition: "$rooms.roomCondition",
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
                $gt: startDate,
              },
            },
            {
              Arrival: {
                $lt: endDate,
              },
            },
            {
              propertyUnitId: new ObjectId(PropertyUnitId),
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
              endDate: {
                $gt: startDate,
              },
            },
            {
              startDate: {
                $lt: endDate,
              },
            },
            {
              propertyUnitId: new ObjectId(PropertyUnitId),
            },
          ],
        },
      },
    ]),
  ]);

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
      if (s.roomId.toString() == data.Rooms[i].RoomId.toString()) {
        s.RoomNumber = data.Rooms[i].RoomNumber;
        s.RoomName = data.Rooms[i].RoomName;
        s.RoomType = data.Rooms[i].RoomType;
        data.Rooms[i].RoomMaintainance.push(s);
      }
    });
  }
  return res
    .status(200)
    .json(new ApiResponse(200, data, "All room types retrieved successfully"));
});

// POST create a new room maintenance
const createRoomMaintenance = asyncHandler(async (req, res) => {
  let { RoomMaintainance } = req.body;
  let data = {};
  let updateRoomEntries = [];

  for (let i = 0; i < RoomMaintainance.length; i++) {
    if (RoomMaintainance[i].today === RoomMaintainance[i].startDate) {
      updateRoomEntries.push(
        mongo.bulkwriteupdateone(
          { _id: RoomMaintainance[i].roomId },
          {
            RoomStatus: RoomStatusEnum.MAINTENANCE,
            RoomCondition: RoomConditionEnum.DIRTY,
          }
        )
      );
    }
  }

  await Promise.all([
    RoomMaintenance.insertMany(RoomMaintainance),
    Room.bulkWrite(updateRoomEntries),
  ]);

  return res
    .status(201)
    .json(new ApiResponse(201, data, "Room Maintenance added successfully!"));
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

// GET all room maintenance
const getAvailableRoomForDateRange = asyncHandler(async (req, res) => {
  let { startDate, endDate, PropertyUnitId } = req.body;
  let data = {};

  let [ReservationDetails, TotalRooms, RoomMaintainanceDetails] =
    await Promise.all([
      Reservation.aggregate([
        {
          $match: {
            $and: [
              {
                Departure: {
                  $gt: startDate,
                },
              },
              {
                Arrival: {
                  $lte: endDate,
                },
              },
              {
                propertyUnitId: new ObjectId(PropertyUnitId),
              },
              {
                $or: [
                  {
                    ReservationStatus: "In house",
                  },
                  {
                    ReservationStatus: "Reserved",
                  },
                ],
              },
            ],
          },
        },
        {
          $lookup: {
            from: "rooms",
            localField: "RoomId",
            foreignField: "_id",
            as: "Rooms",
          },
        },
        {
          $unwind: "$Rooms",
        },
        {
          $lookup: {
            from: "room_types",
            localField: "Rooms.RoomTypeId",
            foreignField: "_id",
            as: "RoomType",
          },
        },
        {
          $unwind: "$RoomType",
        },
        {
          $project: {
            RoomId: 1,
            Tantative: 1,
            RoomType: 1,
            Arrival: 1,
            Departure: 1,
          },
        },
      ]),
      RoomType.aggregate([
        {
          $match: {
            propertyUnitId: new ObjectId(PropertyUnitId),
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
        {
          $unwind: "$TotalRoomDetails",
        },
        {
          $group: {
            _id: "$roomTypeName",
            RoomTypeId: { $first: "$_id" },
            rooms: {
              $push: "$TotalRoomDetails",
            },
            Roomid: {
              $push: {
                $convert: {
                  input: "$TotalRoomDetails._id",
                  to: "string",
                },
              },
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
        {
          $project: {
            _id: 1,
            rooms: 1,
            Roomid: 1,
            DateRate: [],
            roomtype: "$_id",
            RoomTypeId: 1,
            TotalRoom: {
              $size: "$rooms",
            },
          },
        },
      ]),
      RoomMaintenance.aggregate([
        {
          $match: {
            $and: [
              {
                endDate: {
                  $gt: startDate,
                },
              },
              {
                startDate: {
                  $lt: endDate,
                },
              },
              {
                propertyUnitId: new ObjectId(PropertyUnitId),
              },
              {
                Completed: { $ne: true },
              },
            ],
          },
        },
        {
          $lookup: {
            from: "rooms",
            localField: "RoomId",
            foreignField: "_id",
            as: "RoomMaintainanceDetails",
          },
        },
        {
          $unwind: "$RoomMaintainanceDetails",
        },
        {
          $group: {
            _id: null,
            MaintainanceRoomId: {
              $push: {
                $convert: {
                  input: "$RoomMaintainanceDetails._id",
                  to: "string",
                },
              },
            },
          },
        },
      ]),
    ]);

  RoomMaintainanceDetails = RoomMaintainanceDetails[0];
  for (var i = 0; i < TotalRooms.length; i++) {
    if (ReservationDetails != null && ReservationDetails.length > 0) {
      ReservationDetails.forEach((r) => {
        index = TotalRooms[i].Roomid.indexOf(String(r.RoomId[0]));
        if (
          index > -1 &&
          (r.Tantative == false ||
            r.Tantative == undefined ||
            r.Tantative == null)
        ) {
          TotalRooms[i].rooms.splice(index, 1);
          TotalRooms[i].Roomid.splice(index, 1);
        }
        if (index > -1 && r.Tantative == true) {
          TotalRooms[i].rooms[index].Tantative = r.Tantative;
        }
      });
    }

    if (
      RoomMaintainanceDetails != null &&
      RoomMaintainanceDetails.MaintainanceRoomId.length > 0
    ) {
      RoomMaintainanceDetails.MaintainanceRoomId.forEach((id) => {
        index = TotalRooms[i].Roomid.indexOf(id);
        if (index > -1) {
          console.log(index);
          TotalRooms[i].rooms.splice(index, 1);
          TotalRooms[i].Roomid.splice(index, 1);
        }
      });
    }
  }

  data.RoomTypes = TotalRooms;

  return res
    .status(200)
    .json(new ApiResponse(200, data, "All room types retrieved successfully"));
});

export default {
  getRoomMaintenance,
  createRoomMaintenance,
  updateRoomMaintenance,
  deleteRoomMaintenance,
  updateRoomMaintenanceRange,
  getAvailableRoomForDateRange,
};
