import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import {Comment} from "../models/comment.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asynchandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    const video = await Video.findById(videoId)
    if (!video) {
        throw new apiError(400, "Video not found")
    }

    let pageNum = parseInt(page)

    const comments = await Comment.aggregate([
        {
            $match: {video: new mongoose.Types.ObjectId(videoId)}
        },
        {
            $sort: {createdAt: -1}
        },
        {
            $skip: (pageNum - 1) * parseInt(limit)
        },
        {
            $limit: parseInt(limit)
        }
    ])

    res
    .status(200)
    .json(new apiResponse(200, comments, "Comments fetched successfully"))
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params
    const video = await Video.findById(videoId)
    if (!video) {
        throw new apiError(400, "Video not found")
    }

    const {content} = req.body
    if (!content) {
        throw new apiError(400, "Empty field!")
    }

    const comment = new Comment({
        content,
        video: videoId,
        owner: req.user._id
    })
    await comment.save()

    res
    .status(200)
    .json(new apiResponse(201, comment, "Comment added successfully"))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params

    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new apiError(400, "Invalid request")
    }

    const {content} = req.body
    if (!content) {
        throw new apiError(400, "Empty field!")
    }

    const updateComment = await Comment.findByIdAndUpdate(commentId, content, {new: true})
    if (!updateComment) {
        throw new apiError(500, "Something went wrong while updating comment")
    }

    res
    .status(200)
    .json(new apiResponse(200, "Comment updated successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params
    const comment = await Comment.findById(commentId)
    if (!comment) {
        throw new apiError(400, "Invalid request, no comment found for deletion")
    }

    await Comment.findByIdAndDelete(commentId)

    res
    .status(200)
    .json(new apiResponse(200, "Comment deleted successfully"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}
