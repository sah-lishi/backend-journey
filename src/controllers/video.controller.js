import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asynchandler} from "../utils/asynchandler.js"
import {uploadOnCloudinary, deleteFromCloudinary} from "../utils/cloudinary.js"
import { getVideoDurationInSeconds } from "get-video-duration";

const getAllVideos = asynchandler(async (req, res) => {
    const { page = 1, limit = 10, title = "", sortBy, sortType, userId } = req.query
    //TODO: 
    const match = {}
    if (title) {
        match.title = {$regex: title, $options: "i"}
    }
    if(userId) {
        match.owner = new mongoose.Types.ObjectId(userId)
    }

    match.views = { $gte: 2}

    // logic for only allowed sorts
    const allowedSortFields =[isPublished, views]
    let sortField = isPublished // default
    if (sortBy && allowedSortFields.includes(sortBy)) {
        sortField = sortBy
    }

    const videos = await Video.aggregate([
        // stage 1
        {
            $match: match,
        },
        // stage 2
        {
            $sort: {[sortField]: sortType === "desc" ? -1 : 1},
        },
        // stage 3
        {
            $skip: (page - 1) * parseInt(limit),
        },
        // stage 4
        {
            $limit: parseInt(limit)
        }
    ])
    res.status(200).json( new apiResponse(200, videos, "All videos fetched successfully"))
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
        videoFile: {
            url: uploadVideo.secure_url,
            public_id: uploadVideo.public_id
        },
        thumbnail: {
            url: uploadThumbnail.secure_url,
            public_id: uploadThumbnail.public_id
        },
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
  
    const video = await Video.findById(videoId)
    if (!video) {
        throw new apiError(400, "No such video found")
    }
    
    //get user id
    const userId = req.user._id
    const user = await User.findById(userId)
    
    // check if the video is present in user watch history, if not then push the video id into watch history and increment view field
    if(!user.watchHistory.includes(videoId)) {
        Video.findByIdAndUpdate(videoId,
            { $inc: { views: 1}}
        )
        
        user.watchHistory.push(videoId)
        await user.save()
    }


    return res
    .status(200)
    .json( 
        new apiResponse(200, video, "Video fetched successfully")
    )
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
    const userId = req.user._id
    //TODO: delete video
    const video = await Video.findById(videoId)

    if (!video) {
        throw new apiError(404,"Video not found")
    }
    if(video.owner.toString() !== userId.toString()){
        throw new apiError(400, "Unauthorixed to delete the video")
    }
    
    // delete from cloudinary
    if (video.videoFile.public_id) {
        await deleteFromCloudinary(video.videoFile.public_id, "video")
    }
    if (video.thumbnail.public_id) {
        await deleteFromCloudinary(video.thumbnail.public_id, "image")
    }
    // delete from db
    await Video.findByIdAndDelete(videoId)

    return res
    .status(200)
    .json(new apiResponse(200, {}, "Video deleted successfully"))
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

}
