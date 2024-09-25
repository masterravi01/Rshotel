import express from "express";
import reservationOperationIndex from "../controllers/reservation-operation/reservation-operation.index.js";
import { upload } from "../middleware/multer.middleware.js";
const router = express.Router();

router.post(
  "/read-reservation-rate/:propertyUnitId",
  reservationOperationIndex.readReservationRate
);
router.post("/create-reservation", reservationOperationIndex.createReservation);

router.post(
  "/upload-reservation-images",
  upload.array("uploadedImages", 10),
  reservationOperationIndex.uploadReservationImages
);
router.post(
  "/delete-reservation-images",
  reservationOperationIndex.deleteReservationImages
);

router.post("/guest-folio", reservationOperationIndex.guestFolio);
router.post("/stay-update", reservationOperationIndex.stayUpdate);
router.post("/add-room", reservationOperationIndex.addRoomReservation);
router.post("/change-room", reservationOperationIndex.changeRoomReservation);
router.post(
  "/get-all-reservation",
  reservationOperationIndex.getAllReservations
);
router.post(
  "/post-reservation-payment",
  reservationOperationIndex.postReservationPayment
);
router.post(
  "/add-reservation-charge",
  reservationOperationIndex.addReservationCharge
);

router.post(
  "/checkin-reservation",
  reservationOperationIndex.checkInReservation
);
router.post("/read-noshow-charge", reservationOperationIndex.readNoshowCharge);
router.post("/noshow-reservation", reservationOperationIndex.noShowReservation);
router.post(
  "/read-cancel-reservation-charge",
  reservationOperationIndex.readCancelReservationCharge
);
router.post("/cancel-reservation", reservationOperationIndex.cancelReservation);

router.post("/refund-payment", reservationOperationIndex.refundPayment);

router.post(
  "/add-guest-reservation",
  reservationOperationIndex.addGuestToReservation
);

router.post(
  "/update-guest-reservation",
  reservationOperationIndex.updateGuestToReservation
);

router.post(
  "/delete-shared-guest",
  reservationOperationIndex.deleteSharedGuest
);

router.post(
  "/checkout-reservation",
  reservationOperationIndex.checkoutReservation
);

export default router;
