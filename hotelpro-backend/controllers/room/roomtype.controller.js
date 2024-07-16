import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { RoomType } from "../../database/database.schema.js";

// GET all room types
const getAllRoomTypes = asyncHandler(async (req, res) => {
  const { propertyUnitId } = req.params;
  const roomTypes = await RoomType.find({ propertyUnitId });
  return res
    .status(200)
    .json(
      new ApiResponse(200, roomTypes, "All room types retrieved successfully")
    );
});

// GET a single room type by ID
const getRoomTypeById = asyncHandler(async (req, res) => {
  const { roomTypeId } = req.params;
  const roomType = await RoomType.findById(roomTypeId);
  if (!roomType) {
    throw new ApiError(404, "Room type not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, roomType, "Room type retrieved successfully"));
});

// POST create a new room type
const createRoomType = asyncHandler(async (req, res) => {
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

// PUT update a room type by ID
const updateRoomTypeById = asyncHandler(async (req, res) => {
  const {
    _id,
    roomTypeName,
    active,
    roomTypeCategory,
    description,
    images,
    propertyUnitId,
    adultOccupancy,
    childOccupancy,
  } = req.body;

  const roomType = await RoomType.findByIdAndUpdate(
    _id,
    {
      roomTypeName,
      active,
      roomTypeCategory,
      description,
      images,
      propertyUnitId,
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

// DELETE a room type by ID
const deleteRoomTypeById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const roomType = await RoomType.findByIdAndDelete(id);
  if (!roomType) {
    throw new ApiError(404, "Room type not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, { id }, "Room type deleted successfully"));
});

export default {
  getAllRoomTypes,
  getRoomTypeById,
  createRoomType,
  updateRoomTypeById,
  deleteRoomTypeById,
};
