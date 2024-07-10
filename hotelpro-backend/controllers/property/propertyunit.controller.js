import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { PropertyUnit } from '../../database/database.schema.js';

// GET all property units
const getAllPropertyUnits = asyncHandler(async (req, res) => {
    const propertyUnits = await PropertyUnit.find();
    return res.status(200).json(
        new ApiResponse(200, propertyUnits, 'All property units retrieved successfully')
    );
});

// GET a single property unit by ID
const getPropertyUnitById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const propertyUnit = await PropertyUnit.findById(id);
    if (!propertyUnit) {
        throw new ApiError(404, 'Property unit not found');
    }
    return res.status(200).json(
        new ApiResponse(200, propertyUnit, 'Property unit retrieved successfully')
    );
});

// POST create a new property unit
const createPropertyUnit = asyncHandler(async (req, res) => {
    const { propertyId, propertyUnitName, propertyUnitLegalName, propertyUnitCode, propertyUnitType, managerId, addressId, description, website, socialMediaLinks, active } = req.body;
    const propertyUnit = new PropertyUnit({
        propertyId,
        propertyUnitName,
        propertyUnitLegalName,
        propertyUnitCode,
        propertyUnitType,
        managerId,
        addressId,
        description,
        website,
        socialMediaLinks,
        active
    });
    await propertyUnit.save();
    return res.status(201).json(
        new ApiResponse(201, propertyUnit, 'Property unit created successfully')
    );
});

// PUT update a property unit by ID
const updatePropertyUnitById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { propertyId, propertyUnitName, propertyUnitLegalName, propertyUnitCode, propertyUnitType, managerId, addressId, description, website, socialMediaLinks, active } = req.body;
    const propertyUnit = await PropertyUnit.findByIdAndUpdate(id, {
        propertyId,
        propertyUnitName,
        propertyUnitLegalName,
        propertyUnitCode,
        propertyUnitType,
        managerId,
        addressId,
        description,
        website,
        socialMediaLinks,
        active
    }, { new: true });
    if (!propertyUnit) {
        throw new ApiError(404, 'Property unit not found');
    }
    return res.status(200).json(
        new ApiResponse(200, propertyUnit, 'Property unit updated successfully')
    );
});

// DELETE a property unit by ID
const deletePropertyUnitById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const propertyUnit = await PropertyUnit.findByIdAndDelete(id);
    if (!propertyUnit) {
        throw new ApiError(404, 'Property unit not found');
    }
    return res.status(200).json(
        new ApiResponse(200, { id }, 'Property unit deleted successfully')
    );
});

export default {
    getAllPropertyUnits,
    getPropertyUnitById,
    createPropertyUnit,
    updatePropertyUnitById,
    deletePropertyUnitById
};
