import express from "express";
import { verifyJWT } from "../middleware/auth.middlewares.js";
import userRouter from "./auth.routes.js";
import propertyRouter from "./property.routes.js";
import propertyUnitRouter from "./propertyunit.routes.js";
import roomRouter from "./room.routes.js";

const router = express.Router();

router.use("/user", userRouter);
router.use("/property", propertyRouter);
router.use(verifyJWT); // apply middleware on subsequent routes
router.use("/propertyunit", propertyUnitRouter);
router.use("/room", roomRouter);
export default router;
