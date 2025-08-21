const express = require('express');
const router = express.Router();
const eventsController = require('../controller/event.controller');
const { asyncHandler } = require('../utils/asyncHandler');
const { authMiddleware } = require('../middlewares/auth');
const upload = require('../config/multer');

//============================================ Create Event =========================================
router.post('/create-event', authMiddleware, upload.array('images', 3), asyncHandler(eventsController.createEvents));
router.get('/getOrganisersEvents/:id', authMiddleware, asyncHandler(eventsController.getOrganisersEvents));
router.put('/updateOrganisersEvents/:id', authMiddleware, upload.array('images', 3), asyncHandler(eventsController.updateOrganisersEvents));
// add ticket to event
router.put('/addTicketToEvent/:id', authMiddleware, asyncHandler(eventsController.addTicketToEvent));
router.put('/publicEvent/:id', authMiddleware, asyncHandler(eventsController.publicEvent));

// ========================================= get Event =================================== //
router.get('/getAllEvents', asyncHandler(eventsController.getAllEvent));
router.get('/getAllEvent/:id', asyncHandler(eventsController.getAllEventById));

// ======================================== Book event ================================= //
router.post('/bookEvent/:id', authMiddleware, asyncHandler(eventsController.bookEvent));


// ======================================== AI SUGGETION ============================================//
router.post('/suggestTitle', asyncHandler(eventsController.generateTitleSuggestions));
router.post('/suggestOverview', asyncHandler(eventsController.generateOverviewSuggestions));



module.exports = router