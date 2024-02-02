const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const User = require("../models/user");

const userController = require("../controllers/user");

router.post("/createUser", userController.createUser);

router.post("/login", userController.login);


module.exports = router;
