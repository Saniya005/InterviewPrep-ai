const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const rateLimit = require("express-rate-limit")

const app = express()
app.set('trust proxy', 1)

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}))

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { message: "Too many requests, please try again after 15 minutes." }
})

const interviewLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: "Too many requests, please try again after 15 minutes." }
})

/* require all the routes here */
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")

/* using all the routes here */
app.use("/api/auth", authLimiter, authRouter)
app.use("/api/interview", interviewLimiter, interviewRouter)

module.exports = app