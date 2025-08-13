const Users = require("../models/user.schema");
const { generateJwtToken } = require("../services/jwtToken");
const { apiResponse } = require("../utils/apiResponse");
const bcrypt = require('bcrypt');
const Otp = require("../models/otp.schema");
const { sendingDataInHeader } = require("../services/sendingDataInHeader");
const { sendOtp } = require("../services/sendOtp");
const { oauth2client } = require("../utils/googleConfig");
const { default: axios } = require("axios");


async function signUpUser(req, res) {
    const { name, email } = req.body;
    if (!name || !email) {
        return apiResponse(res, 400, "All fields are required", null)
    }

    const userExist = await Users.findOne({ email });
    if (userExist) {
        return apiResponse(res, 400, "User is already exists with this email", null)
    }

    sendOtp(email, 10);

    const jwtToken = await generateJwtToken({ email, name });

    return apiResponse(res, 200, "Otp sent successfully", {
        name,
        email,
        jwtToken,
        verified: false
    })
}

async function verifyUser(req, res) {
    const userData = await sendingDataInHeader(req);
    if (!userData) return apiResponse(res, 401, "Unauthorised request");

    const { otp } = req.body;

    if (!otp) {
        return apiResponse(res, 400, "Otp is required", null)
    }

    const { email, name } = userData;

    const findOtp = await Otp.findOne({ email });
    if (!findOtp) return apiResponse(res, 400, "OTP not found");

    if (findOtp.expiresAt < Date.now()) {
        await Otp.deleteMany({ email });
        return apiResponse(res, 400, "Otp expired", null)
    }


    const compareOtp = await bcrypt.compare(otp, findOtp?.otp)
    if (!compareOtp) {
        return apiResponse(res, 400, "Invailid Otp", null)
    }

    await Otp.updateOne({ email }, { verified: true })

    const jwtToken = await generateJwtToken({ email, _id: userData?._id });
    return apiResponse(res, 200, "Otp verified successfully", {
        name,
        email,
        jwtToken,
        verified: true
    })

}

async function registerUser(req, res) {

    const userData = await sendingDataInHeader(req);
    if (!userData) return apiResponse(res, 401, "Unauthorised request");

    const { password, confirmPassword } = req.body

    if (!password) {
        return apiResponse(res, 400, "Password is required", null)
    }

    if (password !== confirmPassword) {
        return apiResponse(res, 400, "Password and confirm password should be same", null)
    }

    const { email, name } = userData;

    const findOtp = await Otp.findOne({ email });

    if (!findOtp?.verified || !findOtp) {
        return apiResponse(res, 400, "User is not verified", null)
    }

    const hasedPassword = await bcrypt.hash(password, 10)

    await Users.create({
        name,
        email,
        password: hasedPassword
    })
    await Otp.deleteMany({ email });
    const jwtToken = await generateJwtToken({ email, _id: userData?._id });
    return apiResponse(res, 200, "User registered successfully", {
        name,
        email,
        jwtToken
    })
}

async function loginUser(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        return apiResponse(res, 400, "All fields are required", null)
    }

    const checkUserExist = await Users.findOne({ email });

    if (!checkUserExist) {
        return apiResponse(res, 401, "Invalid credentials", null)
    }

    const checkPassword = await bcrypt.compare(password, checkUserExist?.password);
    if (!checkPassword) {
        return apiResponse(res, 401, "Invalid credentials", null);
    }

    sendOtp(email, 10);

    const jwtToken = await generateJwtToken({ email, _id: userData?._id });

    return apiResponse(res, 200, "Otp sent successfully", { email, jwtToken })
}

async function forgetPassword(req, res) {
    const { email } = req.body;
    if (!email) {
        return apiResponse(res, 400, "Email is required!", null)
    }

    const checkUserExist = await Users.findOne({ email });

    if (!checkUserExist) {
        return apiResponse(res, 401, "Invalid credentials", null)
    }


    await Users.updateOne(
        { _id: checkUserExist?._id },
        { $set: { password: null } }
    );

}

async function googleLogin(req, res) {
    const { code } = req.body;

    const googleRes = await oauth2client.getToken(code)

    oauth2client.setCredentials(googleRes.tokens);

    const userRes = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes?.tokens?.access_token}`)


    const { email, name, picture } = userRes.data;

    let user = await Users?.findOne({ email })

    console.log(user)
    if (!user) {
        user = await Users.create({
            name,
            email
        })
    }
    const { _id } = user;
    const jwtToken = await generateJwtToken({ id: _id, email })
    return apiResponse(res, 200, "Login successfully", { name, email, _id, jwtToken })

}

module.exports = { signUpUser, verifyUser, registerUser, loginUser, forgetPassword, googleLogin }