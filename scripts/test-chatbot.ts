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
  GROQ_API_KEY: process.env.GROQ_API_KEY || fileEnv.GROQ_API_KEY,
  GROQ_MODEL: process.env.GROQ_MODEL || fileEnv.GROQ_MODEL || "openai/gpt-oss-120b",
  CHAT_API_ENABLED: "true",
  CHAT_API_ALLOWED_ORIGINS: "https://ijac.com.ar,http://localhost:3000",
  CHAT_API_CLIENT_KEY_SECRET: fileEnv.CHAT_API_CLIENT_KEY_SECRET || "dev-secret-hmac-key-for-local-testing-12345",
  CHAT_API_CLIENT_QUOTA: fileEnv.CHAT_API_CLIENT_QUOTA || "100",
  CHAT_API_GLOBAL_QUOTA: fileEnv.CHAT_API_GLOBAL_QUOTA || "1000",
  CHAT_API_QUOTA_WINDOW_SECONDS: fileEnv.CHAT_API_QUOTA_WINDOW_SECONDS || "3600",
  CHAT_API_TIMEOUT_MS: fileEnv.CHAT_API_TIMEOUT_MS || "15000",
  CHAT_API_MAX_BYTES: fileEnv.CHAT_API_MAX_BYTES || "2048",
  CHAT_API_KV_URL: fileEnv.CHAT_API_KV_URL || "https://mock-kv.upstash.io",
  CHAT_API_KV_TOKEN: fileEnv.CHAT_API_KV_TOKEN || "mock-token",
};

async function main() {
  const question = process.argv.slice(2).join(" ") || "¿Qué servicios de soporte técnico ofrecen?";
  const language = /^[a-zA-Z\s,.'?!]+$/.test(question) && !/[áéíóúñ¿¡]/i.test(question) ? "en" : "es";

  console.log("--------------------------------------------------");
  console.log("🤖 iJac Chatbot Local Tester");
  console.log("--------------------------------------------------");
  console.log(`Question: "${question}"`);
  console.log(`Language: ${language}`);
  console.log(`Model:    ${mergedEnv.GROQ_MODEL}`);
  console.log("--------------------------------------------------\n");

  if (!mergedEnv.GROQ_API_KEY || mergedEnv.GROQ_API_KEY.includes("your_groq_api_key")) {
    console.error("❌ Error: GROQ_API_KEY is not configured.");
    console.error("Please add your GROQ_API_KEY to chat-api/.env or set GROQ_API_KEY in your terminal.");
    console.error("Example: GROQ_API_KEY=gsk_... npx tsx scripts/test-chatbot.ts \"¿Hacen soporte Mac?\"");
    process.exit(1);
  }

  // In-memory KV mock fallback if Upstash URL is not configured with a real database
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

  // Ensure origin check passes for test
  const testEnv = {
    ...mergedEnv,
    CHAT_API_ALLOWED_ORIGINS: "https://ijac.com.ar",
  };

  const appResult = createChatApp(testEnv, customFetch ? { fetch: customFetch } : {});
  if (!appResult.ok) {
    console.error("❌ Configuration validation failed:", appResult.errors);
    process.exit(1);
  }

  console.log("⏳ Querying RAG knowledge base & Groq LLM...\n");

  const startTime = Date.now();
  const request = new Request("https://api.ijac.com.ar/v1/chat", {
    method: "POST",
    headers: {
      "origin": "https://ijac.com.ar",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      apiVersion: "v1",
      question,
      language,
    }),
  });

  const response = await appResult.handler(request);
  const duration = Date.now() - startTime;
  const data = await response.json();

  console.log(`Status: ${response.status} (${duration}ms)`);
  console.log("--------------------------------------------------");
  if (data.answer) {
    console.log(`💬 Answer:\n${data.answer}\n`);
  }
  if (data.sources && data.sources.length > 0) {
    console.log(`📚 Sources Cited: ${data.sources.map((s: { id: string }) => s.id).join(", ")}`);
  }
  if (data.code) {
    console.log(`Result Code: ${data.code}`);
  }
  console.log("--------------------------------------------------");
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
