// ============================================
// Route: POST /api/send
// Sends a single email with uploaded resume
// ============================================

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { sendEmail } = require("../utils/mailer");
const { buildEmailBody, buildSubject } = require("../utils/template");

// Configure multer — use /tmp on Vercel (read-only filesystem)
const uploadDir = process.env.VERCEL ? "/tmp" : path.join(__dirname, "..", "uploads");
const upload = multer({
    dest: uploadDir,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
});

/**
 * POST /api/send
 * FormData: recruiterEmail, recruiterName?, companyName?, position?, resume (file)
 */
router.post("/send", upload.single("resume"), async (req, res) => {
    try {
        const { recruiterEmail, recruiterName, companyName, position } = req.body;

        // Validate email
        if (!recruiterEmail || !recruiterEmail.trim()) {
            return res.status(400).json({ success: false, message: "Recruiter email is required." });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(recruiterEmail.trim())) {
            return res.status(400).json({ success: false, message: "Please enter a valid email address." });
        }

        // Validate resume file
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Please attach your resume." });
        }

        // Build email
        const subject = buildSubject(position);
        const body = buildEmailBody({ recruiterName, companyName, position });

        // Send email with uploaded resume
        await sendEmail({
            to: recruiterEmail.trim(),
            subject,
            text: body,
            resumePath: req.file.path,
            resumeName: req.file.originalname,
        });

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        return res.status(200).json({
            success: true,
            message: `Application sent successfully to ${recruiterEmail}!`,
        });
    } catch (error) {
        console.error("Email send error:", error.message);

        // Clean up file on error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        return res.status(500).json({
            success: false,
            message: "Failed to send email. Please check your credentials and try again.",
            error: error.message,
        });
    }
});

module.exports = router;
