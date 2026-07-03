require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

async function run() {
    try {
        console.log("User:", process.env.EMAIL_USER);
        console.log("Pass length:", process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0);
        await transporter.verify();
        console.log("Server is ready to take our messages");
    } catch (error) {
        console.error("Error verifying:", error.message);
    }
}
run();
