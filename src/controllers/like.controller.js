import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {Like} from "../models/like.model.js"
import {Tweet} from "../models/tweets.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asynchandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    if (!isValidObjectId(videoId)) {
        throw new apiError(400, "Invalid videoId")
    }
    //TODO: toggle like on video
    const video = await Video.findById(videoId)
    if (!video) {
        throw new apiError(400, "No video present")
    }

    const existingLike = await Like.findOne({likedBy: req.user._id, videos: videoId})

    if (!existingLike) {
        await Like.create({videos: videoId, likedBy: req.user._id})
        return res
        .status(200)
        .json(new apiResponse(200, "Video liked"))
    }
    else {
        await Like.deleteOne({videos: videoId, likedBy: req.user._id})
        return res
        .status(200)
        .json(new apiResponse(200, "Video unliked"))
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    if (!isValidObjectId(commentId)) {
        throw new apiError(400, "Invalid commentId")
    }
    //TODO: toggle like on comment
    const comment = await Comment.findById(commentId)
    if (!comment) {
        throw new apiError(400, "No comment present")
    }

    const existingLike = await Like.findOne({likedBy: req.user._id, comment: commentId})

    if (!existingLike) {
        await Like.create({comment: commentId, likedBy: req.user._id})
        return res
        .status(200)
        .json(new apiResponse(200, "Video liked"))
    }
    else {
        await Like.deleteOne({comment: commentId, likedBy: req.user._id})
        return res
        .status(200)
        .json(new apiResponse(200, "Video unliked"))
    }
})


const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    
    if (!isValidObjectId(tweetId)) {
        throw new apiError(400, "Invalid videoId")
    }
    
    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new apiError(400, "No video present")
    }

    const existingLike = await Like.findOne({likedBy: req.user._id, tweet: tweetId})

    if (!existingLike) {
        await Like.create({tweet: tweetId, likedBy: req.user._id})
        return res
        .status(200)
        .json(new apiResponse(200, "Video liked"))
    }
    else {
        await Like.deleteOne({tweet: tweetId, likedBy: req.user._id})
        return res
        .status(200)
        .json(new apiResponse(200, "Video unliked"))
    }
})

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    // if like is more than equal to 1 then fetch that video
    // lookup concept-join
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}