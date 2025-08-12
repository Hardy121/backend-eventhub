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
        type: Date,
        default: Date.now()
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
    eventTickets: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "tickets",
        required: true
    },
    // startDate: {
    //     type: Date,
    //     required: true
    // },
    // endDate: {
    //     type: Date,
    //     required: true
    // },
    // price: {
    //     type: Number,
    //     required: true
    // }
})


const Events = mongoose.model('events', eventSchema);

module.exports = Events