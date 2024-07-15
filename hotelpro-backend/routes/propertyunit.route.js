import express from "express";
import { upload } from "../middleware/multer.middleware.js";
import propertyUnitController from "../controllers/property/propertyunit.controller.js";
const router = express.Router();

router.post("/create-propertyunit", propertyUnitController.createPropertyUnit);
router.post(
  "/update-propertyunit/:propertyUnitId",
  propertyUnitController.updatePropertyUnitById
);
router.post(
  "/read-propertyunit/:propertyUnitId",
  propertyUnitController.getPropertyUnitById
);

export default router;
