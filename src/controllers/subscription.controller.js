import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asynchandler} from "../utils/asynchandler.js"

const toggleSubscription = asynchandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if (!isValidObjectId(channelId)) {
        throw new apiError(400, "Invalid channelId")
    }

    const existingSubscription = await Subscription.findOne({subscriber: req.user._id})
    
    if (!existingSubscription) {
        await Subscription.create({subscriber: req.user._id})
        return res
        .status(200)
        .json(new apiResponse(200, "Channel subscribed"))
    }
    else {
        await Subscription.deleteOne({subscriber: req.user._id})
        return res
        .status(200)
        .json(new apiResponse(200, "Channel unsubscribed"))
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asynchandler(async (req, res) => {
    const {channelId} = req.params
    if (!isValidObjectId(channelId)) {
        throw new apiError(400, "Invalid channelId")
    }

    // iske liye logged-in user dekega ki uska userId kitne subscription docs k channel field mein hain
    const allSubscribers = await Subscription.aggregate([
        {
            $match: {channel: new mongoose.Types.ObjectId(req.user._id)}
        },
        {
            // to fetch username of each subscriber
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriberDetails",
                pipeline: [{
                    $project: {_id: 0, username: 1}
                }]
            }
        },
        {
            $sort: {createdAt: -1}
        }
    ])

    if (!getSubscribedChannels || getSubscribedChannels.length === 0) {
        throw new apiError(404, "No subscribers found");
    }

    return res
        .status(200)
        .json(new apiResponse(200, getSubscribedChannels, "Subscribers fetched successfully"));

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asynchandler(async (req, res) => {
    const { subscriberId } = req.params
    if (!isValidObjectId(subscriberId)) {
        throw new apiError(400, "Invalid channelId")
    }
    // iske liye logged-in user dekega ki uska userId kitne subscription docs k subscriber field mein hain
    const allSubscribedChannel = await Subscription.aggregate([
        {
            $match: {subscriber: new mongoose.Types.ObjectId(req.user._id)}
        },
        // to fetch username of each channel
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channelDetails",
                pipeline: [{
                    $project: {_id: 0, username: 1}
                }]
            }
        },
        {
        $sort: { createdAt: -1 }
        }
    ])

    if (!allSubscribedChannel || allSubscribedChannel.length === 0) {
        throw new apiError(404, "No subscribed channels found");
    }

    return res
        .status(200)
        .json(new apiResponse(200, allSubscribedChannel, "Subscribed channels fetched successfully"));
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}