import express from "express";
import { upload } from "../middleware/multer.middleware.js";
import propertyController from "../controllers/property/property.controller.js";
const router = express.Router();

router.post(
  "/upload-profile-photo",
  upload.single("file"),
  propertyController.uploadProfilePhoto
);
router.post(
  "/upload-rooms-photos",
  upload.array("file", 10),
  propertyController.uploadRoomsPhotos
);
router.post("/create-property", propertyController.createProperty);

export default router;
