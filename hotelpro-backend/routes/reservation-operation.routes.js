import express from "express";
import reservationOperationIndex from "../controllers/reservation-operation/reservation-operation.index.js";

const router = express.Router();

router.post(
  "/read-reservation-rate/:propertyUnitId",
  reservationOperationIndex.readReservationRate
);
router.post("/create-reservation", reservationOperationIndex.createReservation);
export default router;
