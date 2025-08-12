const express = require('express');
const router = express.Router();
const eventsController = require('../controller/event.controller');
const { asyncHandler } = require('../utils/asyncHandler');

router.post('/create-event', asyncHandler(eventsController.createEvents));


module.exports = router