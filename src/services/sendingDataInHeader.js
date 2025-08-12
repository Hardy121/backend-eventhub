const { decodeJwtToken } = require("./jwtToken");

async function sendingDataInHeader(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
    const token = authHeader.split(" ")[1];
    return await decodeJwtToken(token);

}
module.exports = { sendingDataInHeader }