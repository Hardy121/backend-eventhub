const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        // required: true
    },
    role: {
        type: String,
        enum: ['user', 'organizer', 'admin'],
        default: 'user'
    }
}, { timestamps: true }

)

const Users = mongoose.model('User', userSchema);
module.exports = Users

// role: ['user', 'organizer', 'admin'],
// https://www.eventbrite.com/manage/events/create