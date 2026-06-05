require("dotenv").config()
const app = require("./src/app")
const connectToDB = require("./src/config/database")
const express = require("express");


connectToDB()

app.use(express.json());

app.listen(3000, () => {
    console.log("sever running")
})