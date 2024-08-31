import dotenv from "dotenv"
import connetDB from "./db/index.js";


dotenv.config({
    path: './env'
})

connetDB()



// import express from "express"
//const app = express()
// ;(async ()=>{
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on("error",()=>{
//             console.log('error ', error)
//             throw err
//         })
//         app.listen(process.env.PORT, ()=>{
//             console.log(`server listening at on port ${process.env.PORT}`)
//         })
//     } catch (error) {
//         console.log("error ", error)
//         throw err
//     }
// })();