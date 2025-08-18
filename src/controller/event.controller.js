
const Events = require("../models/event.schema");
const { sendingDataInHeader } = require("../services/sendingDataInHeader");
const { apiResponse } = require("../utils/apiResponse");
const { uploadImageInCloudinary } = require("../config/cloudnary.config");
const ThrowError = require("../utils/throError");
const path = require('path')

async function createEvents(req, res) {
    const userData = await sendingDataInHeader(req);
    if (!userData) return ThrowError(401, "Unauthorised request");
    const { title, description, date, startTime, endTime, location, overView, goodToKnow } = req.body;

    let images;
    if (req.files) {
        images = await Promise.all(
            req.files.map(async (file) => {
                const url = await uploadImageInCloudinary(file.buffer)
                return {
                    public_id: url.public_id,
                    url: url.secure_url
                };
            })
        );
    }


    if (
        !title ||
        !description ||
        !date ||
        !startTime ||
        !endTime ||
        !location) {
        return ThrowError(400, 'All fields are required')
    }

    if (date <= Date.now()) {
        return ThrowError(400, 'Event date must be in the future')
    }

    const data = await Events.create({
        title,
        description,
        images,
        date,
        startTime,
        endTime,
        location,
        overView,
        goodToKnow,
        organizer: userData?.id,
        // eventTickets,
        ispublished: 'draft'
    });

    return apiResponse(res, 200, "success", data)
}

async function updateOrganisersEvents(req, res) {
    const userData = await sendingDataInHeader(req);
    if (!userData) return apiResponse(res, 401, "Unauthorised request");

    const { id } = req.params;

    const { title, description, date, startTime, endTime, location, overView, goodToKnow, existingImages } = req.body;
    const findEvent = await Events.findById(id);
    if (!findEvent) {
        return apiResponse(res, 401, "Event not found");
    }



    let images;
    if (existingImages) {
        const existing = JSON.parse(existingImages);
        images = existing;
    }

    if (req.files) {
        const newImgs = await Promise.all(
            req.files.map(async (file) => {
                const url = await uploadImageInCloudinary(file.buffer)
                return {
                    public_id: url.public_id,
                    url: url.secure_url
                };
            })
        );
        images = [...(images || []), ...newImgs];
    }

    if (date <= Date.now()) {
        return apiResponse(res, 400, 'Event date must be in the future', null)
    }

    const data = await Events.findByIdAndUpdate(id, {
        title,
        description,
        images,
        date,
        startTime,
        endTime,
        location,
        overView,
        goodToKnow,
        ispublished: 'draft'
    }, { new: true })
    return apiResponse(res, 200, "success", data)
}

async function getOrganisersEvents(req, res) {
    const userData = await sendingDataInHeader(req);
    if (!userData) return apiResponse(res, 401, "Unauthorised request");

    const { id } = req.params;
    const findEvent = await Events.findById(id)
    return apiResponse(res, 200, "Event get successfully", findEvent)
}

async function addTicketToEvent(req, res) {
    const userData = await sendingDataInHeader(req);
    if (!userData) return apiResponse(res, 401, "Unauthorised request");

    const { id } = req.params;
    const { eventTickets } = req.body;

    const findEvent = await Events.findById(id)
    if (!findEvent) {
        return apiResponse(res, 401, "Event not found", null)
    }

    if (eventTickets.length < 1) {
        return apiResponse(res, 400, 'At least one ticket type is required', null)
    }

    const data = await Events.findByIdAndUpdate(id, {
        eventTickets,
        ispublished: 'draft'
    }, { new: true });
    return apiResponse(res, 200, "Tickets add successfully", data)

}

async function publicEvent(req, res) {
    const userData = await sendingDataInHeader(req);
    if (!userData) return ThrowError(401, "Unauthorised request");
    const { id } = req.params;

    const isEventExist = await Events.findById(id);
    if (!isEventExist) {
        return ThrowError(400, "Event not found");
    }
    const { eventType, category, tags, refundPolicy, isRefundPolicy, whenToPublish } = req.body;
    // let ispublished;
    // if (whenToPublish == Date.now()) {
    //     ispublished = 'publish'
    // }

    const data = await Events.findByIdAndUpdate(id, {
        eventType,
        category,
        tags,
        refundPolicy,
        isRefundPolicy,
        ispublished: 'published'
    }, { new: true })

    return apiResponse(res, 200, "Event published successfully", data)
}

module.exports = { createEvents, getOrganisersEvents, updateOrganisersEvents, addTicketToEvent, publicEvent }
