import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { CancellationPolicy, NoShowPolicy, EarlyCheckoutPolicy } from '../../database/database.schema.js';

// Cancellation Policy CRUD

// GET all cancellation policies
const getAllCancellationPolicies = asyncHandler(async (req, res) => {
    const cancellationPolicies = await CancellationPolicy.find();
    return res.status(200).json(
        new ApiResponse(200, cancellationPolicies, 'All cancellation policies retrieved successfully')
    );
});

// GET a single cancellation policy by ID
const getCancellationPolicyById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const cancellationPolicy = await CancellationPolicy.findById(id);
    if (!cancellationPolicy) {
        throw new ApiError(404, 'Cancellation policy not found');
    }
    return res.status(200).json(
        new ApiResponse(200, cancellationPolicy, 'Cancellation policy retrieved successfully')
    );
});

// POST create a new cancellation policy
const createCancellationPolicy = asyncHandler(async (req, res) => {
    const { cancelPolicyName, propertyUnitId, policyDescription, insideWindowRange, outsideWindowRange, insideWindowType, outsideWindowType, insideWindowCharge, outsideWindowCharge } = req.body;
    const cancellationPolicy = new CancellationPolicy({
        cancelPolicyName,
        propertyUnitId,
        policyDescription,
        insideWindowRange,
        outsideWindowRange,
        insideWindowType,
        outsideWindowType,
        insideWindowCharge,
        outsideWindowCharge
    });
    await cancellationPolicy.save();
    return res.status(201).json(
        new ApiResponse(201, cancellationPolicy, 'Cancellation policy created successfully')
    );
});

// PUT update a cancellation policy by ID
const updateCancellationPolicyById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { cancelPolicyName, propertyUnitId, policyDescription, insideWindowRange, outsideWindowRange, insideWindowType, outsideWindowType, insideWindowCharge, outsideWindowCharge } = req.body;
    const cancellationPolicy = await CancellationPolicy.findByIdAndUpdate(id, {
        cancelPolicyName,
        propertyUnitId,
        policyDescription,
        insideWindowRange,
        outsideWindowRange,
        insideWindowType,
        outsideWindowType,
        insideWindowCharge,
        outsideWindowCharge
    }, { new: true });
    if (!cancellationPolicy) {
        throw new ApiError(404, 'Cancellation policy not found');
    }
    return res.status(200).json(
        new ApiResponse(200, cancellationPolicy, 'Cancellation policy updated successfully')
    );
});

// DELETE a cancellation policy by ID
const deleteCancellationPolicyById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const cancellationPolicy = await CancellationPolicy.findByIdAndDelete(id);
    if (!cancellationPolicy) {
        throw new ApiError(404, 'Cancellation policy not found');
    }
    return res.status(200).json(
        new ApiResponse(200, { id }, 'Cancellation policy deleted successfully')
    );
});


// No Show Policy CRUD

// GET all no show policies
const getAllNoShowPolicies = asyncHandler(async (req, res) => {
    const noShowPolicies = await NoShowPolicy.find();
    return res.status(200).json(
        new ApiResponse(200, noShowPolicies, 'All no show policies retrieved successfully')
    );
});

// GET a single no show policy by ID
const getNoShowPolicyById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const noShowPolicy = await NoShowPolicy.findById(id);
    if (!noShowPolicy) {
        throw new ApiError(404, 'No show policy not found');
    }
    return res.status(200).json(
        new ApiResponse(200, noShowPolicy, 'No show policy retrieved successfully')
    );
});

// POST create a new no show policy
const createNoShowPolicy = asyncHandler(async (req, res) => {
    const { noShowPolicyName, chargeType, chargeValue, propertyUnitId, policyDescription } = req.body;
    const noShowPolicy = new NoShowPolicy({
        noShowPolicyName,
        chargeType,
        chargeValue,
        propertyUnitId,
        policyDescription
    });
    await noShowPolicy.save();
    return res.status(201).json(
        new ApiResponse(201, noShowPolicy, 'No show policy created successfully')
    );
});

