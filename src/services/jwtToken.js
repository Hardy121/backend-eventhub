const jwtToken = require('jsonwebtoken');

async function generateJwtToken(data) {
    try {
        const JwtToken = await jwtToken.sign(data, "wTSUqw0Y6xmnT8yEXH2l4uvSCEb2PW9preJ1T", { algorithm: 'HS256' });
        return JwtToken
    } catch (error) {
        console.log("jwt generate error", error?.message)
    }
}

async function decodeJwtToken(token) {
    try {
        const decodedJwtToken = await jwtToken.decode(token)
        return decodedJwtToken
    } catch (error) {
        console.log("jwt decode error", error?.message)
    }
}

async function verifyJwtToken(token) {
    try {
        await jwtToken.verify(token, 'wTSUqw0Y6xmnT8yEXH2l4uvSCEb2PW9preJ1T');
        return true
    } catch (error) {
        return false
    }
}
module.exports = { generateJwtToken, decodeJwtToken, verifyJwtToken }