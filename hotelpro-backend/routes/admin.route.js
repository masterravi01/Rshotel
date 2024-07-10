import express from "express";
import admin from "../controllers/admin.controller.js";

const router = express.Router();

router.post("/apiTest", admin.apiTest);

export default router;
