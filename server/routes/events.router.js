const express = require("express");
const { getEventsController, addEventController, getEventByIdController, changeStatusController, addSubstanceController } = require("../controller/events.controller");
const router = express.Router();

router.get("/events", getEventsController);
router.post("/new-event", addEventController);
router.get("/event/:id", getEventByIdController);
router.post("/event/:id/change-status", changeStatusController);
router.post("/event/:id/substance", addSubstanceController);

module.exports = router;