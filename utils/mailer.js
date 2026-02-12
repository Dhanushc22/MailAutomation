// ============================================
// Utility: Nodemailer Transporter & sendEmail()
// ============================================
// Sends emails via Gmail SMTP with a resume attached.

const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");

// Create reusable SMTP transporter (Gmail, SSL, port 465)
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Sends an email with a resume attached.
 * @param {Object} options
 * @param {string} options.to          - Recipient email
 * @param {string} options.subject     - Email subject
 * @param {string} options.text        - Email body (plain text)
 * @param {string} options.resumePath  - Absolute path to uploaded resume file
 * @param {string} options.resumeName  - Original filename of the resume
 */
async function sendEmail({ to, subject, text, resumePath, resumeName }) {
    const mailOptions = {
        from: `"Dhanush" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
        attachments: [],
    };

    // Attach the uploaded resume
    if (resumePath && fs.existsSync(resumePath)) {
        mailOptions.attachments.push({
            filename: resumeName || "Resume.pdf",
            path: resumePath,
        });
    }

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent to " + to + " — Message ID: " + info.messageId);
    return info;
}

module.exports = { sendEmail };
