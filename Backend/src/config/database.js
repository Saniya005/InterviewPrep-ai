const mongoose = require("mongoose")


async function conntectToDB() {

   try {
    await mongoose.connect(process.env.MONGO_URI)
    
    console.log("COnnected to db")
} 
catch(err){
    console.log(err)
}
}

module.exports = conntectToDB