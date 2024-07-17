import express from "express";
import { upload } from "../middleware/multer.middleware.js";
import roomIndex from "../controllers/room/room.index.js";

const router = express.Router();

router.post("/read-roomtypes/:propertyUnitId", roomIndex.getAllRoomTypes);
router.post("/read-roomtypebyid/:roomTypeId", roomIndex.getRoomTypeById);
router.post("/add-roomtype/:propertyUnitId", roomIndex.createRoomType);
router.post("/update-roomtype", roomIndex.updateRoomTypeById);

export default router;
