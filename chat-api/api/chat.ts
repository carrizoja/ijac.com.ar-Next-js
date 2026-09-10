import { createChatApp } from "../app.js";

/**
 * Serverless entry point. Deployed as its own Vercel project rooted at chat-api/, with
 * vercel.json rewriting the public /v1/chat path onto this function.
 *
 * The app is built once at module scope so configuration is validated on cold start rather
 * than per request. A configuration failure yields 503 on every path — deliberately without
 * detail, since a public endpoint must not describe its own misconfiguration. If every request
 * returns an empty 503, the environment is incomplete; check it against chat-api/README.md.
 */
const app = createChatApp(process.env);

export const config = { runtime: "nodejs" };

export default async function handler(request: Request): Promise<Response> {
  if (!app.ok) return new Response(null, { status: 503 });
  return app.handler(request);
}
