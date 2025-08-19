
const Events = require("../models/event.schema");
const { sendingDataInHeader } = require("../services/sendingDataInHeader");
const { apiResponse } = require("../utils/apiResponse");
const { uploadImageInCloudinary } = require("../config/cloudnary.config");
const ThrowError = require("../utils/throError");
const OpenAI = require("openai");


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
    let ispublished = "published";
    if (whenToPublish) {
        ispublished = "draft"
    }

    const data = await Events.findByIdAndUpdate(id, {
        eventType,
        category,
        tags,
        refundPolicy,
        isRefundPolicy,
        ispublished,
        whenToPublish: whenToPublish ? whenToPublish : null
    }, { new: true })

    return apiResponse(res, 200, "Event published successfully", data)
}


// =========================================================== AI TITLE SUGGESTION =====================================//
const client = new OpenAI({
    apiKey: process.env.OPEN_AI_API_KEY
});

async function generateTitleSuggestions(req, res) {
    const { title } = req.body;
    if (!title) {
        return ThrowError(400, "Title is required for summary");
    }

    const prompt = `
                You are an AI assistant that helps users create event content for an event organizing platform.

            Input provided by user:
                - Title: ${title || "Not provided"}

            Task:
            1. Generate ONLY a short event summary (1 sentences) directly, without any extra explanation or phrases like "Sure" or "Here is".
            2. The tone should be engaging, professional, and concise.
            3. Do not ask questions back to the user, and do not mention "title" in the response.
            4. Output must be plain text only.
`;

    const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{
            role: "user",
            content: prompt
        }],
    });

    const message = response.choices[0].message.content;
    return apiResponse(res, 200, "Title suggested", message)

}

async function generateOverviewSuggestions(req, res) {
    const { title, date, time, location } = req.body;
    if (!title) {
        return ThrowError(400, "Title is required for summary");
    }

    const prompt = `
        You are an AI content assistant for an event organizing platform. 
        Your job is to generate a warm and engaging event overview for users.

        Guidelines:
        - Begin with a greeting like "Welcome", "Get ready", "Step into", or something similar (not "Join us").
        - Write in a natural, professional but friendly tone. 
        - Use the provided details (Title, Date, Time, Location, etc.) seamlessly in the overview. 
        - Keep it concise (3-5 sentences), engaging, and easy to read. 
        - Do not use bold formatting, quotes, or repeat the user's input verbatim. 
        - Never ask the user for more info; always provide a complete overview with whatever details are available.

        User provided:
        - Title: ${title || "Not provided"}
        - Date: ${date || "Not provided"}
        - Time: ${time || "Not provided"}
        - Location: ${location || "Not provided"}

        Task:
        Generate an engaging event overview following the above rules.
`;


    const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{
            role: "user",
            content: prompt
        }],
    });

    const message = response.choices[0].message.content;
    return apiResponse(res, 200, "Overview suggested", message)

}


module.exports = {
    createEvents,
    getOrganisersEvents,
    updateOrganisersEvents,
    addTicketToEvent,
    publicEvent,
    generateTitleSuggestions,
    generateOverviewSuggestions
}

//   - Description: ${description || "Not provided"}
// //   - Summary: ${summary || "Not provided"}