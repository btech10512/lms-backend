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
const allowedOrigins = [
  process.env.FRONTEND_URL, // The one from Render Env
  "https://lms-frontend-s3ac.vercel.app", // Your current Vercel URL
  "https://lms-frontend-5p1p.vercel.app", // Your old Vercel URL
  "http://localhost:5173"                 // Local testing
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if the origin is in our allowed list or matches a vercel.app domain
    const isAllowed = allowedOrigins.includes(origin) || origin.endsWith(".vercel.app");
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use("/api/v1/media",mediaRoute)
app.use("/api/v1/user",userRoute)
app.use("/api/v1/course",courseRoute)
app.use("/api/v1/purchase",purchaseRoute)
app.use("/api/v1/progress",courseProgressRoute)

app.listen(PORT,"0.0.0.0",() => {
      console.log(`server is listening at PORT:${PORT}`);
      
})
