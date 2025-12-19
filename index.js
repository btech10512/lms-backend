import express from "express"
import dotenv from "dotenv"
// import { connect } from "mongoose"
import connectDB from "./database/dbConnect.js"
import userRoute from "./routes/user.routes.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import courseRoute from "./routes/course.route.js"
import mediaRoute from "./routes/media.route.js"
import purchaseRoute from "./routes/purchaseCourse.route.js"
import courseProgressRoute from "./routes/courseProgress.route.js"
dotenv.config()
connectDB()
const app = express()




const PORT = process.env.PORT || 3000

//default middleware

app.use(express.json())
app.use(cookieParser())
app.use(cors({
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      credentials:true
}))
app.use("/api/v1/media",mediaRoute)
app.use("/api/v1/user",userRoute)
app.use("/api/v1/course",courseRoute)
app.use("/api/v1/purchase",purchaseRoute)
app.use("/api/v1/progress",courseProgressRoute)

app.listen(PORT,"0.0.0.0",() => {
      console.log(`server is listening at PORT:${PORT}`);
      
})
