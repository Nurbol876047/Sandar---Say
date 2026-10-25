// Қарапайым статикалық сервер: сыртқы фреймворксіз, тек Node.js құралдарымен.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, "public");
const DATA_DIR = path.join(ROOT, "data");
const PORT = Number(process.env.PORT) || 5050;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mp3": "audio/mpeg",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

function contentTypeFor(filePath) {
  return MIME_TYPES[path.extname(filePath)] || "application/octet-stream";
}

// Директориядан тыс шығуды болдырмау үшін (path traversal қорғанысы).
function safeJoin(baseDir, requestPath) {
  const resolved = path.normalize(path.join(baseDir, requestPath));
  if (!resolved.startsWith(baseDir)) return null;
  return resolved;
}

async function serveFile(res, filePath) {
  try {
    const fileStat = await stat(filePath);
    if (fileStat.isDirectory()) return false;
    const data = await readFile(filePath);
    res.writeHead(200, { "Content-Type": contentTypeFor(filePath) });
    res.end(data);
    return true;
  } catch {
    return false;
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let pathname = decodeURIComponent(url.pathname);

  if (pathname === "/data/content.json") {
    const ok = await serveFile(res, path.join(DATA_DIR, "content.json"));
    if (ok) return;
  }

  if (pathname === "/") pathname = "/index.html";

  const filePath = safeJoin(PUBLIC_DIR, pathname);
  if (filePath) {
    const ok = await serveFile(res, filePath);
    if (ok) return;
  }

  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("404 - табылмады");
});

server.listen(PORT, () => {
  console.log(`Әліпби тренажёрі іске қосылды: http://localhost:${PORT}`);
});
