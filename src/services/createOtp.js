function generateOtp() {
    const digits = Math.floor(Math.random() * 1000000 + 9999);
    return digits.toString()
}

module.exports = { generateOtp }