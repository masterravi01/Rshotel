const express = require("express");
const router = express.Router();
const { Router } = require("express");
const { verifyJWT } = require("../middleware/auth.middlewares")
const user = require("./auth.route");
const admin = require("./admin.route");

router.use("/user", user);
router.use(verifyJWT); // apply middleware on subsequence routes
router.use("/admin", admin);
module.exports = router;
