const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: "hardikmerwork@gmail.com",
        pass: "vvmw mniu dtmm kycy",
    },
});

module.exports = transporter