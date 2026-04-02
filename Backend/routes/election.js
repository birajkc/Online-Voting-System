const express = require("express")
const router = express.Router()
const Election = require("../models/Election")
const auth = require("../middleware/auth")

// Create Election
router.post("/create", auth, async (req, res) => {
    try {
        const {
            title,
            description,
            electionType,
            verificationField,
            posts,
            startTime,
            endTime,
            voters
        } = req.body

        const election = new Election({
            title,
            description,
            electionType,
            verificationField,
            posts,
            startTime,
            endTime,
            createdBy: req.user.id
        })

        await election.save()

        // If voters are provided, save them too
        if (voters && voters.length > 0) {
            const Voter = require("../models/Voter")
            const voterDocs = voters.map(v => ({
                election: election._id,
                name: v.name,
                verificationId: v.verificationId,
                email: v.email,
                phone: v.phone,
                accountExpiresAt: endTime
            }))
            await Voter.insertMany(voterDocs)
        }

        res.status(201).json({
            message: "Election created successfully",
            election
        })

    } catch (error) {
        res.status(500).json({ message: "Server error", error })
    }
})

// Get All Elections (for admin)
router.get("/all", auth, async (req, res) => {
    try {
        const now = new Date()
        const elections = await Election.find({
            createdBy: req.user.id,
            $or: [
                { displayUntil: { $exists: false } },
                { displayUntil: null },
                { displayUntil: { $gt: now } }
            ]
        })
        res.json(elections)
    } catch (error) {
        res.status(500).json({ message: "Server error", error })
    }
})

// Get Single Election
router.get("/:id", async (req, res) => {
    try {
        const election = await Election.findById(req.params.id)
        if (!election) {
            return res.status(404).json({ message: "Election not found" })
        }
        res.json(election)
    } catch (error) {
        res.status(500).json({ message: "Server error", error })
    }
})

// Update Election Status
router.put("/:id/status", auth, async (req, res) => {
    try {
        const { status } = req.body
        const election = await Election.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        )
        res.json({ message: "Status updated", election })
    } catch (error) {
        res.status(500).json({ message: "Server error", error })
    }
})
router.delete("/:id", auth, async (req, res) => {
    try {
        await Election.findByIdAndDelete(req.params.id)
        const Voter = require("../models/Voter")
        await Voter.deleteMany({ election: req.params.id })
        res.json({ message: "Election deleted" })
    } catch (error) {
        res.status(500).json({ message: "Server error", error })
    }
})

module.exports = router