const http = require('http');
const os = require('os');

const PORT = process.env.PORT || 3000;

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
        return res.end(JSON.stringify({
            message: 'Hello World!',
            hostname,
            timestamp,
            pod: hostname,
            version: 'v1.0.0'
        }));
    }

    // Route: /crash
    if (path === '/crash' && req.method === 'GET') {
        console.log('Simulating pod crash...');
        res.end(JSON.stringify({ message: 'Pod will crash now', timestamp }));
        process.exit(1);
    }

    // Route: /health
    if (path === '/health' && req.method === 'GET') {
        return res.end(JSON.stringify({
            status: 'healthy',
            timestamp
        }));
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
    console.log(`Hostname: ${os.hostname()}`);
});
