const { cloudinary } = require("../config/cloudnary.config");
const Events = require("../models/event.schema");
const { sendingDataInHeader } = require("../services/sendingDataInHeader");
const { apiResponse } = require("../utils/apiResponse");

async function createEvents(req, res) {

    const userData = await sendingDataInHeader(req);

    if (!userData) return apiResponse(res, 401, "Unauthorised request");

    console.log(userData?.id)

    const { title, description, date, startTime, endTime, location, overView, goodToKnow, eventTickets, salesStarts, salesEnd } = req.body;

    const requiredFields = [
        title,
        description,
        date,
        startTime,
        endTime,
        location,
        overView,
        goodToKnow,
        eventTickets,
        salesStarts,
        salesEnd
    ];

    const images = await Promise.all(
        req.files.map(async (file) => {
            const url = await cloudinary.uploader.upload(file.path, {
                folder: 'event app'
            });
            return {
                public_id: url?.public_id,
                url: url?.secure_url
            }
        })
    );

    if (requiredFields.some(field => !req.body[field])) {
        return apiResponse(res, 400, 'All fields are required', null)
    }

    if (date <= Date.now()) {
        return apiResponse(res, 400, 'Event date must be in the future', null)
    }

    if (eventTickets.length < 1) {
        return apiResponse(res, 400, 'At least one ticket type is required', null)
    }


    const data = await Events.create({
        title,
        description,
        images,
        url,
        date,
        public_id,
        startTime,
        endTime,
        location,
        overView,
        goodToKnow,
        organizer: userData?.id,
        eventTickets
    })

    return apiResponse(res, 200, "success", data)
}

module.exports = { createEvents }
