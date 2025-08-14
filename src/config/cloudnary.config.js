
const cloudinary = require('cloudinary').v2

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.COUDINARY_SECRET
});



async function deleteImageInCloudinary(params) {
    try {
        const deleteImage = await cloudinary.uploader.destroy(image)
        return deleteImage
    } catch (error) {
        console.log(error)
    }
}

module.exports = { cloudinary, deleteImageInCloudinary }