import dotenv from "dotenv"
import express from "express"

import connectDB from "./db/index.js";

dotenv.config({
    path: './env'
})
connectDB()
// const app = express()

/*;( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)

        app.on("error", () => {
            console.log("Error: App not able to communicate with the db");
            
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`);
            
        })
    } catch (error) {
        console.error("Error: ", error);
        throw err
    }
})()*/