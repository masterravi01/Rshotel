/* eslint-disable no-constant-condition */
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import {
  Reservation,
  User,
  Notification,
} from "../../database/database.schema.js";
import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;
import { IsValidObjectId } from "../../utils/helpers.js";

// Define notification handler functions first
const reservationNotification = async (
  propertyUnitId,
  Entries,
  eventName,
  module,
  allUsers,
  createdUser
) => {
  try {
    if (!Entries || Entries.length === 0) return false; // Edge case for empty entries

    const notificationArray = Entries.map((item) => {
      let obj = {};
      if (eventName === "Reservation Created") {
        let rooms = item.reservationsArray.map((e) => {
          return {
            roomName: e.roomId,
            roomtype: e.roomtype,
            rateName: e.rateName,
          };
        });
        obj = {
          propertyUnitId,
          groupId: item._id,
          createdBy: createdUser._id,
          receiverIds: allUsers,
          module,
          eventName,
          message: JSON.stringify({
            customerName: item.firstName + " " + item.lastName,
            rooms,
            arrival: item.arrival,
            departure: item.departure,
            groupNumber: item.groupNumber,
          }),
        };
      } else if (eventName === "Rate Update") {
        obj = {
          propertyUnitId,
          groupId: item.groupId,
          createdBy: createdUser._id,
          receiverIds: allUsers,
          module,
          eventName,
          message: JSON.stringify({
            GuestName: item.GuestName,
            ReservationStatus: "RESERVED",
            RoomType: item.RoomType,
            RoomName: item.RoomName,
            Arrival: item.Arrival,
            Departure: item.Departure,
            NotificationType: "Reservation",
          }),
        };
      } else {
        obj = {
          propertyUnitId,
          groupId: item.groupId,
          createdBy: createdUser._id,
          receiverIds: allUsers,
          module,
          eventName,
          message: JSON.stringify({
            GuestName: item.GuestName,
            ReservationStatus: "RESERVED",
            RoomType: item.RoomType,
            RoomName: item.RoomName,
            Arrival: item.Arrival,
            Departure: item.Departure,
            NotificationType: "Reservation",
          }),
        };
      }
      return obj;
    });

    await Notification.insertMany(notificationArray);
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

const rateNotification = async (
  propertyUnitId,
  Entries,
  eventName,
  module,
  allUsers,
  createdUser
) => {
  try {
    if (!Entries || Entries.length === 0) return false;

    const notificationArray = Entries.map((item) => {
      let obj = {};
      if (eventName === "Rate Change") {
        obj = {
          propertyUnitId,
          createdBy: createdUser._id,
          receiverIds: allUsers,
          module,
          eventName,
          message: JSON.stringify({ rate: item.rate }),
        };
      } else if (eventName === "Rate Update") {
        obj = {
          propertyUnitId,
          createdBy: createdUser._id,
          receiverIds: allUsers,
          module,
          eventName,
          message: JSON.stringify({ rate: item.rate }),
        };
      } else {
        obj = {
          propertyUnitId,
          createdBy: createdUser._id,
          receiverIds: allUsers,
          module,
          eventName,
          message: JSON.stringify({ rate: item.rate }),
        };
      }
      return obj;
    });

    await Notification.insertMany(notificationArray);
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

const defaultNotification = async (
  propertyUnitId,
  Entries,
  eventName,
  module,
  allUsers,
  createdUser
) => {
  try {
    if (!Entries || Entries.length === 0) return false;

    const notificationArray = Entries.map((item) => {
      return {
        propertyUnitId,
        createdBy: createdUser._id,
        receiverIds: allUsers,
        module,
        eventName,
        message: JSON.stringify(item), // Adjust based on actual message structure
      };
    });

    await Notification.insertMany(notificationArray);
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

// Define notification handlers mapping after the functions are defined
const notificationHandlers = {
  RESERVATION: reservationNotification,
  RATE: rateNotification,
  DEFAULT: defaultNotification,
};

const readNotification = asyncHandler(async (req, res) => {
  const { propertyUnitId, viewAll } = req.body;
  let matchquerry = {
    propertyUnitId: new ObjectId(propertyUnitId),
    receiverIds: { $in: [req.user._id] },
    readBy: { $not: { $in: [req.user._id] } },
  };
  if (viewAll) {
    delete matchquerry.readBy;
  }
  const notifications = await Notification.aggregate([
    {
      $match: matchquerry,
    },
    {
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        as: "createdUser",
      },
    },
    {
      $unwind: {
        path: "$createdUser",
      },
    },
    {
      $addFields: {
        createdUserName: {
          $concat: ["$createdUser.firstName", " ", "$createdUser.lastName"],
        },
      },
    },
    {
      $project: {
        createdUser: 0, // Exclude the createdUser field
      },
    },
    { $sort: { createdAt: 1 } },
    { $limit: 20 },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        notifications,
        "All Notifications retrieved successfully!"
      )
    );
});

const sendNotification = async (
  propertyUnitId,
  Entries,
  eventName = "",
  module = "DEFAULT",
  createdUser
) => {
  try {
    propertyUnitId = IsValidObjectId(propertyUnitId)
      ? propertyUnitId
      : new ObjectId(propertyUnitId);

    // Fetch all users related to the property
    let allUsers = await User.find(
      {
        propertyUnitId,
        $or: [{ reservationStatus: "frontdesk" }, { userType: "client" }],
      },
      { _id: 1 }
    );

    allUsers = allUsers.map((user) => user._id);

    if (allUsers.length === 0) return false; // Handle case where no users are found

    // Use the handler based on the module type or fallback to DEFAULT
    const handler =
      notificationHandlers[module] && eventName
        ? notificationHandlers[module]
        : notificationHandlers.DEFAULT;
    // Call the selected handler
    await handler(
      propertyUnitId,
      Entries,
      eventName,
      module,
      allUsers,
      createdUser
    );

    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

const updateNotification = asyncHandler(async (req, res) => {
  const { ids } = req.body;

  const updated = await Notification.updateMany(
    { _id: { $in: ids } },
    { $push: { readBy: req.user._id } }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updated, "Notifications updated successfully!"));
});

export default {
  sendNotification,
  readNotification,
  updateNotification,
};
