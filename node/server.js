const fs = require('fs');
const path = require('path');
const http = require('http');

const host = '127.0.0.1';
const port = 4273;
const distDir = 'dist/';

http.createServer(function (request, response) {
    let filePath = distDir + (request.url === '/' ? 'index.html' : request.url);
    const extname = path.extname(filePath).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
    };
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, function (error, content) {
        if (error) {
            if (error.code === 'ENOENT') {
                response.writeHead(404, { 'Content-Type': 'text/html' });
                response.end('<p>No such file or directory </p>', 'utf-8');
            } else {
                response.writeHead(500);
                response.end(`Internal Server Error (${error.code})\n`);
            }
        } else {
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content, 'utf-8');
        }
    });
}).listen(port, host, function () {
    const url = `http://${host}:${port}`;
    const start = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
    require('child_process').exec(start + ' ' + url);

    console.log('Server running at ' + url);
});