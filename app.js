const http = require('http');
const os = require('os');
const mysql = require("mysql2");

const PORT = process.env.PORT || 3000;
const {
    DB_HOST,
    DB_PORT,
    DB_NAME,
    DB_USER,
    DB_PASSWORD,
    APP_NAME,
    APP_ENV
} = process.env;

// Connexion MySQL
const db = mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME
});

db.connect(err => {
    if (err) {
        console.error("❌ MySQL connection failed:", err);
    } else {
        console.log("✅ Connected to MySQL database:", DB_NAME);
    }
});


const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const path = url.pathname;

    // Common values
    const hostname = os.hostname();
    const timestamp = new Date().toISOString();

    // Set JSON header
    res.setHeader('Content-Type', 'application/json');

    // Route: /
    if (path === '/' && req.method === 'GET') {
        // return res.end(JSON.stringify({
        //     message: 'Hello World!',
        //     hostname,
        //     timestamp,
        //     pod: hostname,
        //     version: 'v1.0.0'
        // }));
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(`
        <h1>App: ${APP_NAME}</h1>
        <p>Environment: ${APP_ENV}</p>
        <p>Hostname: ${os.hostname()}</p>
        <p>Database: ${DB_NAME}</p>
        `);
        return;
    }

    // Route: /crash
    if (path === '/crash' && req.method === 'GET') {
        console.log('Simulating pod crash...');
        res.end(JSON.stringify({ message: 'Pod will crash now', timestamp }));
        process.exit(1);
    }

    // Route: /health
    if (path === '/health' && req.method === 'GET') {
        // return res.end(JSON.stringify({
        //     status: 'healthy',
        //     timestamp
        // }));
        db.query("SELECT 1", (err, results) => {
            if (err) {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ status: "error", message: err.message }));
            } else {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ status: "ok", database: DB_NAME }));
            }
        });
        return;
    }

    // Route: /delay
    if (path === '/delay' && req.method === 'GET') {
        const delay = parseInt(url.searchParams.get('ms')) || 1000;
        setTimeout(() => {
            res.end(JSON.stringify({
                message: `Response delayed by ${delay}ms`,
                hostname,
                timestamp: new Date().toISOString()
            }));
        }, delay);
        return;
    }

    // 404 default
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Not Found', path }));
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    // console.log(`Hostname: ${os.hostname()}`);
    console.log(`APP_NAME: ${APP_NAME}`);
    console.log(`APP_ENV: ${APP_ENV}`);
    console.log(`DB_HOST: ${DB_HOST}`);
    console.log(`DB_NAME: ${DB_NAME}`);
});
