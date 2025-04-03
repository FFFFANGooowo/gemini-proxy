// Google AI API proxy for Deno
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");
if (!GOOGLE_API_KEY) {
  throw new Error("GOOGLE_API_KEY environment variable is required");
}

const GOOGLE_API_BASE = "https://generativelanguage.googleapis.com";
const API_PATH = "/v1beta/models/gemini-2.0-flash:generateContent";

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
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { 
      status: 405,
      headers: {
        "Access-Control-Allow-Origin": "*"
      }
    });
  }

  try {
    // Forward the request to Google AI API
    const url = `${GOOGLE_API_BASE}${API_PATH}?key=${GOOGLE_API_KEY}`;
    const apiResponse = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
