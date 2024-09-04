import express from "express";
import { upload } from "../middleware/multer.middleware.js";
import propertyController from "../controllers/property/property.controller.js";
const router = express.Router();
import { verifyJWT } from "../middleware/auth.middlewares.js";

router.post("/create-property", propertyController.createProperty);
router.post(
  "/upload-profile-photo",
  upload.single("file"),
  verifyJWT,
  propertyController.uploadProfilePhoto
);
router.post(
  "/upload-rooms-photos",
  upload.array("file", 10),
  verifyJWT,
  propertyController.uploadRoomsPhotos
);
router.post(
  "/read-client-dashboard",
  verifyJWT,
  propertyController.readClientDashboard
);

export default router;
