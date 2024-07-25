import express from "express";
import { upload } from "../middleware/multer.middleware.js";
import propertyUnitController from "../controllers/property/propertyunit.controller.js";
import taxController from "../controllers/property/tax.controller.js";

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

router.post("/create-tax", taxController.createTax);
router.post("/update-tax/:taxId", taxController.updateTaxById);
router.post("/get-tax-by-id/:taxId", taxController.getTaxById);
router.post("/delete-tax/:taxId", taxController.deleteTaxById);
router.post("/get-all-taxes/:propertyUnitId", taxController.getAllTaxes);

export default router;
