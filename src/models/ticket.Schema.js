// const mongoose = require('mongoose');

// const ticketSchema = new mongoose.Schema({
//     price: {
//         type: Number,
//         require: true
//     },
//     type: {
//         type: String,
//         enum: ['General', 'Reserved', 'VIP', 'VVIP']
//     },
//     total: {
//         type: Number,
//     },
//     booked: {
//         type: Number
//     },
//     salesStarts: {
//         type: String
//     },
//     salesEnd: {
//         type: String
//     },
//     eventId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "events",
//         required: true
//     },
// })

// const Tickets = mongoose.model('tickets', ticketSchema)

// module.exports = Tickets
