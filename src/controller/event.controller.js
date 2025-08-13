const Events = require("../models/event.schema");
const { sendingDataInHeader } = require("../services/sendingDataInHeader");
const { apiResponse } = require("../utils/apiResponse");

async function createEvents(req, res) {
    const userData = await sendingDataInHeader(req);
    if (!userData) return apiResponse(res, 401, "Unauthorised request");

    const { title, description, date, startTime, endTime, location, overView, goodToKnow, eventTickets } = req.body;
    const images = req.file;

    if (!title || !description || !date || !location) {
        return apiResponse(res, 400, "All fields are required", null)
    }

    await Events.create({
        title,
        description,
        date,
        startTime,
        endTime,
        location,
        overView,
        goodToKnow,
        organizer: userData?.id,
        eventTickets
    })

    return apiResponse(res, 200, "success", { title })
}

module.exports = { createEvents }