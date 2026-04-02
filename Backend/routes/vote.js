const express = require("express")
const router = express.Router()
const Vote = require("../models/Vote")
const Voter = require("../models/Voter")
const Election = require("../models/Election")
const auth = require("../middleware/auth")
const CryptoJS = require("crypto-js")

const VOTE_SECRET = process.env.VOTE_SECRET

// Encrypt vote
const encryptVote = (votes) => {
    return CryptoJS.AES.encrypt(JSON.stringify(votes), VOTE_SECRET).toString()
}

// Decrypt vote
const decryptVote = (encryptedVote) => {
    const bytes = CryptoJS.AES.decrypt(encryptedVote, VOTE_SECRET)
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
}

// Cast Vote
router.post("/cast", auth, async (req, res) => {
    try {
        const { electionId, votes } = req.body
        const voterId = req.user.id

        const voter = await Voter.findById(voterId)
        if (!voter) {
            return res.status(404).json({ message: "Voter not found" })
        }

        if (voter.hasVoted) {
            return res.status(400).json({ message: "You have already voted" })
        }

        const election = await Election.findById(electionId)
        if (!election) {
            return res.status(404).json({ message: "Election not found" })
        }

        const now = new Date()
        if (now < election.startTime || now > election.endTime) {
            return res.status(400).json({ message: "Election is not active" })
        }

        // Encrypt the votes — nobody can see who voted for whom
        const encryptedVote = encryptVote(votes)

        // Save vote — only encrypted data stored, no plain text votes
        const vote = new Vote({
            election: electionId,
            voter: voterId,
            encryptedData: encryptedVote
        })

        await vote.save()

        // Mark voter as voted
        voter.hasVoted = true
        await voter.save()

        res.status(201).json({ message: "Vote cast successfully" })

    } catch (error) {
        console.log("Cast vote error:", error.message)
        res.status(500).json({ message: "Server error", error })
    }
})

// Get Results
router.get("/results/:electionId", async (req, res) => {
    try {
        const election = await Election.findById(req.params.electionId)
        if (!election) {
            return res.status(404).json({ message: "Election not found" })
        }

        const now = new Date()
        const electionEnded = now > election.endTime

        const totalVoters = await Voter.countDocuments({ election: req.params.electionId })
        const votedCount = await Voter.countDocuments({ election: req.params.electionId, hasVoted: true })
        const percentage = totalVoters > 0 ? ((votedCount / totalVoters) * 100).toFixed(1) : 0
        const timeRemaining = electionEnded ? 0 : election.endTime - now

        if (!electionEnded) {
            return res.json({
                message: "Election still ongoing",
                timeRemaining,
                totalVoters,
                votedCount,
                percentage: `${percentage}%`
            })
        }

        // Decrypt all votes to calculate results
        const votes = await Vote.find({ election: req.params.electionId })
        const results = {}

        election.posts.forEach(post => {
            results[post.postName] = {}
            post.candidates.forEach(candidate => {
                results[post.postName][candidate.name] = 0
            })
        })

        votes.forEach(vote => {
            try {
                // Decrypt each vote
                const decryptedVotes = decryptVote(vote.encryptedData)
                decryptedVotes.forEach(v => {
                    if (results[v.postName] && results[v.postName][v.candidateName] !== undefined) {
                        results[v.postName][v.candidateName]++
                    }
                })
            } catch (e) {
                console.log("Could not decrypt vote:", e.message)
            }
        })

        // Find winner per post
        const winners = {}
        Object.keys(results).forEach(postName => {
            const candidates = results[postName]
            const winner = Object.keys(candidates).reduce((a, b) =>
                candidates[a] > candidates[b] ? a : b
            )
            winners[postName] = {
                winner,
                votes: candidates[winner],
                allCandidates: candidates
            }
        })

        res.json({
            message: "Election ended",
            totalVoters,
            votedCount,
            percentage: `${percentage}%`,
            results: winners
        })

    } catch (error) {
        console.log("Results error:", error.message)
        res.status(500).json({ message: "Server error", error })
    }
})

module.exports = router