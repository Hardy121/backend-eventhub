
const Events = require("../models/event.schema");
const { sendingDataInHeader } = require("../services/sendingDataInHeader");
const { apiResponse } = require("../utils/apiResponse");
const { uploadImageInCloudinary } = require("../config/cloudnary.config")


async function createEvents(req, res) {
    const userData = await sendingDataInHeader(req);
    if (!userData) return apiResponse(res, 401, "Unauthorised request", null);
    const { title, description, date, startTime, endTime, location, overView, goodToKnow } = req.body;

    let images;
    if (req.files) {
        images = await Promise.all(
            req.files.map(async (file) => {
                const url = await uploadImageInCloudinary(file.buffer, {
                    resource_type: "image"
                })
                return {
                    public_id: url.public_id,
                    secure_url: url.secure_url
                };
            })
        );
    }

    console.log(images)

    if (
        !title ||
        !description ||
        !date ||
        !startTime ||
        !endTime ||
        !location) {
        return apiResponse(res, 400, 'All fields are required', null)
    }

    if (date <= Date.now()) {
        return apiResponse(res, 400, 'Event date must be in the future', null)
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

    const { title, description, date, startTime, endTime, location, overView, goodToKnow } = req.body;
    const findEvent = await Events.findById(id);
    if (!findEvent) {
        return apiResponse(res, 401, "Event not found");
    }

    let images;
    if (req.files) {
        images = await Promise.all(
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

module.exports = { createEvents, getOrganisersEvents, updateOrganisersEvents, addTicketToEvent }
