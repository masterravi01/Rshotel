const express = require("express");
const router = express.Router();
const user = require("../controllers/auth/user.controllers");

const { verifyJWT } = require("../middleware/auth.middlewares")

router.post("/register", user.registerUser);
router.post("/login", user.loginUser);
router.post("/refresh-token", user.refreshAccessToken);
router.post("/forget-password", user.forgotPasswordRequest);
router.post("/reset-password/:resetToken", user.resetForgottenPassword);

router.post("/logout", verifyJWT, user.logoutUser);
router.post("/change-password", verifyJWT, user.changeCurrentPassword);
router.post("/current-user", verifyJWT, user.getCurrentUser);


module.exports = router;
