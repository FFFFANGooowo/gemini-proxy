// Google AI API proxy for Deno
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

// Get API key from URL param, request headers or environment variable
function getApiKey(req: Request): string | null {
  const url = new URL(req.url);
  return url.searchParams.get("key") || 
         req.headers.get("x-api-key") ||
         req.headers.get("x-goog-api-key") || 
         Deno.env.get("GOOGLE_API_KEY") || 
         null;
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
        "Access-Control-Allow-Headers": "x-api-key, content-type"
      }
    });
  }

  try {
    // Forward all requests to Google AI API with API key
    // Debug request headers
    console.log('Received headers:', [...req.headers.entries()]);
    
    const apiKey = getApiKey(req);
    if (!apiKey) {
      return new Response(JSON.stringify({
        error: "API key required via x-api-key header or GOOGLE_API_KEY environment variable",
        received_headers: [...req.headers.entries()],
        env_key_available: !!Deno.env.get("GOOGLE_API_KEY")
      }), { 
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    
    const targetUrl = `${GOOGLE_API_BASE}${url.pathname}?key=${apiKey}`;
    const apiResponse = await fetch(targetUrl, {
      method: req.method,
      headers: req.headers,
      body: req.body,
    });

    // Check if the response is OK
    if (!apiResponse.ok) {
      const error = await apiResponse.text();
      return new Response(error, { 
        status: apiResponse.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    // Handle streaming responses
    if (url.pathname.includes('streamGenerateContent') || 
        req.headers.get('accept')?.includes('text/event-stream')) {
      const responseHeaders = new Headers(apiResponse.headers);
      responseHeaders.set('Access-Control-Allow-Origin', '*');
      responseHeaders.set('Access-Control-Expose-Headers', '*');
      
      return new Response(apiResponse.body, {
        status: apiResponse.status,
        headers: responseHeaders
      });
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
