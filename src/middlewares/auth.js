const { verifyJwtToken } = require("../services/jwtToken");
const { apiResponse } = require("../utils/apiResponse");

async function authMiddleware(req, res, next) {
    try {
        const token = req.headers.authorization;
        if (!token) {
            return apiResponse(res, 404, "Unauthorised request", null)
        }
        const checkVerify = token.split(' ')[1]
        const isVerifiedToken = await verifyJwtToken(checkVerify)
        if (isVerifiedToken) {
            next()
            // return token;
        }
        else {
            return apiResponse(res, 404, "Unauthorised request", null)
        }
    } catch (error) {

    }
}
module.exports = { authMiddleware }