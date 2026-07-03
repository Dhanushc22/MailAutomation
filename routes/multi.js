// ============================================
// Route: POST /api/multi-send
// Sends emails to multiple recruiters with
// uploaded resume attached
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
    limits: { fileSize: 5 * 1024 * 1024 },
});

/**
 * POST /api/multi-send
 * FormData: emails (JSON string array), position?, resume (file)
 */
router.post("/multi-send", upload.single("resume"), async (req, res) => {
    try {
        let emails;
        try {
            emails = JSON.parse(req.body.emails);
        } catch {
            return res.status(400).json({ success: false, message: "Invalid emails format." });
        }

        const { position, emailMode, customSubject, customBody } = req.body;

        if (!Array.isArray(emails) || emails.length === 0) {
            return res.status(400).json({ success: false, message: "Please provide at least one email." });
        }

        if (emails.length > 10) {
            return res.status(400).json({ success: false, message: "Maximum 10 emails allowed per request." });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: "Please attach your resume." });
        }

        // Validate all emails
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const invalid = emails.filter((e) => !emailRegex.test(e.trim()));
        if (invalid.length > 0) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ success: false, message: "Invalid email(s): " + invalid.join(", ") });
        }

        // Send to each
        const report = { success: 0, failed: 0, errors: [] };

        for (const email of emails) {
            try {
                let subject = "";
                let body = "";
                if (emailMode === "manual") {
                    subject = customSubject || "Job Application";
                    body = customBody || "Please find my resume attached.";
                } else {
                    subject = buildSubject(position);
                    body = buildEmailBody({
                        recruiterName: "",
                        companyName: "",
                        position,
                    });
                }

                await sendEmail({
                    to: email.trim(),
                    subject,
                    text: body,
                    resumePath: req.file.path,
                    resumeName: req.file.originalname,
                });

                report.success++;

                // Small delay to avoid Gmail throttling
                if (emails.length > 1) {
                    await new Promise((r) => setTimeout(r, 1500));
                }
            } catch (err) {
                report.failed++;
                report.errors.push({ email: email.trim(), reason: err.message });
            }
        }

        // Clean up uploaded file
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        return res.status(200).json({
            success: true,
            message: `Done: ${report.success} sent, ${report.failed} failed out of ${emails.length} total.`,
            report,
        });
    } catch (error) {
        console.error("Multi-send error:", error.message);

        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        return res.status(500).json({
            success: false,
            message: "Multi-send failed. " + error.message,
        });
    }
});

module.exports = router;
