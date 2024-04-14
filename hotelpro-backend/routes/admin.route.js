const express = require("express");
const router = express.Router();
const admin = require("../controllers/admin.controller");

router.post("/apiTest", admin.apiTest);

module.exports = router;
