import mongoose, {Schema} from 'mongoose'

const likeSchema = new Schema({
    videos:
    {
        type: Schema.Types.ObjectId,
        ref: "Video"
    },
    comment: //if user like a comment
    {
        type: Schema.Types.ObjectId,
        ref: "Comment"
    },
    likedBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    tweet: {
        type: Schema.Types.ObjectId,
        ref: "Tweets"
    }
}, {timestamps: true})

export const Like = mongoose.model("Like", likeSchema)