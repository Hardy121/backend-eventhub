
const cloudinary = require('cloudinary').v2

async function uploadImageInCloudinary(path) {
    try {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_NAME,
            api_key: process.env.CLOUDINARY_KEY,
            api_secret: process.env.COUDINARY_SECRET
        });

        const uploadResult = await cloudinary.uploader.upload(path, {
            folder: 'blog app'
        })
        return uploadResult

    } catch (error) {
        console.log("Cloudinary Upload Error:", error);
    }

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