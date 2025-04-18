const express = require("express");
const { getSubstancesController, getAdulterantsController } = require("../controller/substances.controller");
const router = express.Router();

router.get("/adulterants", getAdulterantsController);
router.get("/substances", getSubstancesController);

module.exports = router;