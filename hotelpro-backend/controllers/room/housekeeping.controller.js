import mongoose from "mongoose";
import mongo from "../../database/database.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import {
  HousekeepingTask,
  HousekeepingAssign,
  RoomType,
  Room,
  User,
} from "../../database/database.schema.js";
import { UserTypesEnum } from "../../constants.js";

const ObjectId = mongoose.Types.ObjectId;

const createHouseKeeper = asyncHandler(async (req, res) => {
  let { propertyUnitId, firstName, lastName, email, phone, Schedule } =
    req.body;
  let data = {};
  let password = Math.random().toString(36).slice(-6);
  password = bcrypt.hashSync(password, SALT_WORK_FACTOR);
  let user = {
    propertyUnitId,
    firstName,
    lastName,
    password,
    email,
    phone,
    IsLoginAble: true,
    userType: UserTypesEnum.HOUSEKEEPER,
  };

  let user_details = new User(user);

  // housekeeper_details.Active = true;
  Schedule = Schedule.map((s) => {
    s.HouseKeeperId = user_details._id;
    return s;
  });
  await Promise.all([
    WorkerShift.insertMany(Schedule),
    mongo.insertIntoCollection(user_details),
  ]);
  data.HouseKeeper = housekeeper_details;

  return res
    .status(200)
    .json(new ApiResponse(200, data, "House Keeper Added Successfully"));
});

const getRoomsWithHouseKeeping = asyncHandler(async (req, res) => {
  let { propertyUnitId } = req.body;
  let data = {};

  let Today = new Date();
  let d = new Date(Today);
  d.setDate(Today.getDate() + 1);
  d.setUTCHours(0, 0, 0, 0);

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
        as: "HouseKeepingRoomDetails",
      },
    },
    {
      $unwind: {
        path: "$HouseKeepingRoomDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        RoomDetails: 1,
        roomTypeName: 1,
        HouseKeepingRoomDetails: {
          $cond: [
            {
              $and: [
                {
                  $lte: ["$HouseKeepingRoomDetails.CreatedAt", d],
                },
                {
                  $eq: ["$HouseKeepingRoomDetails.isCompleted", false],
                },
              ],
            },
            "$HouseKeepingRoomDetails",
            "",
          ],
        },
        HouseKeeperId: {
          $cond: [
            {
              $and: [
                {
                  $lte: ["$HouseKeepingRoomDetails.CreatedAt", d],
                },
                {
                  $eq: ["$HouseKeepingRoomDetails.isCompleted", false],
                },
              ],
            },
            "$HouseKeepingRoomDetails.HousekeeperId",
            "",
          ],
        },
      },
    },
    {
      $unwind: {
        path: "$HouseKeeperDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: "$RoomDetails._id",
        roomNumber: {
          $first: "$RoomDetails.roomNumber",
        },
        roomName: {
          $first: "$RoomDetails.roomName",
        },
        roomType: {
          $first: "$roomTypeName",
        },
        roomCondition: {
          $first: "$RoomDetails.roomCondition",
        },
        roomStatus: {
          $first: "$RoomDetails.roomStatus",
        },
        Service: {
          $last: "$HouseKeepingRoomDetails.ServiceType",
        },
        isCompleted: {
          $last: "$HouseKeepingRoomDetails.isCompleted",
        },
        HouseKeeperId: {
          $last: "$HouseKeeperDetails._id",
        },
        HouseKeeperRoomDetailsId: {
          $last: "$HouseKeepingRoomDetails._id",
        },
        houseKeeperName: {
          $last: "$HouseKeeperDetails.HousekeeperName",
        },
        DND: {
          $last: "$HouseKeepingRoomDetails.DND",
        },
        Remarks: {
          $last: "$HouseKeepingRoomDetails.Remarks",
        },
      },
    },
    {
      $addFields: {
        Show: true,
      },
    },
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
        { _id: RoomDetails[j]._id },
        {
          roomCondition: RoomDetails[j].roomCondition,
        }
      )
    );

    if (RoomDetails[j].HouseKeeperId) {
      let housekeeping_detail = {};
      housekeeping_detail.HousekeeperId = RoomDetails[j].HouseKeeperId;
      housekeeping_detail.roomId = RoomDetails[j]._id;
      housekeeping_detail.taskDescription = RoomDetails[j].Remarks;
      housekeeping_detail.taskName = RoomDetails[j].taskName;
      if (RoomDetails[j].HouseKeeperRoomDetailsId) {
        await mongo.updateCollection(
          HousekeepingTask,
          {
            _id: mongoose.Types.ObjectId(
              RoomDetails[j].HouseKeeperRoomDetailsId
            ),
          },
          housekeeping_detail
        );
      } else {
        housekeeping_detail = new HousekeepingTask(housekeeping_detail);
        await mongo.insertIntoCollection(housekeeping_detail);
      }
    }
  }

  await Promise.all([Room.bulkWrite(updateRoomEntries)]);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Housekeeping task updated successfully"));
});

