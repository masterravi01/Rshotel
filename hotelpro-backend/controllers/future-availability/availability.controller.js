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
    dates.push(new Date(currentDate).toISOString().split("T")[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
};

const checkDateWiseRoomAvailability = async (
  startDate,
  endDate,
  propertyUnitId
) => {
  const dates = getDatesInRange(startDate, endDate);

  try {
    const [roomTypes, rooms, maintenanceRooms, reservedRooms] =
      await Promise.all([
        RoomType.find({ propertyUnitId }).select("_id roomTypeName"),
        Room.find({ propertyUnitId }).select("_id roomTypeId roomStatus"),
        RoomMaintenance.find({
          propertyUnitId,
          $or: [
            {
              startDate: { $lte: new Date(endDate) },
              endDate: { $gte: new Date(startDate) },
            },
          ],
        }).select("roomId startDate endDate"),
        Reservation.find({
          propertyUnitId,
          $or: [
            {
              arrival: { $lte: new Date(endDate) },
              departure: { $gte: new Date(startDate) },
            },
          ],
        }).select("roomId arrival departure"),
      ]);

    const availabilityData = [];

    for (const date of dates) {
      let dayStart = new Date(date);
      let dayEnd = new Date(date);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const maintenanceRoomIds = maintenanceRooms
        .filter((m) => m.startDate <= dayEnd && m.endDate > dayStart)
        .map((m) => m.roomId);

      const reservedRoomIds = reservedRooms
        .filter((r) => r.arrival <= dayEnd && r.departure > dayStart)
        .map((r) => r.roomId);

      const availabilityByRoomType = roomTypes.map((roomType) => {
        const totalRoomsForType = rooms.filter((room) =>
          room.roomTypeId.equals(roomType._id)
        ).length;
        const unavailableRoomsForType = rooms.filter(
          (room) =>
            room.roomTypeId.equals(roomType._id) &&
            (maintenanceRoomIds.includes(room._id) ||
              reservedRoomIds.includes(room._id))
        ).length;

        return {
          roomTypeName: roomType.roomTypeName,
          totalAvailableRoom: totalRoomsForType - unavailableRoomsForType,
        };
      });

      availabilityData.push({
        date: date,
        availabilityByRoomType,
      });
    }

    return availabilityData;
  } catch (error) {
    console.error("Error fetching date-wise room availability:", error);
    throw error;
  }
};

const readFutureAvailability = asyncHandler(async (req, res) => {
  let { startDate, endDate, propertyUnitId } = req.body;
  let data = {};
  startDate = new Date(startDate);
  startDate.setUTCHours(0, 0, 0, 0);
  endDate = new Date(endDate);
  endDate.setUTCHours(0, 0, 0, 0);

  data.availabilityData = await checkDateWiseRoomAvailability(
    startDate,
    endDate,
    propertyUnitId
  );
  return res
    .status(200)
    .json(new ApiResponse(200, data, "Room maintenance fetch successfully"));
});

export default {
  readFutureAvailability,
};
