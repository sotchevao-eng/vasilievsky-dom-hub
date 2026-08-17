import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, sep } from "node:path";

const GAME_PREFIX = "/game";

const MIME: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".map": "application/json",
  ".mjs": "text/javascript; charset=utf-8",
  ".mp3": "audio/mpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".wav": "audio/wav",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function gameRoots(): string[] {
  const cwd = process.cwd();
  return [join(cwd, ".output", "public", "game"), join(cwd, "public", "game")];
}

function safeJoin(root: string, relative: string): string | null {
  const resolved = normalize(join(root, relative));
  const rootWithSep = `${normalize(root)}${sep}`;
  if (resolved !== normalize(root) && !resolved.startsWith(rootWithSep)) return null;
  return resolved;
}

export function isGamePath(pathname: string): boolean {
  return pathname === GAME_PREFIX || pathname.startsWith(`${GAME_PREFIX}/`);
}

export async function serveGame(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  if (!isGamePath(url.pathname)) return null;

  if (url.pathname === GAME_PREFIX) {
    return Response.redirect(new URL(`${GAME_PREFIX}/${url.search}`, url), 308);
  }

  const relative = decodeURIComponent(url.pathname.slice(GAME_PREFIX.length + 1));
  if (relative.includes("\0") || relative.split(/[/\\]/).includes("..")) {
    return new Response("Not found", { status: 404 });
  }

  const ext = extname(relative).toLowerCase();
  const looksLikeFile = Boolean(ext);

  if (looksLikeFile) {
    for (const root of gameRoots()) {
      const filePath = safeJoin(root, relative);
      if (!filePath) continue;
      try {
        const info = await stat(filePath);
        if (!info.isFile()) continue;
        const body = await readFile(filePath);
        return new Response(body, {
          headers: {
            "content-type": MIME[ext] || "application/octet-stream",
            "cache-control":
              ext === ".html" ? "no-cache" : "public, max-age=31536000, immutable",
          },
        });
      } catch {
        continue;
      }
    }

    if (ext !== ".html") {
      return new Response("Not found", { status: 404 });
    }
  }

  for (const root of gameRoots()) {
    try {
      const html = await readFile(join(root, "index.html"));
      return new Response(html, {
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "no-cache",
        },
      });
    } catch {
      continue;
    }
  }

  return new Response("Game is not installed", { status: 404 });
}
