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

const readNotification = asyncHandler(async (req, res) => {
  const { propertyUnitId } = req.body;
  const notifications = await Notification.aggregate([
    {
      $match: {
        propertyUnitId: new ObjectId(propertyUnitId),
        receiverIds: { $in: [req.user._id] },
        readBy: { $not: { $in: [req.user._id] } },
      },
    },

    { $sort: { createdAt: 1 } },
    {
      $limit: 20,
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        notifications,
        "All Notifications retrieved successfully !"
      )
    );
});

const sendNotification = async (
  propertyUnitId,
  Entries,
  eventName = "Create Reservation",
  module = "RESERVATION",
  createdUser
) => {
  try {
    propertyUnitId = IsValidObjectId(propertyUnitId)
      ? propertyUnitId
      : new ObjectId(propertyUnitId);

    let allUsers = await User.find(
      {
        propertyUnitId,
        $or: [{ reservationStatus: "frontdesk" }, { userType: "client" }],
      },
      { _id: 1 }
    );
    allUsers.map((user) => user._id);
    if (module == "RESERVATION") {
      await reservationNotification(
        propertyUnitId,
        Entries,
        eventName,
        module,
        allUsers,
        createdUser
      );
    } else if (module == "RATE") {
      await rateNotification(
        propertyUnitId,
        Entries,
        eventName,
        module,
        allUsers,
        createdUser
      );
    } else {
      await defaultNotification(
        propertyUnitId,
        Entries,
        eventName,
        module,
        allUsers,
        createdUser
      );
    }

    return propertyUnitId;
  } catch (err) {
    console.log(err);
    return false;
  }
};

const reservationNotification = async (
  propertyUnitId,
  Entries,
  eventName,
  module,
  allUsers,
  createdUser
) => {
  try {
    let notificationArray = [];
    if ((eventName = "Create Reservation")) {
      console.log("hii");
      Entries.forEach((item) => {
        let notificationObj = new Notification();
        notificationObj.propertyUnitId = propertyUnitId;
        notificationObj.groupId = item.groupId;
        notificationObj.createdBy = createdUser._id;
        notificationObj.receiverIds = allUsers;
        notificationObj.module = module;
        notificationObj.eventName = eventName;
        notificationObj.message = {
          GuestName: "item.GuestName",
          ReservationStatus: "RESERVED",
          RoomType: "item.RoomType",
          RoomName: "item.RoomName",
          Arrival: "item.Arrival",
          Departure: "item.Departure",
          NotificationType: "Reservation",
        };
        notificationObj.message = JSON.stringify(notificationObj.message);
        notificationArray.push(notificationObj);
      });
    }
    await Notification.insertMany(notificationArray);
    return true;
  } catch (err) {
    console.log(err);
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
    let notificationArray = [];
    if ((eventName = "Rate Change")) {
      Entries.forEach((item) => {
        let notificationObj = new Notification();
        notificationObj.propertyUnitId = propertyUnitId;
        notificationObj.createdBy = createdUser._id;
        notificationObj.receiverIds = allUsers;
        notificationObj.module = module;
        notificationObj.eventName = eventName;
        let message = {
          rate: item.rate,
        };
        notificationObj.message = JSON.stringify(message);
        notificationArray.push(notificationObj);
      });
    }
    await Notification.insertMany(notificationArray);
    return true;
  } catch (err) {
    console.log(err);
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
    let notificationArray = [];

    Entries.forEach((item) => {
      let notificationObj = new Notification();
      notificationObj.propertyUnitId = propertyUnitId;
      notificationObj.createdBy = createdUser._id;
      notificationObj.receiverIds = allUsers;
      notificationObj.module = module;
      notificationObj.eventName = eventName;
      notificationObj.message = {
        rate: item.rate,
      };
      notificationObj.message = JSON.stringify(notificationObj.message);
      notificationArray.push(notificationObj);
    });

    await Notification.insertMany(notificationArray);
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

export default {
  sendNotification,
  readNotification,
};
