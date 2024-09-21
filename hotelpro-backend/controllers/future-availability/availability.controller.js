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
import {
  ReservationStatusEnum,
  RoomConditionEnum,
  RoomStatusEnum,
} from "../../constants.js";
const ObjectId = mongoose.Types.ObjectId;

const getDatesInRange = (startDate, endDate) => {
  const dates = [];
  const currentDate = new Date(startDate);

  while (currentDate <= new Date(endDate)) {
    dates.push(new Date(currentDate).toISOString());
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
};

const checkDateWiseRoomAvailability = async (
  startDate,
  endDate,
  propertyUnitId
) => {
  startDate = new Date(startDate);
  startDate.setUTCHours(0, 0, 0, 0);
  endDate = new Date(endDate);
  endDate.setUTCHours(0, 0, 0, 0);
  const dates = getDatesInRange(startDate, endDate);

  try {
    const [roomTypes, rooms, maintenanceRooms, reservedRooms] =
      await Promise.all([
        RoomType.find({ propertyUnitId }).select("_id roomTypeName"),
        RoomType.aggregate([
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
              as: "roomDetail",
            },
          },
          {
            $unwind: {
              path: "$roomDetail",
            },
          },
          {
            $project: {
              roomId: "$roomDetail._id",
              roomTypeId: "$_id",
            },
          },
        ]),
        RoomMaintenance.aggregate([
          {
            $match: {
              propertyUnitId: new ObjectId(propertyUnitId),
              startDate: { $lte: new Date(endDate) },
              endDate: { $gte: new Date(startDate) },
            },
          },
          {
            $project: {
              roomId: { $toString: "$roomId" },
              startDate: 1,
              endDate: 1,
            },
          },
        ]),
        Reservation.aggregate([
          {
            $match: {
              $and: [
                {
                  propertyUnitId: new ObjectId(propertyUnitId),
                },
                {
                  arrival: { $lte: new Date(endDate) },
                },
                {
                  departure: { $gte: new Date(startDate) },
                },
                {
                  $or: [
                    { reservationStatus: ReservationStatusEnum.RESERVED },
                    { reservationStatus: ReservationStatusEnum.INHOUSE },
                    { reservationStatus: ReservationStatusEnum.CHECKEDOUT },
                  ],
                },
              ],
            },
          },
          {
            $project: {
              roomId: { $toString: "$roomId" },
              arrival: 1,
              departure: 1,
            },
          },
        ]),
      ]);

    const availabilityByRoomType = roomTypes.map((roomType) => {
      const totalRoomsForType = rooms.filter((room) =>
        room.roomTypeId.equals(roomType._id)
      ).length;

      const occupancy = dates.map((date) => {
        let dayStart = new Date(date);

        const maintenanceRoomIds = maintenanceRooms
          .filter((m) => m.startDate <= dayStart && dayStart < m.endDate)
          .map((m) => m.roomId);

        const reservedRoomIds = reservedRooms
          .filter((r) => r.arrival <= dayStart && dayStart < r.departure)
          .map((r) => r.roomId);

        const unavailableRoomsForType = rooms.filter((room) => {
          return (
            maintenanceRoomIds.includes(room.roomId.toString()) ||
            reservedRoomIds.includes(room.roomId.toString())
          );
        }).length;

        return {
          Date: date,
          Available: totalRoomsForType - unavailableRoomsForType,
        };
      });

      return {
        _id: roomType._id,
        RoomTypeName: roomType.roomTypeName,
        TotalRoom: totalRoomsForType,
        Occupancy: occupancy,
      };
    });

    return availabilityByRoomType;
  } catch (error) {
    console.error("Error fetching date-wise room availability:", error);
    throw error;
  }
};

const readFutureAvailability = asyncHandler(async (req, res) => {
  let { startDate, endDate, propertyUnitId } = req.body;
  startDate = new Date(startDate);
  startDate.setUTCHours(0, 0, 0, 0);
  endDate = new Date(endDate);
  endDate.setUTCHours(0, 0, 0, 0);

  const availabilityData = await checkDateWiseRoomAvailability(
    startDate,
    endDate,
    propertyUnitId
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        availabilityData,
        "Room availability fetched successfully"
      )
    );
});

export default {
  readFutureAvailability,
};
