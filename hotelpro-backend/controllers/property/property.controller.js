import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { Property } from "../../database/database.schema.js";
import fs from "fs";

// GET all properties
const getAllProperties = asyncHandler(async (req, res) => {
  const properties = await Property.find();
  return res
    .status(200)
    .json(
      new ApiResponse(200, properties, "All properties retrieved successfully")
    );
});

// GET a single property by ID
const getPropertyById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const property = await Property.findById(id);
  if (!property) {
    throw new ApiError(404, "Property not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, property, "Property retrieved successfully"));
});

// POST create a new property
const createProperty = asyncHandler(async (req, res) => {
  const { propertyName, ownerId, isVIP } = req.body;
  const property = new Property({
    propertyName,
    ownerId,
    isVIP,
  });
  await property.save();
  return res
    .status(201)
    .json(new ApiResponse(201, property, "Property created successfully"));
});

// PUT update a property by ID
const updatePropertyById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { propertyName, ownerId, isVIP } = req.body;
  const property = await Property.findByIdAndUpdate(
    id,
    {
      propertyName,
      ownerId,
      isVIP,
    },
    { new: true }
  );
  if (!property) {
    throw new ApiError(404, "Property not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, property, "Property updated successfully"));
});

// DELETE a property by ID
const deletePropertyById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const property = await Property.findByIdAndDelete(id);
  if (!property) {
    throw new ApiError(404, "Property not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, { id }, "Property deleted successfully"));
});

// POST create a new property
const uploadRoomsPhotos = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // if ([title, description].some((field) => !field?.trim())) {
  //   throw new ApiError(400, "All Fields are required");
  // }

  // if (!LocalPath) {
  //   throw new ApiError(400, "LocalPath is required!");
  // }
  for (let file of req.files) {
    fs.unlinkSync(file?.path);
  }

  return res.status(201).json(new ApiResponse(201, {}, "Upload  successfully"));
});

const uploadProfilePhoto = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // if ([title, description].some((field) => !field?.trim())) {
  //   throw new ApiError(400, "All Fields are required");
  // }
  const LocalPath = req.file?.path;
  // if (!LocalPath) {
  //   throw new ApiError(400, "LocalPath is required!");
  // }
  fs.unlinkSync(LocalPath);
  return res.status(201).json(new ApiResponse(201, {}, "Upload  successfully"));
});

export default {
  getAllProperties,
  getPropertyById,
  createProperty,
  updatePropertyById,
  deletePropertyById,
  uploadProfilePhoto,
  uploadRoomsPhotos,
};
