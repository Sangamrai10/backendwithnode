import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema({
    comment: {
        type: Schema.Types.ObjectId,
        ref: "comments"
    },
    video:{
        type:Schema.Types.ObjectId,
        ref:'videos'
    },
    likedBy:{
        type: Schema.Types.ObjectId,
        ref:"videos"
    },
    tweet:{
        type:Schema.Types.ObjectId,
        ref: "tweets"
    }
}, { timestamps: true })

export const likes = mongoose.model("Like", likeSchema)