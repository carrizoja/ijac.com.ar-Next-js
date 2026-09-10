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

/**
 * The `fetch` Web Standard export, not a bare default function. Vercel picks a function's
 * calling convention from the shape of its export: a bare default is handed Node's
 * `IncomingMessage`/`ServerResponse`, and only this shape is handed a Web `Request`. The code
 * below is written against the Web API, so the wrong shape deploys cleanly and then throws on
 * every request. Node is the default runtime, so no `config` export is needed to select it.
 */
export default {
  async fetch(request: Request): Promise<Response> {
    if (!app.ok) return new Response(null, { status: 503 });
    return app.handler(request);
  },
};
