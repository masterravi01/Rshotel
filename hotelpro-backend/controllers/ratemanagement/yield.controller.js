import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { Yield } from "../../database/database.schema.js";

// GET all yield data
const getAllYields = asyncHandler(async (req, res) => {
  const yields = await Yield.find();
  return res
    .status(200)
    .json(
      new ApiResponse(200, yields, "All yield data retrieved successfully")
    );
});

// GET yield data by ID
const getYieldById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const yieldData = await Yield.findById(id);
  if (!yieldData) {
    throw new ApiError(404, "Yield data not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, yieldData, "Yield data retrieved successfully"));
});

// POST create new yield data
const createYield = asyncHandler(async (req, res) => {
  const { date, ratePlanId, occupancy, revenue } = req.body;
  const yieldData = new Yield({
    date,
    ratePlanId,
    occupancy,
    revenue,
  });
  await yieldData.save();
  return res
    .status(201)
    .json(new ApiResponse(201, yieldData, "Yield data created successfully"));
});

// PUT update yield data by ID
const updateYieldById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { date, ratePlanId, occupancy, revenue } = req.body;
  const yieldData = await Yield.findByIdAndUpdate(
    id,
    {
      date,
      ratePlanId,
      occupancy,
      revenue,
    },
    { new: true }
  );
  if (!yieldData) {
    throw new ApiError(404, "Yield data not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, yieldData, "Yield data updated successfully"));
});

// DELETE yield data by ID
const deleteYieldById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const yieldData = await Yield.findByIdAndDelete(id);
  if (!yieldData) {
    throw new ApiError(404, "Yield data not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, { id }, "Yield data deleted successfully"));
});

export default {
  getAllYields,
  getYieldById,
  createYield,
  updateYieldById,
  deleteYieldById,
};
