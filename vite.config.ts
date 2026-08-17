// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { extname } from "node:path";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

function rewriteGameSpa(req: { url?: string }) {
  const [pathname, search = ""] = (req.url ?? "").split("?");
  const query = search ? `?${search}` : "";
  if (
    pathname === "/game" ||
    pathname === "/game/" ||
    (pathname.startsWith("/game/") && !extname(pathname))
  ) {
    req.url = `/game/index.html${query}`;
  }
}

export default defineConfig({
  plugins: [
    {
      name: "game-spa-fallback",
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          rewriteGameSpa(req);
          next();
        });
      },
      configurePreviewServer(server) {
        server.middlewares.use((req, _res, next) => {
          rewriteGameSpa(req);
          next();
        });
      },
    },
  ],
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    server: {
      proxy: {
        "/api/vasily": {
          target: "http://127.0.0.1:8000",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/vasily/, "/api"),
        },
      },
    },
  },
  // VPS / Docker: Node server (override Lovable Cloudflare default)
  nitro: {
    preset: process.env.NITRO_PRESET || "node-server",
  },
});
