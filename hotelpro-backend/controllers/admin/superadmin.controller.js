import mongoose from "mongoose";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import {
  emailVerificationMailgenContent,
  sendEmail,
} from "../../utils/mail.js";

import { Property, PropertyUnit } from "../../database/database.schema.js";
const ObjectId = mongoose.Types.ObjectId;

const readSuperAdminDashboard = asyncHandler(async (req, res) => {
  const [totalProperties, totalPropertyUnits, activePropertyUnits, clients] =
    await Promise.all([
      Property.find().count(),
      PropertyUnit.find().count(),
      PropertyUnit.find({ active: true }).count(),
      Property.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "ownerId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: {
            path: "$user",
          },
        },
        {
          $project: {
            propertyName: 1,
            clientName: {
              $concat: ["$user.firstName", " ", "$user.lastName"],
            },
            phone: "$user.phone",
            isVIP: 1,
          },
        },
      ]),
    ]);

  let response = {
    totalProperties,
    totalPropertyUnits,
    activePropertyUnits,
    clients,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, response, "All clients retrieved successfully"));
});

export default {
  readSuperAdminDashboard,
};