// POST create a new housekeeping task
const createHousekeepingTask = asyncHandler(async (req, res) => {
  const { roomId, propertyUnitId, taskName, taskDescription } = req.body;
  const task = new HousekeepingTask({
    roomId,
    propertyUnitId,
    taskName,
    taskDescription,
  });
  await task.save();
  return res
    .status(201)
    .json(new ApiResponse(201, task, "Housekeeping task created successfully"));
});

// PUT update a housekeeping task by ID
const updateHousekeepingTaskById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { roomId, propertyUnitId, taskName, taskDescription } = req.body;
  const task = await HousekeepingTask.findByIdAndUpdate(
    id,
    {
      roomId,
      propertyUnitId,
      taskName,
      taskDescription,
    },
    { new: true }
  );
  if (!task) {
    throw new ApiError(404, "Housekeeping task not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, task, "Housekeeping task updated successfully"));
});

// DELETE a housekeeping task by ID
const deleteHousekeepingTaskById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const task = await HousekeepingTask.findByIdAndDelete(id);
  if (!task) {
    throw new ApiError(404, "Housekeeping task not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, { id }, "Housekeeping task deleted successfully")
    );
});

// GET all housekeeping assignments
const getAllHousekeepingAssignments = asyncHandler(async (req, res) => {
  const assignments = await HousekeepingAssign.find();
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        assignments,
        "All housekeeping assignments retrieved successfully"
      )
    );
});

// GET a single housekeeping assignment by ID
const getHousekeepingAssignmentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const assignment = await HousekeepingAssign.findById(id);
  if (!assignment) {
    throw new ApiError(404, "Housekeeping assignment not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        assignment,
        "Housekeeping assignment retrieved successfully"
      )
    );
});

// POST create a new housekeeping assignment
const createHousekeepingAssignment = asyncHandler(async (req, res) => {
  const {
    housekeepingTaskId,
    propertyUnitId,
    scheduleDate,
    scheduleTime,
    status,
  } = req.body;
  const assignment = new HousekeepingAssign({
    housekeepingTaskId,
    propertyUnitId,
    scheduleDate,
    scheduleTime,
    status,
  });
  await assignment.save();
  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        assignment,
        "Housekeeping assignment created successfully"
      )
    );
});

// PUT update a housekeeping assignment by ID
const updateHousekeepingAssignmentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    housekeepingTaskId,
    propertyUnitId,
    scheduleDate,
    scheduleTime,
    status,
  } = req.body;
  const assignment = await HousekeepingAssign.findByIdAndUpdate(
    id,
    {
      housekeepingTaskId,
      propertyUnitId,
      scheduleDate,
      scheduleTime,
      status,
    },
    { new: true }
  );
  if (!assignment) {
    throw new ApiError(404, "Housekeeping assignment not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        assignment,
        "Housekeeping assignment updated successfully"
      )
    );
});

// DELETE a housekeeping assignment by ID
const deleteHousekeepingAssignmentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const assignment = await HousekeepingAssign.findByIdAndDelete(id);
  if (!assignment) {
    throw new ApiError(404, "Housekeeping assignment not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { id },
        "Housekeeping assignment deleted successfully"
      )
    );
});

export default {
  createHouseKeeper,
  getRoomsWithHouseKeeping,
  updateRoomsWithHouseKeeping,
  createHousekeepingTask,
  updateHousekeepingTaskById,
  deleteHousekeepingTaskById,
  getAllHousekeepingAssignments,
  getHousekeepingAssignmentById,
  createHousekeepingAssignment,
  updateHousekeepingAssignmentById,
  deleteHousekeepingAssignmentById,
};
