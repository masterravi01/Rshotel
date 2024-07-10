import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Reservation } from '../../database/database.schema.js';

// GET all reservations
const getAllReservations = asyncHandler(async (req, res) => {
    const reservations = await Reservation.find();
    return res.status(200).json(
        new ApiResponse(200, reservations, 'All reservations retrieved successfully')
    );
});

// GET a single reservation by ID
const getReservationById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const reservation = await Reservation.findById(id);
    if (!reservation) {
        throw new ApiError(404, 'Reservation not found');
    }
    return res.status(200).json(
        new ApiResponse(200, reservation, 'Reservation retrieved successfully')
    );
});

// POST create a new reservation
const createReservation = asyncHandler(async (req, res) => {
    const { roomIds, propertyUnitId, arrival, departure, reservationStatus, notes, ratePlanSetupId, userId } = req.body;
    const reservation = new Reservation({
        roomIds,
        propertyUnitId,
        arrival,
        departure,
        reservationStatus,
        notes,
        ratePlanSetupId,
        userId
    });
    await reservation.save();
    return res.status(201).json(
        new ApiResponse(201, reservation, 'Reservation created successfully')
    );
});

// PUT update a reservation by ID
const updateReservationById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { roomIds, propertyUnitId, arrival, departure, reservationStatus, notes, ratePlanSetupId, userId } = req.body;
    const reservation = await Reservation.findByIdAndUpdate(id, {
        roomIds,
        propertyUnitId,
        arrival,
        departure,
        reservationStatus,
        notes,
        ratePlanSetupId,
        userId
    }, { new: true });
    if (!reservation) {
        throw new ApiError(404, 'Reservation not found');
    }
    return res.status(200).json(
        new ApiResponse(200, reservation, 'Reservation updated successfully')
    );
});

// DELETE a reservation by ID
const deleteReservationById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const reservation = await Reservation.findByIdAndDelete(id);
    if (!reservation) {
        throw new ApiError(404, 'Reservation not found');
    }
    return res.status(200).json(
        new ApiResponse(200, { id }, 'Reservation deleted successfully')
    );
});

export default {
    getAllReservations,
    getReservationById,
    createReservation,
    updateReservationById,
    deleteReservationById
};
