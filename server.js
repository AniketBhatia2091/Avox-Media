/* ========================================
   Apex Studio — Express Server
   ======================================== */

const express = require('express');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');

/* --- Ensure data directory exists --- */
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

/* --- Security Headers --- */
app.use(
    helmet({
        contentSecurityPolicy: false,       // Allow inline styles/scripts during dev
        crossOriginEmbedderPolicy: false,   // Allow Google Fonts
    })
);

/* --- Gzip Compression --- */
app.use(compression());

/* --- Body Parser --- */
app.use(express.json());

/* --- Static Files --- */
app.use(
    express.static(path.join(__dirname, 'public'), {
        maxAge: process.env.NODE_ENV === 'production' ? '1y' : '0',
        etag: true,
    })
);

/* --- Clean URL Routes --- */
app.get('/', (_req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/services', (_req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'services.html'));
});

app.get('/contact', (_req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

/* --- API: Contact Form --- */
app.post('/api/contact', (req, res) => {
    const { name, email, phone, company, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Name, email, and message are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    const entry = {
        id: Date.now(),
        name: name.trim(),
        email: email.trim(),
        phone: (phone || '').trim(),
        company: (company || '').trim(),
        message: message.trim(),
        submittedAt: new Date().toISOString(),
    };

    const filePath = path.join(DATA_DIR, 'contacts.json');
    let contacts = [];
    try {
        if (fs.existsSync(filePath)) {
            contacts = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        }
    } catch (_) { /* start fresh if corrupted */ }

    contacts.push(entry);
    fs.writeFileSync(filePath, JSON.stringify(contacts, null, 2));

    console.log(`  📩  New contact from ${entry.name} <${entry.email}>`);
    res.json({ success: true, message: 'Your message has been received. We\'ll get back to you within 24 hours!' });
});

/* --- API: Newsletter Signup --- */
app.post('/api/newsletter', (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    const filePath = path.join(DATA_DIR, 'subscribers.json');
    let subscribers = [];
    try {
        if (fs.existsSync(filePath)) {
            subscribers = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        }
    } catch (_) { /* start fresh if corrupted */ }

    if (subscribers.some(s => s.email === email.trim())) {
        return res.json({ success: true, message: 'You\'re already subscribed!' });
    }

    subscribers.push({
        email: email.trim(),
        subscribedAt: new Date().toISOString(),
    });
    fs.writeFileSync(filePath, JSON.stringify(subscribers, null, 2));

    console.log(`  📬  New subscriber: ${email.trim()}`);
    res.json({ success: true, message: 'You\'re in! Thanks for subscribing.' });
});

/* --- 404 Handler --- */
app.use((_req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

/* --- Start Server --- */
app.listen(PORT, () => {
    console.log(`\n  ✦  Apex Studio is live at http://localhost:${PORT}\n`);
});
