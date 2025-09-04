import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asynchandler} from "../utils/asynchandler.js"

const createTweet = asynchandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body

    if (!content || content.trim() === "") {
        throw new apiError(404, "Tweet content cannot be empty")
    }

    const newTweet = await Tweet.create({
        owner: req.user._id,
        content
    })

    if (!newTweet) {
        throw new apiError(500, "Unable to tweet")
    }

    return res
    .status(200)
    .json(new apiResponse(200, newTweet, "Tweet posted successfully"))
})

const getUserTweets = asynchandler(async (req, res) => {
    // TODO: get user tweets
    const { page = 1, limit = 10, userId } = req.query
   

    let pageNum = parseInt(page)

    const userTweets = await Tweet.aggregate([
        {
            $match: {owner: new mongoose.Types.ObjectId(userId)}
        },
        {
            $sort: {createdAt: -1},
        },
        // stage 3
        {
            $skip: (pageNum - 1) * parseInt(limit),
        },
        // stage 4
        {
            $limit: parseInt(limit)
        }
    ])

    if (!userTweets || userTweets.length === 0) {
        throw new apiError(500, "Error occured while fetching tweets")
    }

    return res
    .status(200)
    .json(new apiResponse(200, userTweets, "Tweet posted successfully"))
})

const updateTweet = asynchandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params
    const {content} = req.body

    if (isValidObjectId(tweetId)) {
        throw new apiError("Invalid tweet id")
    }

    if (!content || content.trim() === "") {
        throw new apiError(404, "Tweet content cannot be empty")
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(tweetId, content, {new: true})

    if (!updatedTweet) {
        throw new apiError(404, "Tweet not updated")
    }    
    
    return res
    .status(200)
    .json(new apiResponse(200, updatedTweet, "Tweet updated successfully"))
})

const deleteTweet = asynchandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params

    if (isValidObjectId(tweetId)) {
        throw new apiError("Invalid tweet id")
    }

    await Tweet.findByIdAndDelete(tweetId)

    return res
    .status(200)
    .json(new apiResponse(200, {}, "Tweet deleted successfully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
