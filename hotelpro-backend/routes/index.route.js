import express from "express";
import { verifyJWT } from "../middleware/auth.middlewares.js";
import userRouter from "./auth.route.js";
import adminRouter from "./admin.route.js";
import propertyRouter from "./property.route.js";
import propertyUnitRouter from "./propertyunit.route.js";

const router = express.Router();

router.use("/user", userRouter);
router.use("/property", propertyRouter);
router.use(verifyJWT); // apply middleware on subsequent routes
router.use("/admin", adminRouter);
router.use("/propertyunit", propertyUnitRouter);
export default router;
