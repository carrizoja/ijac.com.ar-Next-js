import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createChatApp } from "../chat-api/app.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../chat-api/.env");

function loadEnvFile(): Record<string, string> {
  const env: Record<string, string> = {};
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        const value = trimmed.slice(eqIdx + 1).trim();
        env[key] = value;
      }
    }
  }
  return env;
}

const fileEnv = loadEnvFile();
const mergedEnv: Record<string, string | undefined> = {
  GROQ_API_KEY: process.env.GROQ_API_KEY || fileEnv.GROQ_API_KEY || "gsk_placeholder_pending_configuration",
  GROQ_MODEL: process.env.GROQ_MODEL || fileEnv.GROQ_MODEL || "openai/gpt-oss-120b",
  CHAT_API_ENABLED: "true",
  CHAT_API_ALLOWED_ORIGINS: "https://ijac.com.ar",
  CHAT_API_CLIENT_KEY_SECRET: fileEnv.CHAT_API_CLIENT_KEY_SECRET || "dev-secret-hmac-key-for-local-testing-12345",
  CHAT_API_CLIENT_QUOTA: fileEnv.CHAT_API_CLIENT_QUOTA || "100",
  CHAT_API_GLOBAL_QUOTA: fileEnv.CHAT_API_GLOBAL_QUOTA || "1000",
  CHAT_API_QUOTA_WINDOW_SECONDS: fileEnv.CHAT_API_QUOTA_WINDOW_SECONDS || "3600",
  CHAT_API_TIMEOUT_MS: fileEnv.CHAT_API_TIMEOUT_MS || "15000",
  CHAT_API_MAX_BYTES: fileEnv.CHAT_API_MAX_BYTES || "4096",
  CHAT_API_KV_URL: fileEnv.CHAT_API_KV_URL || "https://mock-kv.upstash.io",
  CHAT_API_KV_TOKEN: fileEnv.CHAT_API_KV_TOKEN || "mock-token",
};

const isMockKv = mergedEnv.CHAT_API_KV_URL?.includes("mock-kv") || mergedEnv.CHAT_API_KV_URL?.includes("your-database");

let customFetch: typeof fetch | undefined;
if (isMockKv) {
  const memoryStore = new Map<string, number>();
  const originalFetch = globalThis.fetch;
  customFetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const urlStr = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    if (urlStr.includes("upstash.io")) {
      if (urlStr.includes("/incr/")) {
        const key = urlStr.split("/incr/")[1]?.split("?")[0] || "key";
        const current = (memoryStore.get(key) || 0) + 1;
        memoryStore.set(key, current);
        return new Response(JSON.stringify({ result: current }), { status: 200, headers: { "content-type": "application/json" } });
      }
      if (urlStr.includes("/get/")) {
        const key = urlStr.split("/get/")[1]?.split("?")[0] || "key";
        const val = memoryStore.get(key) || null;
        return new Response(JSON.stringify({ result: val }), { status: 200, headers: { "content-type": "application/json" } });
      }
      if (urlStr.includes("/expire/")) {
        return new Response(JSON.stringify({ result: 1 }), { status: 200, headers: { "content-type": "application/json" } });
      }
    }
    return originalFetch(input, init);
  }) as typeof fetch;
}

if (!mergedEnv.GROQ_API_KEY || mergedEnv.GROQ_API_KEY.includes("your_groq_api_key")) {
  console.warn("⚠️  WARNING: GROQ_API_KEY is not configured in chat-api/.env");
  console.warn("Requests will fail until a valid GROQ_API_KEY is provided.\n");
}

const appResult = createChatApp(mergedEnv, customFetch ? { fetch: customFetch } : {});

if (!appResult.ok) {
  console.error("❌ Configuration validation error:", appResult.errors);
  process.exit(1);
}

const PORT = 3001;

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin || "http://localhost:3000";

  // Development CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    });
    res.end();
    return;
  }

  // Forward to web standard Request handler with internal origin mapping
  const chunks: Buffer[] = [];
  req.on("data", (chunk) => chunks.push(chunk));
  req.on("end", async () => {
    const bodyText = Buffer.concat(chunks).toString("utf-8");
    const webRequest = new Request(`http://localhost:${PORT}${req.url}`, {
      method: req.method,
      headers: new Headers({
        ...Object.fromEntries(
          Object.entries(req.headers).map(([key, value]) => [
            key,
            Array.isArray(value) ? value.join(", ") : value ?? "",
          ]),
        ),
        "origin": "https://ijac.com.ar", // map local dev origin to allowed origin for internal validator
        "content-type": req.headers["content-type"] || "application/json",
      }),
      body: req.method !== "GET" && req.method !== "HEAD" ? bodyText : undefined,
    });

    try {
      const webResponse = await appResult.handler(webRequest);
      const resBody = await webResponse.text();

      const responseHeaders: Record<string, string> = {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Credentials": "true",
        "Content-Type": "application/json",
      };

      res.writeHead(webResponse.status, responseHeaders);
      res.end(resBody);
    } catch (error) {
      console.error("Error processing chat request:", error);
      res.writeHead(500, {
        "Access-Control-Allow-Origin": origin,
        "Content-Type": "application/json",
      });
      res.end(JSON.stringify({ error: "Internal Server Error" }));
    }
  });
});

server.listen(PORT, () => {
  console.log("==================================================");
  console.log(`🚀 Chat API Local Dev Server running at:`);
  console.log(`   http://localhost:${PORT}/v1/chat`);
  console.log(`   Model: ${mergedEnv.GROQ_MODEL}`);
  console.log(`   KV Store: ${isMockKv ? "In-Memory Mock (No Upstash needed)" : "Upstash Remote"}`);
  console.log("==================================================");
});
