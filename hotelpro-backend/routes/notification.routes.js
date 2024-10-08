import express from "express";
import notification from "../controllers/notification/notification.js";

const router = express.Router();

router.post("/read-all-notification", notification.readNotification);
export default router;
