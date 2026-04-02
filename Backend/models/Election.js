const mongoose = require("mongoose")

const PostSchema = new mongoose.Schema({
    postName: {
        type: String,
        required: true
    },
    candidates: [{
        name: { type: String, required: true },
        photo: { type: String },
        description: { type: String }
    }]
})

const ElectionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    electionType: {
        type: String,
        enum: ["national", "small"],
        required: true
    },
    verificationField: {
        type: String,
        enum: ["studentId", "citizenshipNumber", "employeeId", "voterId"],
        required: true
    },
    posts: [PostSchema],
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
   status: {
    type: String,
    enum: ["upcoming", "active", "ended"],
    default: "upcoming"
},
displayUntil: {
    type: Date
}
}, { timestamps: true })

module.exports = mongoose.model("Election", ElectionSchema)