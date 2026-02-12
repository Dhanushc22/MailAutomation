// ============================================
// Utility: Email Template Builders
// ============================================
// Constructs the subject line and body text.
// All fields except email are optional — the
// template gracefully handles missing values.

/**
 * Build the email subject line.
 * @param {string} position - Job position (optional)
 * @returns {string}
 */
function buildSubject(position) {
    const role = position && position.trim() ? position.trim() : "Software Developer";
    return `Application for ${role} - MCA Graduate`;
}

/**
 * Build the email body with Dhanush's template.
 * All parameters are optional — sensible defaults are used.
 *
 * @param {Object} data
 * @param {string} data.recruiterName - Recruiter's name (optional)
 * @param {string} data.companyName   - Company name (optional)
 * @param {string} data.position      - Position title (optional)
 * @returns {string}
 */
function buildEmailBody({ recruiterName, companyName, position }) {
    // ── Greeting ──────────────────────────────────
    // If recruiter name is given → "Dear Priya,"
    // If not → "Dear Hiring Manager,"
    const name =
        recruiterName && recruiterName.trim()
            ? recruiterName.trim()
            : "Hiring Manager";

    // ── Position ──────────────────────────────────
    const role =
        position && position.trim()
            ? position.trim()
            : "Software Developer";

    // ── Company reference ─────────────────────────
    // If company name is given → "at Google"
    // If not → "at your esteemed organization"
    const company =
        companyName && companyName.trim()
            ? companyName.trim()
            : "your esteemed organization";

    return `Dear ${name},

I hope this message finds you well.

I am writing to express my interest in the ${role} position at ${company}. As a recent MCA graduate with a strong foundation in programming, problem-solving, and software development, I am eager to contribute my skills and enthusiasm to your team.

During my academic journey, I have developed hands-on experience in building web applications and working with modern technologies. I am passionate about writing clean, efficient code and continuously improving my technical abilities.

Please find my resume attached for your review. I would welcome the opportunity to further discuss how my skills and dedication can contribute to ${company}'s success.

Thank you for your time and consideration.

Sincerely,
Dhanush C
MCA Graduate
Phone: 6362638287
Email: dhanush.c.s.dev@gmail.com
Website: https://dhanush-dev-space.vercel.app/`;
}

module.exports = { buildSubject, buildEmailBody };
