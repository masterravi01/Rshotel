import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { Property } from "../../database/database.schema.js";
import { PropertyUnit, User, Address } from "../../database/database.schema.js";
import { generatePropertyUnitCode } from "../../utils/helpers.js";
import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;

// GET all property units
const getAllPropertyUnits = asyncHandler(async (req, res) => {
  const propertyUnits = await PropertyUnit.find();
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        propertyUnits,
        "All property units retrieved successfully"
      )
    );
});

// GET a single property unit by ID
const getPropertyUnitById = asyncHandler(async (req, res) => {
  const { propertyUnitId } = req.params;
  const propertyUnit = await PropertyUnit.aggregate([
    {
      $match: {
        _id: new ObjectId(propertyUnitId),
      },
    },
    {
      $lookup: {
        from: "addresses",
        localField: "addressId",
        foreignField: "_id",
        as: "propertyAddress",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "managerId",
        foreignField: "_id",
        as: "managerDetails",
      },
    },
    {
      $unwind: {
        path: "$propertyAddress",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: "$managerDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
  ]);

  if (!propertyUnit) {
    throw new ApiError(404, "Property unit not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        propertyUnit[0],
        "Property unit retrieved successfully"
      )
    );
});

// POST create a new property unit
const createPropertyUnit = asyncHandler(async (req, res) => {
  const {
    propertyId,
    propertyUnitName,
    propertyUnitLegalName,
    propertyUnitType,
    propertyAddress,
    managerDetails,
    description,
    website,
    socialMediaLinks,
    active,
  } = req.body;
  const propertyUnitCode = generatePropertyUnitCode();

  const manager = new User(managerDetails);

  const propertyUnit = new PropertyUnit({
    propertyId,
    propertyUnitName,
    propertyUnitLegalName,
    propertyUnitCode,
    propertyUnitType,
    description,
    website,
    socialMediaLinks,
    active,
  });
  const address = new Address(propertyAddress);

  propertyUnit.addressId = address._id;
  propertyUnit.managerId = manager._id;
  manager.propertyUnitId = propertyUnit._id;
  manager.password = "Hotel@123";
  await Promise.all([propertyUnit.save(), address.save(), manager.save()]);

  return res
    .status(201)
    .json(
      new ApiResponse(201, propertyUnit, "Property unit created successfully")
    );
});

// PUT update a property unit by ID
const updatePropertyUnitById = asyncHandler(async (req, res) => {
  const { propertyUnitId } = req.params;
  const {
    propertyUnitName,
    propertyUnitLegalName,
    propertyAddress,
    propertyUnitType,
    managerId,
    addressId,
    description,
    website,
    socialMediaLinks,
    active,
    managerDetails,
  } = req.body;
  const propertyUnit = await PropertyUnit.findByIdAndUpdate(
    propertyUnitId,
    {
      propertyUnitName,
      propertyUnitLegalName,
      propertyUnitType,
      description,
      website,
      socialMediaLinks,
      active,
    },
    { new: true }
  );
  const [manager, address] = await Promise.all([
    User.findByIdAndUpdate(propertyUnit.managerId, managerDetails, {
      new: true,
    }),
    Address.findByIdAndUpdate(propertyUnit.addressId, propertyAddress, {
      new: true,
    }),
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, propertyUnit, "Property unit updated successfully")
    );
});

// DELETE a property unit by ID
const deletePropertyUnitById = asyncHandler(async (req, res) => {
  const { propertyUnitId } = req.params;

  const propertyUnit = await PropertyUnit.findByIdAndDelete(propertyUnitId);

  if (!propertyUnit) {
    throw new ApiError(404, "Property unit not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { propertyUnitId },
        "Property unit deleted successfully"
      )
    );
});

export default {
  getAllPropertyUnits,
  getPropertyUnitById,
  createPropertyUnit,
  updatePropertyUnitById,
  deletePropertyUnitById,
};
