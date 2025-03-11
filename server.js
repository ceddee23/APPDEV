const http = require('http');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const formidable = require('formidable'); // Add formidable for file uploads

const publicDirectory = path.join(__dirname, 'public');
const uploadsDirectory = path.join(__dirname, 'uploads'); // Add uploads directory

// Ensure the uploads directory exists
if (!fs.existsSync(uploadsDirectory)) {
    fs.mkdirSync(uploadsDirectory);
}

const server = http.createServer((req, res) => {
    if (req.url === '/' && req.method.toLowerCase() === 'get') {
        // Serve index.html
        fs.readFile(path.join(publicDirectory, 'index.html'), (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end('Server Error');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(content, 'utf8');
            }
        });
    } else if (req.url === '/upload' && req.method.toLowerCase() === 'post') {
        // Handle file uploads
        const form = formidable({ multiples: true, uploadDir: uploadsDirectory });

        form.parse(req, (err, fields, files) => {
            if (err) {
                console.error(err);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Error uploading file');
                return;
            }

            if (files.file) {
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('File uploaded successfully!');
            } else {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('No file uploaded.');
            }
        });
    } else {
        // Serve static files
        let filePath = path.join(publicDirectory, req.url === '/' ? 'index.html' : req.url);

        fs.readFile(filePath, (err, content) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end('<h1>404 - File Not Found</h1>', 'utf8');
                } else {
                    res.writeHead(500);
                    res.end(`Server Error: ${err.code}`);
                }
            } else {
                res.writeHead(200, { 'Content-Type': mime.lookup(filePath) });
                res.end(content, 'utf8');
            }
        });
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));