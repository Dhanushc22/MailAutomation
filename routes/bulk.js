// ============================================
// Route: POST /api/bulk-send
// Sends personalized emails to multiple recruiters
// via CSV upload
// ============================================

const express = require("express");
const router = express.Router();
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");
const { sendEmail } = require("../utils/mailer");
const { buildEmailBody, buildSubject } = require("../utils/template");

// ── Configure Multer for CSV file uploads ───────
const upload = multer({
    dest: path.join(__dirname, "..", "uploads"), // temp folder
    limits: { fileSize: 2 * 1024 * 1024 },       // 2 MB max
    fileFilter: (req, file, cb) => {
        // Only accept CSV files
        if (
            file.mimetype === "text/csv" ||
            file.originalname.endsWith(".csv")
        ) {
            cb(null, true);
        } else {
            cb(new Error("Only CSV files are allowed."));
        }
    },
});

/**
 * POST /api/bulk-send
 * Expects a CSV file with columns: email, name, company, position
 * Each row triggers a personalized email.
 */
router.post("/bulk-send", upload.single("csvFile"), async (req, res) => {
    try {
        // ── Validate file was uploaded ────────────────
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a CSV file.",
            });
        }

        const filePath = req.file.path;
        const results = [];

        // ── Parse CSV rows ────────────────────────────
        await new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csv())
                .on("data", (row) => results.push(row))
                .on("end", resolve)
                .on("error", reject);
        });

        // ── Validate CSV has data ─────────────────────
        if (results.length === 0) {
            // Clean up the uploaded file
            fs.unlinkSync(filePath);
            return res.status(400).json({
                success: false,
                message: "CSV file is empty or has no valid rows.",
            });
        }

        // ── Send emails to each row ───────────────────
        const report = { success: 0, failed: 0, errors: [] };

        for (const row of results) {
            const email = (row.email || "").trim();
            const name = (row.name || "").trim();
            const company = (row.company || "").trim();
            const position = (row.position || "").trim();

            // Skip rows with no email
            if (!email) {
                report.failed++;
                report.errors.push({ email: "(empty)", reason: "Missing email" });
                continue;
            }

            try {
                const subject = buildSubject(position);
                const body = buildEmailBody({
                    recruiterName: name,
                    companyName: company,
                    position,
                });

                await sendEmail({ to: email, subject, text: body });
                report.success++;

                // Small delay between emails to avoid throttling
                await new Promise((r) => setTimeout(r, 1500));
            } catch (err) {
                report.failed++;
                report.errors.push({ email, reason: err.message });
            }
        }

        // ── Clean up uploaded file ────────────────────
        fs.unlinkSync(filePath);

        // ── Return summary ────────────────────────────
        return res.status(200).json({
            success: true,
            message: `Bulk send complete: ${report.success} sent, ${report.failed} failed out of ${results.length} total.`,
            report,
        });
    } catch (error) {
        console.error("❌ Bulk send error:", error.message);

        // Clean up file if it exists
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        return res.status(500).json({
            success: false,
            message: "Bulk send failed. " + error.message,
        });
    }
});

module.exports = router;
