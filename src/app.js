import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express();

//configure cross origin 
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

//accept JSON data
app.use(express.json({limit:"20kb"}))

//read url
app.use(express.urlencoded({
    extended: true,
    limit:"20kb"
}))

//store images
app.use(express.static("public"))

//cookie
app.use(cookieParser())

//routes import 
 import userRouter from './routes/user.routes.js'
 //routes declaration
 app.use("/api/v1/users", userRouter)

export {app}