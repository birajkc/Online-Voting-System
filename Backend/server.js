require("dotenv").config()
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")

const app = express()

app.use(express.json())
app.use(cors())
app.use("/uploads", express.static("uploads"))

mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    console.log("MongoDB Connected")
})

// Auto update election status every minute
const Election = require("./models/Election")
setInterval(async () => {
    const now = new Date()
    await Election.updateMany(
        { startTime: { $lte: now }, endTime: { $gte: now }, status: "upcoming" },
        { status: "active" }
    )
    await Election.updateMany(
        { endTime: { $lte: now }, status: { $ne: "ended" } },
        { status: "ended" }
    )
}, 60000)

require("./models/User")
require("./models/Election")
require("./models/Voter")
require("./models/Vote")

app.use("/api/auth", require("./routes/auth"))
app.use("/api/election", require("./routes/election"))
app.use("/api/voter", require("./routes/voter"))
app.use("/api/vote", require("./routes/vote"))
app.use("/api/upload", require("./routes/upload"))

app.get("/",(req,res)=>{
    res.send("Online Voting System Running")
})

app.listen(process.env.PORT,()=>{
    console.log(`Server running on port ${process.env.PORT}`)
})