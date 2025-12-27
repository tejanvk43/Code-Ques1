import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

console.log("Email User:", process.env.EMAIL_USER);
console.log("Email Pass (first 4):", process.env.EMAIL_PASS ? process.env.EMAIL_PASS.substring(0, 4) : "MISSING");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Email Transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for 587
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

app.post('/api/send-approval-email', async (req, res) => {
    const { email, name, rollNumber, password, loginUrl } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const mailOptions = {
        from: `"Code & Quest Feria" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Registration Approved - Login Credentials',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #1e3a8a; text-align: center;">Registration Approved! 🎉</h2>
                <p>Dear <strong>${name}</strong>,</p>
                <p>Congratulations! Your registration for the <strong>Code & Quest Feria 2025</strong> has been verified and approved.</p>
                <p>You can now log in to the candidate portal using the credentials below:</p>
                
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>User Name (Roll No):</strong> <span style="font-family: monospace; font-size: 16px;">${rollNumber}</span></p>
                    <p style="margin: 5px 0;"><strong>Password:</strong> <span style="font-family: monospace; font-size: 16px; color: #d97706;">${password}</span></p>
                </div>

                <div style="text-align: center; margin-top: 30px;">
                    <a href="${loginUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login Now</a>
                </div>

                <p style="margin-top: 30px; font-size: 12px; color: #6b7280; text-align: center;">
                    If you did not register for this event, please ignore this email.
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${email}`);
        res.status(200).json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ success: false, error: 'Failed to send email' });
    }
});


import Bull from 'bull';

// Job Queue (Redis)
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const validationQueue = new Bull('resume-validation', REDIS_URL);

// Worker Function (Bull Consumer)
validationQueue.process(async (job) => {
    const { userId, resumeUrl } = job.data;
    console.log(`Processing job for user: ${userId} (ID: ${job.id})`);

    try {
        await processJob(job.data);
    } catch (error) {
        console.error(`Job failed for ${userId}:`, error);
        throw error; // Let Bull handle retries if configured
    }
});

validationQueue.on('completed', (job) => {
    console.log(`Job ${job.id} completed successfully.`);
});

validationQueue.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed:`, err);
});

// PDF Text Extraction Helper
// PDF Text Extraction Helper
const extractTextFromUrl = async (url) => {
    // Use legacy build for Node.js compatibility (fixes DOMMatrix error)
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();

    const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
        useSystemFonts: true
    });

    const pdf = await loadingTask.promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => item.str).join(' ');
        fullText += pageText + ' ';
    }
    return fullText.trim();
};

const processJob = async (job) => {
    const { userId, resumeUrl } = job;
    const { initializeApp } = await import("firebase/app");
    const { getFirestore, doc, updateDoc, increment } = await import("firebase/firestore");

    // Firebase Config (Duplicates src/firebase.ts for Node)
    const firebaseConfig = {
        apiKey: "AIzaSyDWiE3irAvXzDTGH77StY6_WxaXgCW8z3c",
        authDomain: "interviews-e177f.firebaseapp.com",
        projectId: "interviews-e177f",
        storageBucket: "interviews-e177f.firebasestorage.app",
        messagingSenderId: "528485388968",
        appId: "1:528485388968:web:2f53e04ec3950db225e89d",
        measurementId: "G-ZVR2Y99GLZ"
    };

    // Singleton-like init check
    let db;
    try {
        const app = initializeApp(firebaseConfig, "workerApp");
        db = getFirestore(app);
    } catch (e) {
        // App already exists
        const app = (await import("firebase/app")).getApp("workerApp");
        db = getFirestore(app);
    }

    // 1. Extract Text
    let text = "";
    try {
        text = await extractTextFromUrl(resumeUrl);
    } catch (err) {
        console.error("Extraction error:", err);
        await updateDoc(doc(db, 'registrations', userId), {
            resumeStatus: 'Rejected',
            resumeAIReason: `System Error: ${err.message}`
        });
        return;
    }

    if (!text || text.length < 50) {
        await updateDoc(doc(db, 'registrations', userId), {
            resumeStatus: 'Rejected',
            resumeAttempts: increment(1),
            lastRejectionReason: 'Resume appears empty or scanned.',
            resumeAIReason: 'Insufficient text content.'
        });
        return;
    }

    // 2. AI Validation (Ollama)
    const prompt = `
    You are an expert HR AI Resume Validator. Your task is to evaluate the provided resume text.
    
    Rules:
    1. A Resume/CV MUST contain: Contact Information, Education, and Skills/Experience.
    2. Reject random text, code snippets, or unrelated documents.
    3. If it is a Resume, output rigid JSON: 
       { "valid": true, "score": 8, "confidence": 0.95, "reason": "Good structure, but lacks specific impact metrics." }
    4. "score" should be an integer from 0 to 10 based on quality, completeness, and professionalism.
    5. If NOT a Resume, output rigid JSON: 
       { "valid": false, "score": 0, "confidence": 0.9, "reason": "Text appears to be random." }
    6. Do NOT output markdown. Output ONLY JSON.

    Input Text:
    """${text.substring(0, 3000)}"""
    `;

    try {
        const response = await fetch('http://localhost:8080/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'qwen2:7b',
                prompt: prompt,
                stream: false,
                format: 'json'
            }),
        });

        if (!response.ok) throw new Error("Ollama API Error");

        const data = await response.json();
        const result = JSON.parse(data.response);

        // 3. Update Firestore
        if (result.valid) {
            await updateDoc(doc(db, 'registrations', userId), {
                resumeStatus: 'Accepted',
                resumeAIConfidence: result.confidence,
                resumeAIReason: result.reason,
                resumeScore: result.score || 0, // Save the score
                processingCompletedAt: new Date().toISOString()
            });
        } else {
            await updateDoc(doc(db, 'registrations', userId), {
                resumeStatus: 'Rejected',
                resumeAttempts: increment(1),
                lastRejectionReason: result.reason,
                resumeAIConfidence: result.confidence,
                resumeAIReason: result.reason,
                resumeScore: result.score || 0,
                processingCompletedAt: new Date().toISOString()
            });
        }

    } catch (err) {
        console.error("AI Error:", err);
    }
};

app.post('/api/queue-validation', async (req, res) => {
    const { userId, resumeUrl } = req.body;

    if (!userId || !resumeUrl) {
        return res.status(400).json({ error: 'Missing userId or resumeUrl' });
    }

    // Add to Redis Queue
    const job = await validationQueue.add({ userId, resumeUrl });
    console.log(`Job queued via Redis: ${job.id} for user ${userId}`);

    // Immediate Response
    res.status(200).json({
        success: true,
        message: 'Resume queued for validation',
        jobId: job.id
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
