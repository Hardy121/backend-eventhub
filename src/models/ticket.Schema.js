const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    price: {
        type: Number,
        require: true
    },
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "events",
        required: true
    },
    type: {
        type: String
    },
    total: {
        type: Number,
    },
    booked: {
        type: Number
    },
    salesStarts: {
        type: Date
    },
    salesEnd: {
        type: Date
    }
})

const Tickets = mongoose.model('tickets', ticketSchema)

module.exports = Tickets
