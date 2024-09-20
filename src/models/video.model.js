import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema({
    videoFile: {
        type: string, //cloudnary url
        required: true
    },
    thumbnail: {
        type: string, //cloudnary url
        required: true
    },
    title: {
        type: string,
        required: true
    },
    description: {
        type: string,
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
            type: Schema.type.ObjectId,
            ref: "User"
        }
    ],

})

videoSchema.plugin(mongooseAggregatePaginate)
export const video = mongoose.model("video", videoSchema)