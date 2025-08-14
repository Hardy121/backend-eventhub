const multer = require('multer');
const path = require('path');
const fs = require('fs')

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}
const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        console.log("🚀 ~ file:", file)
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

module.exports = multer({ storage });
