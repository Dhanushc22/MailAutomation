# 📧 Recruiter Mail Automation

A full-stack web application to automatically send professional job application emails to recruiters with your resume attached — in one click.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## ✨ Features

- **Single Email**: Enter a recruiter's email and send a personalized application instantly
- **Bulk CSV Upload**: Upload a CSV file to send emails to multiple recruiters at once
- **Resume Attached**: Automatically attaches your `resume.pdf` with every email
- **Professional Template**: Clean, customizable email template with dynamic fields
- **Rate Limiting**: Prevents accidental spam (max 10 emails per 15 minutes)
- **Modern UI**: Dark glassmorphism design with animated backgrounds and confetti celebrations
- **Drag & Drop**: Drag your CSV file directly onto the upload zone
- **Validation**: Client-side and server-side email validation

---

## 📁 Project Structure

```
MailAutomation/
├── server.js              # Express server entry point
├── routes/
│   ├── email.js           # Single email route (POST /api/send)
│   └── bulk.js            # Bulk CSV route (POST /api/bulk-send)
├── utils/
│   ├── mailer.js          # Nodemailer transporter & sendEmail()
│   └── template.js        # Email subject & body builders
├── public/
│   ├── index.html         # Frontend HTML
│   ├── style.css          # Stylesheet (glassmorphism design)
│   └── script.js          # Frontend JavaScript
├── resume.pdf             # Your resume (place here)
├── sample.csv             # Example CSV for bulk upload
├── .env                   # Environment variables (DO NOT commit)
├── .env.example           # Example env file
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v16 or later
- A Gmail account

### Step 1: Enable Gmail 2-Factor Authentication (2FA)

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Under "Signing in to Google", click **2-Step Verification**
3. Follow the prompts to enable 2FA (you'll need your phone)
4. Once enabled, you'll see a green checkmark ✅

### Step 2: Generate a Gmail App Password

> ⚠️ You **cannot** use your regular Gmail password. You must create an App Password.

1. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
   - If you don't see this option, search "App passwords" in your Google Account settings
2. Under "Select app", choose **Mail**
3. Under "Select device", choose **Windows Computer** (or any)
4. Click **Generate**
5. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)
6. **Save it** — you won't be able to see it again

### Step 3: Clone & Configure

```bash
# Clone the repository (or download the ZIP)
cd MailAutomation

# Install dependencies
npm install

# Edit the .env file with your credentials
```

### Step 4: Add Your Resume

Place your resume file as `resume.pdf` in the project root:

```
MailAutomation/
├── resume.pdf   ← Place your resume here
```

### Step 5: Run the Application

```bash
npm start
```

Open your browser and go to: **http://localhost:3000**

---

## 📨 How to Use

### Single Email

1. Enter the recruiter's email address (required)
2. Optionally fill in their name, company, and the position
3. Click **Send Application**
4. 🎉 Confetti appears on success!

### Bulk CSV Upload

1. Switch to the **Bulk CSV Upload** tab
2. Prepare a CSV file with these columns:

```csv
email,name,company,position
hr@google.com,Priya,Google,Software Developer
jobs@meta.com,Rahul,Meta,Frontend Engineer
careers@amazon.in,Neha,Amazon,SDE-1
```

3. Drag & drop the file or click to browse
4. Click **Send to All Recruiters**
5. The app sends personalized emails with a 1.5s delay between each

---

## 🔒 Security Notes

- **Never commit your `.env` file** — it's in `.gitignore` by default
- Uses Gmail **App Passwords** (not your main password)
- Rate limiter prevents abuse: 10 requests per 15 minutes per IP
- All inputs are validated on both client and server side

---

## 🛠️ Tech Stack

| Layer    | Technology         |
|----------|--------------------|
| Frontend | HTML5, CSS3, Vanilla JS |
| Backend  | Node.js, Express.js |
| Email    | Nodemailer (Gmail SMTP) |
| Upload   | Multer + csv-parser |
| Security | dotenv, express-rate-limit |

---

## 📄 License

MIT License — feel free to use this for your job applications!

---

**Built with ❤️ by Dhanush**
