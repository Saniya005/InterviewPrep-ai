require("dotenv").config()
const app = require("./src/app")
const connectToDB = require("./src/config/database")
const express = require("express")

connectToDB()

app.use(express.json())

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
})