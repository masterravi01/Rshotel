import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import RatePlan from '../../database/database.schema.js';

// GET all rate plans
const getAllRatePlans = asyncHandler(async (req, res) => {
    const ratePlans = await RatePlan.find();
    return res.status(200).json(
        new ApiResponse(200, ratePlans, 'All rate plans retrieved successfully')
    );
});

// GET a single rate plan by ID
const getRatePlanById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const ratePlan = await RatePlan.findById(id);
    if (!ratePlan) {
        throw new ApiError(404, 'Rate plan not found');
    }
    return res.status(200).json(
        new ApiResponse(200, ratePlan, 'Rate plan retrieved successfully')
    );
});

// POST create a new rate plan
const createRatePlan = asyncHandler(async (req, res) => {
    const { ratePlanName, description, pricingRules, propertyUnitId } = req.body;
    const ratePlan = new RatePlan({
        ratePlanName,
        description,
        pricingRules,
        propertyUnitId
    });
    await ratePlan.save();
    return res.status(201).json(
        new ApiResponse(201, ratePlan, 'Rate plan created successfully')
    );
});

// PUT update a rate plan by ID
const updateRatePlanById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { ratePlanName, description, pricingRules, propertyUnitId } = req.body;
    const ratePlan = await RatePlan.findByIdAndUpdate(id, {
        ratePlanName,
        description,
        pricingRules,
        propertyUnitId
    }, { new: true });
    if (!ratePlan) {
        throw new ApiError(404, 'Rate plan not found');
    }
    return res.status(200).json(
        new ApiResponse(200, ratePlan, 'Rate plan updated successfully')
    );
});

// DELETE a rate plan by ID
const deleteRatePlanById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const ratePlan = await RatePlan.findByIdAndDelete(id);
    if (!ratePlan) {
        throw new ApiError(404, 'Rate plan not found');
    }
    return res.status(200).json(
        new ApiResponse(200, { id }, 'Rate plan deleted successfully')
    );
});

export default {
    getAllRatePlans,
    getRatePlanById,
    createRatePlan,
    updateRatePlanById,
    deleteRatePlanById
};
