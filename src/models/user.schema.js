const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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
}, { timestamps: true })
// bycrypt password
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(password, 10);
})

const Users = mongoose.model('User', userSchema);
module.exports = Users


// role: ['user', 'organizer', 'admin'],
// https://www.eventbrite.com/manage/events/create