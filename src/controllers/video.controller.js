import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asynchandler} from "../utils/asynchandler.js"
import {uploadOnCloudinary, deleteFromCloudinary} from "../utils/cloudinary.js"
import { getVideoDurationInSeconds } from "get-video-duration";

const getAllVideos = asynchandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asynchandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    const videoFile = req.files["videoFile"]?.[0]?.path
    const thumbnail = req.files["thumbnail"]?.[0]?.path

    if (!videoFile) {
        throw new apiError(400, "No videoFile file has been attached")
    }

    if (!thumbnail) {
        throw new apiError(400, "No thumbnail file has been attached")
    }

    const duration = await getVideoDurationInSeconds(videoFile)

    const uploadVideo = await uploadOnCloudinary(videoFile)
    const uploadThumbnail = await uploadOnCloudinary(thumbnail)

    if(!(uploadVideo || uploadThumbnail)) {
        return new apiError(500, "Video not uploaded on cloudinary")
    }

    const newVideo =new Video({
        videoFile: uploadVideo.url,
        thumbnail: uploadThumbnail.url, 
        title, 
        description, 
        duration: duration,
        isPublished: true,
        owner: req.user._id
    })

    await newVideo.save()

    return res
    .status(200)
    .json(new apiResponse(200, newVideo, "Video published successfully"))
})

const getVideoById = asynchandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asynchandler(async (req, res) => {
    //TODO: update video details like title, description, thumbnail
    const { videoId } = req.params
    const {title, description} = req.body
    const thumbnail = req.file["thumbnail"]?.[0]?.path || null
                       
    if (!title && !description && !thumbnail) {
        throw new apiError(400, "At least one field (title, description, thumbnail) must be provided")
    }

    let updatedFields = {}
    if (title) {
        updatedFields.title = title
    }
    if (description) {
        updatedFields.description = description
    }
    if(thumbnail){
        const uploadThumbnail = await uploadOnCloudinary(thumbnail)

        if (!uploadThumbnail) {
            throw new apiError(500, "Thumbnail not uploaded on cloudinary")
        }
        updatedFields.thumbnail = uploadThumbnail.url
    }
    
    // object spread operator
    // let updatedFields ={
    //     ...(title && {title}),
    //     ...(description && {description}),
    //     ...(thumbnail && {thumbnail: (await uploadOnCloudinary(thumbnail))?.url})
    // }

    const updateVideo = await Video.findByIdAndUpdate(
        videoId, updatedFields, {new: true})
    
    if (!updateVideo) {
        throw new apiError(404, "Video not found")
    }    
    
    return res
    .status(200)
    .json(new apiResponse(200, updateVideo, "Video details updated successfully"))
})

const deleteVideo = asynchandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    const video = await Video.findById(videoId)

    if (!video) {
        throw new apiError(404,"Video not found")
    }
    const urlParts = video.videoFile.split("/");
    const filename = urlParts[urlParts.length - 1]; // e.g. myvideo.mp4
    const publicId = urlParts.slice(urlParts.indexOf("upload") + 1).join("/").replace(/\.[^/.]+$/, "");  

    // delete from cloudinary
    if (video.publicId) {
        await deleteFromCloudinary(video.publicId, "video")
    }
    // delete from db
    await Video.findByIdAndDelete(videoId)

    return res
    .status(200)
    .json(new apiResponse(200, {}, "Video deleted successfully"))
})
const getpublicId= asynchandler(async (req, res) => {
    const {videoId} = req.params
    const video = await Video.findById(videoId)

    if (!video) {
        throw new apiError(404,"Video not found")
    }
    const urlParts = video.videoFile.split("/");
    const filename = urlParts[urlParts.length - 1]; // e.g. myvideo.mp4
    const publicId = urlParts.slice(urlParts.indexOf("upload") + 1).join("/").replace(/\.[^/.]+$/, "");  

    if (!publicId) {
        throw new apiError(300, "no public id")
    }
    return res
    .status(200)
    .json(new apiResponse(200, publicId, "Got publicId successfully"))
})

const togglePublishStatus = asynchandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    getpublicId
}
