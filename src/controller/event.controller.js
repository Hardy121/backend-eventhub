
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

    let images = [];
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

    if ([title, description, date, startTime, endTime, location].some(field => !field?.trim())) {
        return ThrowError(400, 'All fields are required')
    }

    const eventDate = new Date(date);
    if (eventDate <= new Date()) {
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
        publishDate: null,
        status: 'draft',
    });

    return apiResponse(res, 200, "Event created successfully", data)
}

async function updateOrganisersEvents(req, res) {
    const userData = await sendingDataInHeader(req);
    if (!userData) return ThrowError(401, "Unauthorised request");

    const { id } = req.params;

    const { title, description, date, startTime, endTime, location, overView, goodToKnow, existingImages } = req.body;
    const findEvent = await Events.findById(id);
    if (!findEvent) {
        return ThrowError(401, "Event not found");
    }

    let images = [];
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

    const eventDate = new Date(date)
    if (eventDate <= new Date()) {
        return ThrowError(400, 'Event date must be in the future')
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
        publishDate: null,
        status: 'draft',

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
    if (!userData) return ThrowError(401, "Unauthorised request");

    const { id } = req.params;
    const { eventTickets } = req.body;

    const findEvent = await Events.findById(id)
    if (!findEvent) {
        return ThrowError(404, "Event not found")
    }

    if (eventTickets.length < 1) {
        return ThrowError(400, 'At least one ticket type is required')
    }

    const types = new Set();
    eventTickets.forEach(ticket => {
        if (!ticket.price || ticket.price <= 0) {
            ThrowError(400, "Ticket price must be greater than 0");
        }
        if (!ticket.type) {
            ThrowError(400, "Ticket type is required");
        }
        if (!['General', 'Reserved', 'VIP', 'VVIP'].includes(ticket.type)) {
            ThrowError(400, "Invalid ticket type");
        }
        if (types.has(ticket.type)) {
            ThrowError(400, `Duplicate ticket type '${ticket.type}' is not allowed`);
        }
        types.add(ticket.type);
    });

    const data = await Events.findByIdAndUpdate(id, {
        $push: { eventTickets: { $each: eventTickets } },
        status: 'draft'
    }, { new: true });
    return apiResponse(res, 200, "Tickets added successfully", data)
}

async function publicEvent(req, res) {
    const userData = await sendingDataInHeader(req);
    if (!userData) return ThrowError(401, "Unauthorised request");
    const { id } = req.params;

    const isEventExist = await Events.findById(id);
    if (!isEventExist) {
        return ThrowError(400, "Event not found");
    }

    if (isEventExist?.organizer?._id.toString() !== userData?.id) {
        return ThrowError(403, "You are not allowed to publish this event");
    }

    const { eventType, category, tags, refundPolicy, isRefundPolicy, whenToPublish, publishDate, } = req.body;

    let finalPublishDate = isEventExist.publishDate;
    let status = "draft";
    if (whenToPublish === "now") {
        status = "published";
        finalPublishDate = new Date();
    } else if (whenToPublish === "later") {
        if (!publishDate) {
            return ThrowError(400, "Publish date is required when scheduling later");
        }
        if (new Date(publishDate) <= new Date()) {
            return ThrowError(400, "Publish date must be in the future");
        }
        status = "draft";
        finalPublishDate = new Date(publishDate);
    }

    let updatedRefundPolicy = isRefundPolicy ? refundPolicy : null;



    const data = await Events.findByIdAndUpdate(id, {
        eventType,
        category,
        tags,
        refundPolicy: updatedRefundPolicy,
        isRefundPolicy,
        status,
        publishDate: finalPublishDate
    }, { new: true })

    return apiResponse(res, 200, "Event published successfully", data)
}

// ================================================ get-All-Event ===========================================//

async function getAllEvent(req, res) {
    const now = new Date();

    await Events.updateMany(
        { status: "draft", finalPublishDate: { $lte: now } },
        { $set: { status: "publish" } }
    );

    const events = await Events.find({ status: "published" }).populate("eventTickets")


    if (!events.length) {
        return ThrowError(404, "Events not found")
    }
    return apiResponse(res, 200, "Events fetch successfully", events)
}

async function getAllEventById(req, res) {
    const { id } = req.params;

    if (!id) {
        return ThrowError(400, "Id is required")
    }

    const event = await Events.findById(id)

    if (!event) {
        return ThrowError(400, "Event not found")
    }

    return apiResponse(res, 200, "Event fetch successfully", event)


}

// ================================================ bookEvent ===========================================//

async function bookEvent(req, res) {
    const userData = await sendingDataInHeader(req);
    if (!userData) return apiResponse(res, 401, "Unauthorised request");
    const { id } = req.params;
    const { type } = req.body;
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
    // ====================== ai suggetion ==========================
    generateTitleSuggestions,
    generateOverviewSuggestions,
    // =================== get event ===========================
    getAllEvent,
    getAllEventById,
    bookEvent
}

//   - Description: ${description || "Not provided"}
// //   - Summary: ${summary || "Not provided"}