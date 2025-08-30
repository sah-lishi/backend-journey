import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});
    
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            return null
        }
        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })

        fs.unlinkSync(localFilePath)
        console.log("File uploaded on CLOUDINARY: ", response);
        return response
        
    } catch (error) {
        fs.unlinkSync(localFilePath) // remove locally saved temp. file when the upload operation gets failed
    }
}

const deleteFromCloudinary = async (publicId, resourceType = "video") =>{
    try {
        const response = await cloudinary.uploader.destroy(publicId, {resource_type: resourceType})
        console.log(response);
        
        return response
    } catch (error) {
        console.error("Cloudinary delete error: ", error)
        return null
    }
}
    
export {
    uploadOnCloudinary,
    deleteFromCloudinary
}