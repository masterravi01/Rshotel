import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { TaxSet, TaxDetail } from '../../database/database.schema.js';

// GET all tax sets
const getAllTaxSets = asyncHandler(async (req, res) => {
    const taxSets = await TaxSet.find();
    return res.status(200).json(
        new ApiResponse(200, taxSets, 'All tax sets retrieved successfully')
    );
});

// GET a single tax set by ID
const getTaxSetById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const taxSet = await TaxSet.findById(id);
    if (!taxSet) {
        throw new ApiError(404, 'Tax set not found');
    }
    return res.status(200).json(
        new ApiResponse(200, taxSet, 'Tax set retrieved successfully')
    );
});

// POST create a new tax set
const createTaxSet = asyncHandler(async (req, res) => {
    const { propertyUnitId, taxDetailIds, taxSetName, active } = req.body;
    const taxSet = new TaxSet({
        propertyUnitId,
        taxDetailIds,
        taxSetName,
        active
    });
    await taxSet.save();
    return res.status(201).json(
        new ApiResponse(201, taxSet, 'Tax set created successfully')
    );
});

// PUT update a tax set by ID
const updateTaxSetById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { propertyUnitId, taxDetailIds, taxSetName, active } = req.body;
    const taxSet = await TaxSet.findByIdAndUpdate(id, {
        propertyUnitId,
        taxDetailIds,
        taxSetName,
        active
    }, { new: true });
    if (!taxSet) {
        throw new ApiError(404, 'Tax set not found');
    }
    return res.status(200).json(
        new ApiResponse(200, taxSet, 'Tax set updated successfully')
    );
});

// DELETE a tax set by ID
const deleteTaxSetById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const taxSet = await TaxSet.findByIdAndDelete(id);
    if (!taxSet) {
        throw new ApiError(404, 'Tax set not found');
    }
    return res.status(200).json(
        new ApiResponse(200, { id }, 'Tax set deleted successfully')
    );
});

export default {
    getAllTaxSets,
    getTaxSetById,
    createTaxSet,
    updateTaxSetById,
    deleteTaxSetById
};
