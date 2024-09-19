import express from "express";
const router = express.Router();
import futureAvailabilityController from "../controllers/future-availability/availability.controller.js";

router.post(
  "/read-future-availability",
  futureAvailabilityController.readFutureAvailability
);

export default router;
