const mongoose = require("mongoose")

const VoterSchema = new mongoose.Schema({
    election: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Election",
        required: true
    },
    name: {
        type: String,
        required: true
    },
    verificationId: {
        type: String,
        required: true
    },
    email: {
        type: String
    },
    phone: {
        type: String
    },
    password: {
        type: String
    },
    otp: {
        type: String
    },
    otpExpiry: {
        type: Date
    },
    hasVoted: {
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    accountExpiresAt: {
        type: Date
    }
}, { timestamps: true })

module.exports = mongoose.model("Voter", VoterSchema)