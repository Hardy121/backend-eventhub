const Otp = require("../models/otp.schema");
const { generateOtp } = require("./createOtp");
const bcrypt = require('bcrypt');
const transporter = require("./sendEmail");

async function sendOtp(email, OTP_EXPIRY_MINUTES) {
    const generatedOtp = generateOtp();

    const hashedOtp = await bcrypt.hash(generatedOtp, 10);

    await Otp.deleteMany({ email });


    await Otp.create({
        email,
        otp: hashedOtp,
        expiresAt: Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000,
        verified: false
    });

    transporter?.sendMail({
        from: `Event manaement`,
        to: `${email}`,
        subject: `OTP verification `,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2>Here’s your one-time code </h2>
            <p>For your security, this code can only be used once, and it expires after 15 minutes.</p>
            <div style="margin-top: 30px; color: #000000; font-size: 12px;">
            <p>${generatedOtp} Expires in ${OTP_EXPIRY_MINUTES} minutes</p>
            </div>
            </div>
            `
    });
}

module.exports = { sendOtp }