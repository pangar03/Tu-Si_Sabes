const express = require("express");
const router = express.Router();

const { getUsersController, registerController, loginController } = require("../controller/users.controller");

router.post("/register", registerController);
router.post("/login", loginController);

// For testing purposes
router.get("/getUsers", getUsersController);

module.exports = router;