// PUT update a no show policy by ID
const updateNoShowPolicyById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { noShowPolicyName, chargeType, chargeValue, propertyUnitId, policyDescription } = req.body;
    const noShowPolicy = await NoShowPolicy.findByIdAndUpdate(id, {
        noShowPolicyName,
        chargeType,
        chargeValue,
        propertyUnitId,
        policyDescription
    }, { new: true });
    if (!noShowPolicy) {
        throw new ApiError(404, 'No show policy not found');
    }
    return res.status(200).json(
        new ApiResponse(200, noShowPolicy, 'No show policy updated successfully')
    );
});

// DELETE a no show policy by ID
const deleteNoShowPolicyById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const noShowPolicy = await NoShowPolicy.findByIdAndDelete(id);
    if (!noShowPolicy) {
        throw new ApiError(404, 'No show policy not found');
    }
    return res.status(200).json(
        new ApiResponse(200, { id }, 'No show policy deleted successfully')
    );
});


// Early Checkout Policy CRUD

// GET all early checkout policies
const getAllEarlyCheckoutPolicies = asyncHandler(async (req, res) => {
    const earlyCheckoutPolicies = await EarlyCheckoutPolicy.find();
    return res.status(200).json(
        new ApiResponse(200, earlyCheckoutPolicies, 'All early checkout policies retrieved successfully')
    );
});

// GET a single early checkout policy by ID
const getEarlyCheckoutPolicyById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const earlyCheckoutPolicy = await EarlyCheckoutPolicy.findById(id);
    if (!earlyCheckoutPolicy) {
        throw new ApiError(404, 'Early checkout policy not found');
    }
    return res.status(200).json(
        new ApiResponse(200, earlyCheckoutPolicy, 'Early checkout policy retrieved successfully')
    );
});

// POST create a new early checkout policy
const createEarlyCheckoutPolicy = asyncHandler(async (req, res) => {
    const { earlyCheckoutPolicyName, chargeType, chargeValue, propertyUnitId, policyDescription } = req.body;
    const earlyCheckoutPolicy = new EarlyCheckoutPolicy({
        earlyCheckoutPolicyName,
        chargeType,
        chargeValue,
        propertyUnitId,
        policyDescription
    });
    await earlyCheckoutPolicy.save();
    return res.status(201).json(
        new ApiResponse(201, earlyCheckoutPolicy, 'Early checkout policy created successfully')
    );
});

// PUT update an early checkout policy by ID
const updateEarlyCheckoutPolicyById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { earlyCheckoutPolicyName, chargeType, chargeValue, propertyUnitId, policyDescription } = req.body;
    const earlyCheckoutPolicy = await EarlyCheckoutPolicy.findByIdAndUpdate(id, {
        earlyCheckoutPolicyName,
        chargeType,
        chargeValue,
        propertyUnitId,
        policyDescription
    }, { new: true });
    if (!earlyCheckoutPolicy) {
        throw new ApiError(404, 'Early checkout policy not found');
    }
    return res.status(200).json(
        new ApiResponse(200, earlyCheckoutPolicy, 'Early checkout policy updated successfully')
    );
});

// DELETE an early checkout policy by ID
const deleteEarlyCheckoutPolicyById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const earlyCheckoutPolicy = await EarlyCheckoutPolicy.findByIdAndDelete(id);
    if (!earlyCheckoutPolicy) {
        throw new ApiError(404, 'Early checkout policy not found');
    }
    return res.status(200).json(
        new ApiResponse(200, { id }, 'Early checkout policy deleted successfully')
    );
});

export default {
    // Cancellation Policy CRUD
    getAllCancellationPolicies,
    getCancellationPolicyById,
    createCancellationPolicy,
    updateCancellationPolicyById,
    deleteCancellationPolicyById,

    // No Show Policy CRUD
    getAllNoShowPolicies,
    getNoShowPolicyById,
    createNoShowPolicy,
    updateNoShowPolicyById,
    deleteNoShowPolicyById,

    // Early Checkout Policy CRUD
    getAllEarlyCheckoutPolicies,
    getEarlyCheckoutPolicyById,
    createEarlyCheckoutPolicy,
    updateEarlyCheckoutPolicyById,
    deleteEarlyCheckoutPolicyById
};
