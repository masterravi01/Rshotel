import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { HousekeepingTask } from '../../database/database.schema.js';
import { HousekeepingAssign } from '../../database/database.schema.js';

// GET all housekeeping tasks
const getAllHousekeepingTasks = asyncHandler(async (req, res) => {
    const tasks = await HousekeepingTask.find();
    return res.status(200).json(
        new ApiResponse(200, tasks, 'All housekeeping tasks retrieved successfully')
    );
});

// GET a single housekeeping task by ID
const getHousekeepingTaskById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const task = await HousekeepingTask.findById(id);
    if (!task) {
        throw new ApiError(404, 'Housekeeping task not found');
    }
    return res.status(200).json(
        new ApiResponse(200, task, 'Housekeeping task retrieved successfully')
    );
});

// POST create a new housekeeping task
const createHousekeepingTask = asyncHandler(async (req, res) => {
    const { roomId, propertyUnitId, taskName, taskDescription } = req.body;
    const task = new HousekeepingTask({
        roomId,
        propertyUnitId,
        taskName,
        taskDescription
    });
    await task.save();
    return res.status(201).json(
        new ApiResponse(201, task, 'Housekeeping task created successfully')
    );
});

// PUT update a housekeeping task by ID
const updateHousekeepingTaskById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { roomId, propertyUnitId, taskName, taskDescription } = req.body;
    const task = await HousekeepingTask.findByIdAndUpdate(id, {
        roomId,
        propertyUnitId,
        taskName,
        taskDescription
    }, { new: true });
    if (!task) {
        throw new ApiError(404, 'Housekeeping task not found');
    }
    return res.status(200).json(
        new ApiResponse(200, task, 'Housekeeping task updated successfully')
    );
});

// DELETE a housekeeping task by ID
const deleteHousekeepingTaskById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const task = await HousekeepingTask.findByIdAndDelete(id);
    if (!task) {
        throw new ApiError(404, 'Housekeeping task not found');
    }
    return res.status(200).json(
        new ApiResponse(200, { id }, 'Housekeeping task deleted successfully')
    );
});

// GET all housekeeping assignments
const getAllHousekeepingAssignments = asyncHandler(async (req, res) => {
    const assignments = await HousekeepingAssign.find();
    return res.status(200).json(
        new ApiResponse(200, assignments, 'All housekeeping assignments retrieved successfully')
    );
});

// GET a single housekeeping assignment by ID
const getHousekeepingAssignmentById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const assignment = await HousekeepingAssign.findById(id);
    if (!assignment) {
        throw new ApiError(404, 'Housekeeping assignment not found');
    }
    return res.status(200).json(
        new ApiResponse(200, assignment, 'Housekeeping assignment retrieved successfully')
    );
});

// POST create a new housekeeping assignment
const createHousekeepingAssignment = asyncHandler(async (req, res) => {
    const { housekeepingTaskId, propertyUnitId, scheduleDate, scheduleTime, status } = req.body;
    const assignment = new HousekeepingAssign({
        housekeepingTaskId,
        propertyUnitId,
        scheduleDate,
        scheduleTime,
        status
    });
    await assignment.save();
    return res.status(201).json(
        new ApiResponse(201, assignment, 'Housekeeping assignment created successfully')
    );
});

// PUT update a housekeeping assignment by ID
const updateHousekeepingAssignmentById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { housekeepingTaskId, propertyUnitId, scheduleDate, scheduleTime, status } = req.body;
    const assignment = await HousekeepingAssign.findByIdAndUpdate(id, {
        housekeepingTaskId,
        propertyUnitId,
        scheduleDate,
        scheduleTime,
        status
    }, { new: true });
    if (!assignment) {
        throw new ApiError(404, 'Housekeeping assignment not found');
    }
    return res.status(200).json(
        new ApiResponse(200, assignment, 'Housekeeping assignment updated successfully')
    );
});

// DELETE a housekeeping assignment by ID
const deleteHousekeepingAssignmentById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const assignment = await HousekeepingAssign.findByIdAndDelete(id);
    if (!assignment) {
        throw new ApiError(404, 'Housekeeping assignment not found');
    }
    return res.status(200).json(
        new ApiResponse(200, { id }, 'Housekeeping assignment deleted successfully')
    );
});

export default {
    getAllHousekeepingTasks,
    getHousekeepingTaskById,
    createHousekeepingTask,
    updateHousekeepingTaskById,
    deleteHousekeepingTaskById,
    getAllHousekeepingAssignments,
    getHousekeepingAssignmentById,
    createHousekeepingAssignment,
    updateHousekeepingAssignmentById,
    deleteHousekeepingAssignmentById
};
