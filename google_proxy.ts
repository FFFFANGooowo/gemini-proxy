// Google AI API proxy for Deno
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

// Get API key from environment variable or request header
function getApiKey(req: Request): string {
  const envKey = Deno.env.get("GOOGLE_API_KEY");
  const headerKey = req.headers.get("x-api-key");
  
  if (!envKey && !headerKey) {
    throw new Error("API key required via GOOGLE_API_KEY environment variable or x-api-key header");
  }
  return headerKey || envKey || "";
}

const GOOGLE_API_BASE = "https://generativelanguage.googleapis.com";

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  
  // Handle root path
  if (url.pathname === '/') {
    return new Response('Google AI API Proxy is Running', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  // Handle OPTIONS for CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "*"
      }
    });
  }

  try {
    // Forward all requests to Google AI API
    const apiKey = getApiKey(req);
    const targetUrl = `${GOOGLE_API_BASE}${url.pathname}?key=${apiKey}`;
    const apiResponse = await fetch(targetUrl, {
      method: req.method,
      headers: req.headers,
      body: req.body,
    });

    // Check if the response is OK
    if (!apiResponse.ok) {
      const error = await apiResponse.text();
      return new Response(error, { status: apiResponse.status });
    }

    // Preserve all original headers and add CORS
    const responseHeaders = new Headers(apiResponse.headers);
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Referrer-Policy', 'no-referrer');
    responseHeaders.set('Access-Control-Expose-Headers', '*');

    // Return the API response with original content-type
    return new Response(apiResponse.body, {
      status: apiResponse.status,
      headers: responseHeaders
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

// Start the server on port 8000
console.log("Proxy server running on http://localhost:8000");
serve(handler, { port: 8000 });
