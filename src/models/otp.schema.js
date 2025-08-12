const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    otp: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true
    },
    verified: {
        type: Boolean,
        default: false
    },
    isUsed: {
        type: Boolean
    }
}, { timestamps: true }
)

const Otp = mongoose.model("otp", otpSchema);

module.exports = Otp