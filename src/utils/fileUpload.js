import { v2 as cloudinary } from 'cloudinary'
import fs from FileSystem

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        const response = await cloudinary.uploader.upload(
            localFilePath, {
            resource_type: 'auto'
        })
        return response
        //file has been uploaded successfully
        console.log("file has been uploaded on cloudinary ", response.url)
    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the operation get failed!!
        return null
    }
}


export {uploadOnCloudinary}