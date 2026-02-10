/* ========================================
   Apex Studio — Express Server
   ======================================== */

const express = require('express');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3000;

/* --- Security Headers --- */
app.use(
    helmet({
        contentSecurityPolicy: false,       // Allow inline styles/scripts during dev
        crossOriginEmbedderPolicy: false,   // Allow Google Fonts
    })
);

/* --- Gzip Compression --- */
app.use(compression());

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

/* --- 404 Handler --- */
app.use((_req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

/* --- Start Server --- */
app.listen(PORT, () => {
    console.log(`\n  ✦  Apex Studio is live at http://localhost:${PORT}\n`);
});
