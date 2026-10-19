import { routePartykitRequest } from "partyserver";
import { Lobby } from "./lobby";

export { Lobby };

type Env = {
  Lobby: DurableObjectNamespace<Lobby>;
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/" || url.pathname === "/health") {
      return Response.json(
        {
          ok: true,
          service: "starkizard-play",
          parties: ["lobby"],
        },
        { headers: corsHeaders(request) },
      );
    }

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    // Must return the upgrade Response untouched — rewrapping breaks WebSockets.
    const routed = await routePartykitRequest(request, env);
    if (routed) return routed;

    return new Response("Not Found", {
      status: 404,
      headers: corsHeaders(request),
    });
  },
} satisfies ExportedHandler<Env>;

function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("Origin") || "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    Vary: "Origin",
  };
}
