import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema({
    videoFile: {
        type: String, //cloudnary url
        required: true
    },
    thumbnail: {
        type: String, //cloudnary url
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    views: {
        type: Number,
        required: true
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    owner: [
        {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    ],

})

videoSchema.plugin(mongooseAggregatePaginate)
export const video = mongoose.model("video", videoSchema)