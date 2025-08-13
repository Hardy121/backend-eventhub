const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
    },
    images: [{
        public_id: { type: String },
        url: { type: String }
    }],
    date: {
        type: String,
        // default: Date.now()
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    location:
    {
        type: String,
        required: true
    },
    overView: {
        type: String,
        required: true
    },
    goodToKnow: [{
        question: { type: String },
        answer: { type: String }
    }
    ],
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    eventTickets: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "tickets",
            required: true
        }
    ],
    // price: {
    //     type: Number,
    //     required: true
    // }
})


const Events = mongoose.model('events', eventSchema);

module.exports = Events