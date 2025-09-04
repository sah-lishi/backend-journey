import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asynchandler} from "../utils/asynchandler.js"

const createPlaylist = asynchandler(async (req, res) => {
    const {name, description, videos} = req.body

    // .every() returns true only if all IDs are valid
    const allVideos = videos.every(id => mongoose.isValidObjectId(id))    

    if (!allVideos) {
        throw new apiError(400, "One or more videos are valid")
    }
    //TODO: create playlist
    // videos array, owner
    const videoIds = videos 
        ? videos.map(id => new mongoose.Types.ObjectId(id))
        : []
        

    const newPlaylist = new Playlist({
        name,
        description,
        videos: videoIds,
        owner: req.user._id
    })

    // if (!playlist) {
    //     throw new apiError(500, "Playlist creation unsuccessfull")
    // }
    await newPlaylist.save()

    return res
    .status(200)
    .json(new apiResponse(200, newPlaylist, "Playlist created successfully"))
})

const getUserPlaylists = asynchandler(async (req, res) => {
    const {page = 1, limit = 10, userId} = req.params
    //TODO: get user playlists
    if (!isValidObjectId(userId)) {
        throw new apiError(400, "Invalid playlistId")
    }

    const pageNum = parseInt(page)
    
    const allPlaylist = await Playlist.aggregate([
        {
            $match: {owner: new mongoose.Types.ObjectId(userId)}
        },
        {
            $sort: {createdAt: -1},
        },
        {
            $skip: (pageNum - 1) * parseInt(limit),
        },
        {
            $limit: parseInt(limit)
        }
    ])

    if (!allPlaylist || allPlaylist.length === 0) {
        throw new apiError(500, "Error occured while fetching all playlists")
    }

    return res
    .status(200)
    .json(new apiResponse(200, allPlaylist, "All Playlist fetched successfully"))
})

const getPlaylistById = asynchandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if (!isValidObjectId(playlistId)) {
        throw new apiError(400, "Invalid playlistId")
    }

    // this will give you the requested playlist with list of videos in it but without sorting and projecting
    // await Playlist.aggregate([
    //     {
    //         $match: {_id: new mongoose.Types.ObjectId(playlistId)}
    //     },
    //     {
    //         $lookup: {
    //             from: "videos",
    //             localField: "videos",
    //             foreignField: "_id",
    //             as: "videos"
    //         }
    //     }
    // ])

    // const aPlaylist = await Playlist.aggregate([
    //     {
    //         $match: {_id: new mongoose.Types.ObjectId(playlistId)}
    //     },
    //     {
    //         $lookup: {
    //             from: "videos",
    //             let: {videoIds: "$videos"},
    //             pipeline: [
    //                 {
    //                     $match:{
    //                         $expr: {$in: ["$_id", "$$videoIds"] }            
    //                     }
    //                 },
    //                 {
    //                     $sort: {createdAt: -1}
    //                 },
                    
    //             ],
    //             as: "videos",
    //         }
    //     }
    // ])

    // replace the $lookup with .populate()
    const aPlaylist = await Playlist
        .findById(playlistId)
        .populate(
            {
                path: "videos",
                options: {
                        $sort: {createdAt: -1}
                    }
            }
        )

    // aggregate() always returns an array
    if (!aPlaylist || aPlaylist.length === 0) {
        throw new apiError(500, "Error occured while fetching playlist")
    }

    return res
    .status(200)
    .json(new apiResponse(200, aPlaylist, "Playlist fetched successfully"))

})

const addVideoToPlaylist = asynchandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if (!isValidObjectId(videoId)) {
        throw new apiError(400, "Invalid videoId")
    }
    // const videoId = videos 
    //     ? videos.map(id => new mongoose.Types.ObjectId(id))

    //add one video at a time
    const addToPlaylist = await Playlist.findByIdAndUpdate(
        playlistId, 
        {videos: videoId}, 
        {new: true}
    )

    if (!addToPlaylist) {
        throw new apiError(404, "Unable to add video to the playlist")
    }    
    
    return res
    .status(200)
    .json(new apiResponse(200, addToPlaylist, "Video added to the playlist successfully"))
})

const removeVideoFromPlaylist = asynchandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    // await Playlist.findByIdAndDelete(playlistId, {videos: videoId})
    if (!isValidObjectId(videoId)) {
        throw new apiError(400, "Invalid videoId")
    }

    if (!isValidObjectId(playlistId)) {
        throw new apiError(400, "Invalid playlistId")
    }
    const videoRemoved = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: {videos: videoId}
        },
        {new: true}
    )

    if (!videoRemoved) {
        throw new apiError(400, "Unable to remove the video from playlist")
    }

    return res
    .status(200)
    .json(new apiResponse(200, videoRemoved, "Video removed from the playlist"))
})

const deletePlaylist = asynchandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if (!isValidObjectId(playlistId)) {
        throw new apiError(400, "Invalid videoId")
    }

    await Playlist.findByIdAndDelete(playlistId)

    return res
    .status(200)
    .json(new apiResponse(200, {}, "Playlist deleted successfully"))
})

const updatePlaylist = asynchandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    if (!isValidObjectId(playlistId)) {
        throw new apiError(400, "Invalid videoId")
    }

    const updatedFields ={}
    if (name) {
        updatedFields.name = name
    }
    if (description) {
        updatedFields.description = description
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        updatedFields,
        {new: true}
    )

    if (!updatedPlaylist) {
        throw new apiError(404, "Playlist not updated")
    }    
    
    return res
    .status(200)
    .json(new apiResponse(200, updatedPlaylist, "Playlist updated successfully"))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
