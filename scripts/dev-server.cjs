const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const port = Number(process.env.PORT || 3000);
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.ico': 'image/x-icon' };

const server = http.createServer(async (request, response) => {
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    const relative = path.relative(root, file);
    // Serve only the app entry and public asset directories.
    if (relative.startsWith('..') || path.isAbsolute(relative) ||
        !(relative === 'index.html' || ['src', 'assets'].includes(relative.split(path.sep)[0]))) {
      response.writeHead(404).end('Not found');
      return;
    }
    const resolved = await fs.realpath(file);
    const realRelative = path.relative(root, resolved);
    if (realRelative.startsWith('..') || path.isAbsolute(realRelative)) {
      response.writeHead(404).end('Not found');
      return;
    }
    const content = await fs.readFile(resolved);
    response.writeHead(200, {
      'Content-Type': `${mime[path.extname(file)] || 'application/octet-stream'}${['.html', '.js', '.css', '.json'].includes(path.extname(file)) ? '; charset=utf-8' : ''}`,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff'
    });
    response.end(request.method === 'HEAD' ? undefined : content);
  } catch (error) {
    response.writeHead(error instanceof URIError ? 400 : 404).end('Not found');
  }
});
server.on('error', (error) => {
  console.error(error.code === 'EADDRINUSE' ? `Port ${port} is already in use. Stop the existing server and run npm run dev again.` : error.message);
  process.exitCode = 1;
});
server.listen(port, '127.0.0.1', () => console.log(`Piano Type: http://localhost:${port}\nStop: Ctrl+C`));
