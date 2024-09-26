import mongoose, { Schema } from "mongoose";

const subscribeSchema= new Schema({
    scubscriber:{
        type: Schema.Types.ObjectId,
        ref:"User"
    },
    channel:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps: true})

export const subscribe=mongoose.Schema("Subcriber", subscribeSchema)