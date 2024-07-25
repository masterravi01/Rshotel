import bcrypt from "bcrypt";

import { UserTypesEnum } from "../../constants.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { Property, User, Address } from "../../database/database.schema.js";

import {
  emailVerificationMailgenContent,
  sendEmail,
} from "../../utils/mail.js";

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
  const {
    primaryPropertyName: propertyName,
    firstName,
    lastName,
    email,
    password,
    phone,
    address: propertyAddress,
  } = req.body;

  const existedUser = await User.findOne({
    email,
  });

  if (existedUser) {
    throw new ApiError(409, "User with email id is already exists", []);
  }
  const EncryptedPassword = await bcrypt.hash(password, 10);

  const address = new Address(propertyAddress);
  const user = new User({
    email,
    password: EncryptedPassword,
    firstName,
    lastName,
    phone,
    isEmailVerified: false,
    userType: UserTypesEnum.CLIENT,
    addressId: address._id,
  });

  /**
   * unHashedToken: unHashed token is something we will send to the user's mail
   * hashedToken: we will keep record of hashedToken to validate the unHashedToken in verify email controller
   * tokenExpiry: Expiry to be checked before validating the incoming token
   */
  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  /**
   * assign hashedToken and tokenExpiry in DB till user clicks on email verification link
   * The email verification is handled by {@link verifyEmail}
   */
  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;

  const property = new Property({
    propertyName,
    ownerId: user._id,
  });

  await Promise.all([property.save(), address.save(), user.save()]);
  sendEmail({
    email: user?.email,
    subject: "Please verify your email",
    mailgenContent: emailVerificationMailgenContent(
      user.username,
      `${req.protocol}://${req.get(
        "host"
      )}/hotelpro/user/verify-email?verificationToken=${unHashedToken}&userid=${user._id.toString()}`
    ),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

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
