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
            price: { type: Number, required: true },
            type: { type: String, enum: ['General', 'Reserved', 'VIP', 'VVIP'] },
            quantity: { type: Number, },
            booked: { type: Number },
            salesStarts: { type: Date },
            startTime: { type: String },
            salesEnd: { type: Date },
            endTime: { type: String }
        }
    ],
    eventType: {
        type: String,
    },
    category: {
        type: String,
    },
    Tags: {
        type: String,
    },
    isRefundPolicy: {
        type: Boolean,
    },
    refundPolicy: {
        type: String
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'cancelled'],
        default: 'draft'
    },
    publishDate: {
        type: Date,
    }
}, { timestamps: true })


const Events = mongoose.model('events', eventSchema);

module.exports = Events