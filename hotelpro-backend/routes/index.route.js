import express from "express";
import { verifyJWT } from "../middleware/auth.middlewares.js";
import userRouter from "./auth.route.js";
import adminRouter from "./admin.route.js";

const router = express.Router();

router.use("/user", userRouter);
router.use(verifyJWT); // apply middleware on subsequent routes
router.use("/admin", adminRouter);

export default router;
