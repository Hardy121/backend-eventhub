
const cloudinary = require('cloudinary').v2
const streamifier = require("streamifier");
require('dotenv').config()


async function uploadImageInCloudinary(fileBuffer) {
    return new Promise((resolve, reject) => {
        cloudinary.config({
            api_secret: process.env.COUDINARY_SECRET,
            cloud_name: process.env.CLOUDINARY_NAME,
            api_key: process.env.CLOUDINARY_KEY,

        });

        let stream = cloudinary.uploader.upload_stream(
            { folder: "event app" },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );

        streamifier.createReadStream(fileBuffer).pipe(stream);
    });
}

async function deleteImageInCloudinary(params) {
    try {
        const deleteImage = await cloudinary.uploader.destroy(image)
        return deleteImage
    } catch (error) {
        console.log(error)
    }
}

module.exports = { uploadImageInCloudinary, deleteImageInCloudinary }