// ============================================
// Recruiter Mail Automation — Frontend Script
// ============================================
// 2 tabs: Single Email, Multiple Emails
// Both upload resume via FormData

"use strict";

// ── DOM ─────────────────────────────────────────
const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".panel");

// Single
const singleForm = document.getElementById("single-form");
const statusSingle = document.getElementById("status-single");
const btnSingle = document.getElementById("btn-send-single");
const resumeSingle = document.getElementById("resume-single");
const fileBtnSingle = document.getElementById("file-btn-single");
const fileLabelSingle = document.getElementById("file-label-single");

// Multi
const multiForm = document.getElementById("multi-form");
const statusMulti = document.getElementById("status-multi");
const btnMulti = document.getElementById("btn-send-multi");
const resumeMulti = document.getElementById("resume-multi");
const fileBtnMulti = document.getElementById("file-btn-multi");
const fileLabelMulti = document.getElementById("file-label-multi");

// ═══════════════════════════════════════════════
// Tab Switching
// ═══════════════════════════════════════════════
tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
        const target = tab.dataset.tab;
        tabs.forEach((t) => {
            t.classList.toggle("active", t.dataset.tab === target);
            t.setAttribute("aria-selected", t.dataset.tab === target);
        });
        panels.forEach((p) => {
            p.classList.toggle("active", p.id === "panel-" + target);
        });
        statusSingle.innerHTML = "";
        statusMulti.innerHTML = "";
    });
});

// ═══════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function setFieldError(fieldId, hasError) {
    const el = document.getElementById(fieldId);
    if (el) el.classList.toggle("error", hasError);
}

function showStatus(container, type, message) {
    const icon = type === "success" ? "✅" : "❌";
    container.innerHTML = `
    <div class="status-msg ${type}">
      <span class="status-icon">${icon}</span>
      <span>${message}</span>
    </div>`;
}

function setLoading(btn, on) {
    btn.classList.toggle("loading", on);
    btn.disabled = on;
}

function parseEmails(raw) {
    return raw.split(/[\n,;]+/).map((e) => e.trim()).filter((e) => e.length > 0);
}

// ═══════════════════════════════════════════════
// File Pickers
// ═══════════════════════════════════════════════
function setupFilePicker(btn, input, label) {
    btn.addEventListener("click", () => input.click());
    input.addEventListener("change", () => {
        if (input.files.length > 0) {
            label.textContent = "📎 " + input.files[0].name;
            label.classList.add("has-file");
        } else {
            label.textContent = "No file selected";
            label.classList.remove("has-file");
        }
    });
}

setupFilePicker(fileBtnSingle, resumeSingle, fileLabelSingle);
setupFilePicker(fileBtnMulti, resumeMulti, fileLabelMulti);

// ═══════════════════════════════════════════════
// PANEL 1 — Single Email
// ═══════════════════════════════════════════════
singleForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    statusSingle.innerHTML = "";

    const recruiterEmail = document.getElementById("recruiter-email").value.trim();
    const recruiterName = document.getElementById("recruiter-name").value.trim();
    const companyName = document.getElementById("company-name").value.trim();
    const position = document.getElementById("position").value.trim();

    // Validate email
    if (!recruiterEmail) {
        setFieldError("field-email", true);
        showStatus(statusSingle, "error", "Please enter the recruiter's email.");
        return;
    }
    if (!validateEmail(recruiterEmail)) {
        setFieldError("field-email", true);
        showStatus(statusSingle, "error", "Please enter a valid email address.");
        return;
    }
    setFieldError("field-email", false);

    // Validate resume
    if (!resumeSingle.files || resumeSingle.files.length === 0) {
        setFieldError("field-resume-single", true);
        showStatus(statusSingle, "error", "Please attach your resume.");
        return;
    }
    setFieldError("field-resume-single", false);

    setLoading(btnSingle, true);

    try {
        // Use FormData so we can send the resume file
        const fd = new FormData();
        fd.append("recruiterEmail", recruiterEmail);
        fd.append("recruiterName", recruiterName);
        fd.append("companyName", companyName);
        fd.append("position", position);
        fd.append("resume", resumeSingle.files[0]);

        const res = await fetch("/api/send", { method: "POST", body: fd });
        const data = await res.json();

        if (data.success) {
            showStatus(statusSingle, "success", data.message);
            singleForm.reset();
            fileLabelSingle.textContent = "No file selected";
            fileLabelSingle.classList.remove("has-file");
        } else {
            showStatus(statusSingle, "error", data.message);
        }
    } catch (err) {
        showStatus(statusSingle, "error", "Network error. Is the server running?");
    } finally {
        setLoading(btnSingle, false);
    }
});

document.getElementById("recruiter-email").addEventListener("input", () => {
    setFieldError("field-email", false);
});

// ═══════════════════════════════════════════════
// PANEL 2 — Multiple Emails
// ═══════════════════════════════════════════════
multiForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    statusMulti.innerHTML = "";

    const raw = document.getElementById("multi-emails").value;
    const position = document.getElementById("multi-position").value.trim();
    const emails = parseEmails(raw);

    if (emails.length === 0) {
        setFieldError("field-multi-emails", true);
        showStatus(statusMulti, "error", "Please enter at least one email address.");
        return;
    }

    const invalid = emails.filter((e) => !validateEmail(e));
    if (invalid.length > 0) {
        setFieldError("field-multi-emails", true);
        showStatus(statusMulti, "error", "Invalid email(s): " + invalid.join(", "));
        return;
    }

    if (emails.length > 10) {
        showStatus(statusMulti, "error", "Maximum 10 emails allowed at once.");
        return;
    }

    setFieldError("field-multi-emails", false);

    // Validate resume
    if (!resumeMulti.files || resumeMulti.files.length === 0) {
        setFieldError("field-resume-multi", true);
        showStatus(statusMulti, "error", "Please attach your resume.");
        return;
    }
    setFieldError("field-resume-multi", false);

    setLoading(btnMulti, true);

    try {
        const fd = new FormData();
        fd.append("emails", JSON.stringify(emails));
        fd.append("position", position);
        fd.append("resume", resumeMulti.files[0]);

        const res = await fetch("/api/multi-send", { method: "POST", body: fd });
        const data = await res.json();

        if (data.success) {
            let msg = data.message;
            if (data.report && data.report.errors && data.report.errors.length > 0) {
                msg += "<br><br><strong>Failed:</strong><br>";
                data.report.errors.forEach((err) => {
                    msg += "• " + err.email + ": " + err.reason + "<br>";
                });
            }
            showStatus(statusMulti, "success", msg);
            multiForm.reset();
            fileLabelMulti.textContent = "No file selected";
            fileLabelMulti.classList.remove("has-file");
        } else {
            showStatus(statusMulti, "error", data.message);
        }
    } catch (err) {
        showStatus(statusMulti, "error", "Network error. Is the server running?");
    } finally {
        setLoading(btnMulti, false);
    }
});

document.getElementById("multi-emails").addEventListener("input", () => {
    setFieldError("field-multi-emails", false);
});
