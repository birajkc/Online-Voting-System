const mongoose = require("mongoose")

const VoteSchema = new mongoose.Schema({
    election: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Election",
        required: true
    },
    voter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Voter",
        required: true
    },
    votes: [{
        postName: {
            type: String,
            required: true
        },
        candidateName: {
            type: String,
            required: true
        }
    }],
    encryptedData: {
        type: String
    },
    castedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true })

module.exports = mongoose.model("Vote", VoteSchema)