const express = require("express")
const router = express.Router()
const upload = require("../middleware/upload")
const auth = require("../middleware/auth")

// Upload single image
router.post("/image", auth, upload.single("image"), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" })
        }
        const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`
        res.json({ message: "Image uploaded successfully", url: imageUrl })
    } catch (error) {
        res.status(500).json({ message: "Upload failed", error })
    }
})

module.exports = router