const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const rateLimit = require("express-rate-limit")

const app = express()
app.set('trust proxy', 1)

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: function(origin, callback) {
        if (!origin || origin.endsWith('.vercel.app') || origin === 'http://localhost:5173') {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
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

const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")

app.use("/api/auth", authLimiter, authRouter)
app.use("/api/interview", interviewLimiter, interviewRouter)

module.exports = app