const express = require('express');
const router = express.Router();
const eventsController = require('../controller/event.controller');
const { asyncHandler } = require('../utils/asyncHandler');
const { authMiddleware } = require('../middlewares/auth');
const upload = require('../config/multer');

router.post('/create-event', authMiddleware, upload.array('image', 3), asyncHandler(eventsController.createEvents));


module.exports = router