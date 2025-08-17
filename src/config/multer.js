const multer = require("multer");
const path = require("path");
const uploadDir = path.join("/tmp");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

module.exports = multer({ storage });
