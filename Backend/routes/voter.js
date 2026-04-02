const express = require("express")
const router = express.Router()
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const nodemailer = require("nodemailer")
const Voter = require("../models/Voter")
const Election = require("../models/Election")
const auth = require("../middleware/auth")

// Add voters list (admin uploads voter data)
router.post("/add", auth, async (req, res) => {
    try {
        const { electionId, voters } = req.body

        const election = await Election.findById(electionId)
        if (!election) {
            return res.status(404).json({ message: "Election not found" })
        }

        const voterDocs = voters.map(v => ({
            election: electionId,
            name: v.name,
            verificationId: v.verificationId,
            email: v.email,
            phone: v.phone,
            accountExpiresAt: election.endTime
        }))

        await Voter.insertMany(voterDocs)
        res.status(201).json({ message: `${voters.length} voters added successfully` })

    } catch (error) {
        res.status(500).json({ message: "Server error", error })
    }
})

// Send OTP to voter
router.post("/send-otp", async (req, res) => {
    try {
        const { electionId, verificationId } = req.body

        console.log("Send OTP request:", { electionId, verificationId })

        const voter = await Voter.findOne({ election: electionId, verificationId })
        if (!voter) {
            return res.status(404).json({ message: "Voter not found" })
        }

        if (voter.hasVoted) {
            return res.status(400).json({ message: "You have already voted" })
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000)

        voter.otp = otp
        voter.otpExpiry = otpExpiry
        await voter.save()

        console.log("OTP generated:", otp)
        console.log("Sending to:", voter.email)
        console.log("From:", process.env.EMAIL_USER)

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        })

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: voter.email,
            subject: "Your Voting OTP",
            text: `Your OTP is: ${otp}. It expires in 5 minutes.`
        })

        console.log("Email sent successfully!")
        res.json({ message: "OTP sent to your email" })

    } catch (error) {
        console.log("FULL ERROR:", error.message)
        res.status(500).json({ message: error.message || "Server error" })
    }
})

// Verify OTP and set password
router.post("/verify-otp", async (req, res) => {
    try {
        const { electionId, verificationId, otp, password } = req.body

        const voter = await Voter.findOne({ election: electionId, verificationId })
        if (!voter) {
            return res.status(404).json({ message: "Voter not found" })
        }

        if (voter.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" })
        }

        if (voter.otpExpiry < new Date()) {
            return res.status(400).json({ message: "OTP has expired" })
        }

        // Set password
        const hashedPassword = await bcrypt.hash(password, 10)
        voter.password = hashedPassword
        voter.isVerified = true
        voter.otp = null
        voter.otpExpiry = null
        await voter.save()

        // Generate token
        const token = jwt.sign(
            { id: voter._id, electionId },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        )

        res.json({ message: "Verified successfully", token })

    } catch (error) {
        res.status(500).json({ message: "Server error", error })
    }
})

// Voter login
router.post("/login", async (req, res) => {
    try {
        const { electionId, verificationId, password } = req.body

        const voter = await Voter.findOne({ election: electionId, verificationId })
        if (!voter) {
            return res.status(404).json({ message: "Voter not found" })
        }

        if (!voter.isVerified) {
            return res.status(400).json({ message: "Please verify OTP first" })
        }

        if (voter.hasVoted) {
            return res.status(400).json({ message: "You have already voted" })
        }

        const isMatch = await bcrypt.compare(password, voter.password)
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" })
        }

        const token = jwt.sign(
            { id: voter._id, electionId },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        )

        res.json({ message: "Login successful", token })

    } catch (error) {
        res.status(500).json({ message: "Server error", error })
    }
})

module.exports = router