import express from "express";
import { Router } from "express";
const router = Router();

import user from "../controllers/auth/user.controllers.js";
import { verifyJWT } from "../middleware/auth.middlewares.js";

router.post("/register", user.registerUser);
router.post("/login", user.loginUser);
router.post("/refresh-token", user.refreshAccessToken);
router.post("/forget-password", user.forgotPasswordRequest);
router.post("/reset-password/:resetToken", user.resetForgottenPassword);
router.get("/verify-email", user.verifyEmail);

// Verify by JWT
router.post("/logout", verifyJWT, user.logoutUser);
router.post("/change-password", verifyJWT, user.changeCurrentPassword);
router.post("/current-user", verifyJWT, user.getCurrentUser);
router.post(
  "/resend-email-verification",
  verifyJWT,
  user.resendEmailVerification
);

export default router;
