import mongoose from "mongoose";
import mongo from "../../database/database.service.js";
import bcrypt from "bcrypt";

import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { UserTypesEnum, SALT_WORK_FACTOR } from "../../constants.js";

import {
  HousekeepingTask,
  HousekeepingAssign,
  RoomType,
  Room,
  User,
  housekeeperWorkerShift,
} from "../../database/database.schema.js";

const ObjectId = mongoose.Types.ObjectId;

const createHouseKeeper = asyncHandler(async (req, res) => {
  let { propertyUnitId, firstName, lastName, email, phone, schedule } =
    req.body;
  let data = {};

  const existedUser = await User.findOne({
    email,
  });

  if (existedUser) {
    throw new ApiError(409, "User with email is already exists", []);
  }

  let password = Math.random().toString(36).slice(-6);
  password = bcrypt.hashSync(password, SALT_WORK_FACTOR);
  let housekeeper = {
    propertyUnitId,
    firstName,
    lastName,
    password,
    email,
    phone,
    isLoginable: true,
    userType: UserTypesEnum.HOUSEKEEPER,
  };

  let user_details = new User(housekeeper);
  schedule = schedule.map((s) => {
    s.housekeeperId = user_details._id;
    return s;
  });

  await Promise.all([
    housekeeperWorkerShift.insertMany(schedule),
    mongo.insertIntoCollection(user_details),
  ]);
  data.HouseKeeper = housekeeper;

  return res
    .status(200)
    .json(new ApiResponse(200, data, "House Keeper Added Successfully"));
});

const getHouseKeeper = asyncHandler(async (req, res) => {
  let { propertyUnitId } = req.body;
  let data = {};

  data.housekeeper_details = await User.aggregate([
    {
      $match: {
        propertyUnitId: new ObjectId(propertyUnitId),
        userType: "housekeeper",
      },
    },
    {
      $project: {
        housekeeperName: {
          $concat: ["$firstName", " ", "$lastName"],
        },
        active: "$isLoginable",
      },
    },
    {
      $addFields: {
        assignedRoom: 0,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, data, "House Keeper Added Successfully"));
});

const deleteHouseKeeper = asyncHandler(async (req, res) => {
  let { housekeeperId, active } = req.body;

  await User.updateOne(
    {
      _id: housekeeperId,
    },
    {
      isLoginable: active,
    }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "House Keeper Updated Successfully"));
});

const getRoomsWithHouseKeeping = asyncHandler(async (req, res) => {
  let { propertyUnitId } = req.body;
  let data = {};

  data.RoomDetails = await RoomType.aggregate([
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
        as: "RoomDetails",
      },
    },
    {
      $unwind: {
        path: "$RoomDetails",
      },
    },
    {
      $lookup: {
        from: "housekeepingtasks",
        localField: "RoomDetails._id",
        foreignField: "roomId",
        as: "houseKeepingTaskDetails",
        pipeline: [
          {
            $match: {
              isCompleted: false,
            },
          },
        ],
      },
    },
    {
      $unwind: {
        path: "$houseKeepingTaskDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "houseKeepingTaskDetails.housekeeperId",
        foreignField: "_id",
        as: "housekeeper",
      },
    },
    {
      $unwind: {
        path: "$housekeeper",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: "$RoomDetails._id",
        roomNumber: "$RoomDetails.roomNumber",
        roomName: "$RoomDetails.roomName",
        roomType: "$roomTypeName",
        roomCondition: "$RoomDetails.roomCondition",
        roomStatus: "$RoomDetails.roomStatus",
        taskName: "$houseKeepingTaskDetails.taskName",
        isCompleted: "$houseKeepingTaskDetails.isCompleted",
        housekeeperId: "$HouseKeeperDetails._id",
        housekeeperName: {
          $concat: ["$housekeeper.firstName", " ", "$housekeeper.lastName"],
        },
        notes: "$houseKeepingTaskDetails.taskDescription",
      },
    },
    { $addFields: { Show: true } },
    {
      $sort: {
        roomType: 1,
        roomNumber: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        data,
        "All housekeeping tasks retrieved successfully"
      )
    );
});

const updateRoomsWithHouseKeeping = asyncHandler(async (req, res) => {
  let { RoomDetails } = req.body;
  let updateRoomEntries = [];

  for (let j = 0; j < RoomDetails.length; j++) {
    updateRoomEntries.push(
      mongo.bulkwriteupdateone(
        { _id: new ObjectId(RoomDetails[j]._id) },
        {
          roomCondition: RoomDetails[j].roomCondition,
        }
      )
    );

    // if (RoomDetails[j].housekeeperId) {
    //   let housekeeping_detail = {};
    //   housekeeping_detail.housekeeperId = RoomDetails[j].housekeeperId;
    //   housekeeping_detail.roomId = RoomDetails[j]._id;
    //   housekeeping_detail.taskDescription = RoomDetails[j].Remarks;
    //   housekeeping_detail.taskName = RoomDetails[j].taskName;
    //   if (RoomDetails[j].HouseKeeperRoomDetailsId) {
    //     await mongo.updateCollection(
    //       HousekeepingTask,
    //       {
    //         _id: new ObjectId(RoomDetails[j].HouseKeeperRoomDetailsId),
    //       },
    //       housekeeping_detail
    //     );
    //   } else {
    //     housekeeping_detail = new HousekeepingTask(housekeeping_detail);
    //     await mongo.insertIntoCollection(housekeeping_detail);
    //   }
    // }
  }

  await Promise.all([Room.bulkWrite(updateRoomEntries)]);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Housekeeping task updated successfully"));
});

// POST create a new housekeeping task
const createHouseKeepingTask = asyncHandler(async (req, res) => {
  const {
    housekeeper: housekeeperId,
    propertyUnitId,
    rooms: roomIds,
    taskName,
    notes: taskDescription,
  } = req.body;

  let taskAssignEntries = [];
  for (let a of roomIds) {
    taskAssignEntries.push({
      roomId: a.item_id,
      propertyUnitId,
      housekeeperId,
      taskName,
      taskDescription,
    });
  }

  await HousekeepingTask.insertMany(taskAssignEntries);

  return res
    .status(201)
    .json(new ApiResponse(201, {}, "Housekeeping task assigned successfully"));
});

export default {
  createHouseKeeper,
  getHouseKeeper,
  deleteHouseKeeper,
  getRoomsWithHouseKeeping,
  updateRoomsWithHouseKeeping,
  createHouseKeepingTask,
};
