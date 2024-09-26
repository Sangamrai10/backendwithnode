import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema({
    content:{
        type:String,
        required: true
    },
    video:{
        type:Schema.Types.ObjectId
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps: true})

export const cmnts=mongoose.model("comment", commentSchema)