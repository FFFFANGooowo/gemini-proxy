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
    // Debug request headers and body
    const requestBody = await req.text();
    console.log('Received headers:', [...req.headers.entries()]);
    console.log('Request body:', requestBody);
    // Recreate request body as stream
    req = new Request(req.url, {
      method: req.method,
      headers: req.headers,
      body: requestBody,
    });
    
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
    // Strict path normalization
    const normalizedPath = url.pathname
      .replace(/\/+/g, '/')  // Remove duplicate slashes
      .replace(/^\/+/, '/'); // Ensure single leading slash
      
    // Validate API key format
    if (!/^AIza[0-9A-Za-z-_]{35}$/.test(apiKey)) {
      return new Response(JSON.stringify({
        error: "Invalid API key format",
        received_key: apiKey
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    
    const targetUrl = new URL(`${GOOGLE_API_BASE}${normalizedPath}`);
    targetUrl.searchParams.set('key', apiKey);
    // Prevent any transformations by intermediaries
    const cleanHeaders = new Headers(req.headers);
    cleanHeaders.set('Accept-Encoding', 'identity');
    
    const apiResponse = await fetch(targetUrl, {
      method: req.method,
      headers: cleanHeaders,
      body: req.body,
    });

    // Check if the response is OK
    if (!apiResponse.ok) {
      const error = await apiResponse.text();
      console.error('API Error:', {
        status: apiResponse.status,
        headers: [...apiResponse.headers.entries()],
        error: error,
        request: {
          url: targetUrl.toString(),
          method: req.method,
          headers: [...req.headers.entries()],
          body: await req.text().catch(() => 'Unable to read request body')
        }
      });
      return new Response(error, { 
        status: apiResponse.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    // Complete raw pass-through for streaming responses
    if (url.pathname.includes('streamGenerateContent') && 
        url.searchParams.get('alt') === 'sse') {
      console.log('Raw SSE response headers:', [...apiResponse.headers.entries()]);
      
      // Strictly control which headers are forwarded
      const headers = new Headers();
      const allowedHeaders = [
        'alt-svc',
        'content-disposition',
        'content-type',
        'date',
        'server',
        'server-timing', 
        'vary',
        'x-content-type-options',
        'x-xss-protection'
      ];

      apiResponse.headers.forEach((value, key) => {
        if(allowedHeaders.includes(key.toLowerCase()) && 
           key.toLowerCase() !== 'content-encoding') {
          headers.set(key, value);
        }
      });
      
      // Force exact content-type
      headers.set('Content-Type', 'text/event-stream');
      // Add minimal CORS support
      headers.set('Access-Control-Allow-Origin', '*');
      
      // Full fidelity pass-through
      return new Response(apiResponse.body, {
        status: apiResponse.status,
        headers: headers
      });
    }
    
    // Standard response
    const responseHeaders = new Headers(apiResponse.headers);
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    return new Response(apiResponse.body, {
      status: apiResponse.status,
      headers: responseHeaders
    });
    } catch (error) {
      console.error("Proxy error details:", {
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.stack : error,
        request: {
          url: req.url,
          method: req.method,
          headers: Object.fromEntries(req.headers.entries()),
          body: await req.text().catch(() => 'Unable to read request body')
        }
      });
      return new Response(JSON.stringify({
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : String(error)
      }), { 
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
  }
}

// Start the server on port 8000
console.log("Proxy server running on http://localhost:8000");
serve(handler, { port: 8000 });
