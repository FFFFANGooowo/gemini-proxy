# Google AI API Deno Proxy

A simple proxy server that forwards requests to Google's AI API.

## Setup

1. Install Deno: https://deno.land/
2. Set your Google API key as environment variable:
   ```bash
   export GOOGLE_API_KEY="your-api-key-here"
   ```
   (Windows: `set GOOGLE_API_KEY=your-api-key-here`)

## Running

```bash
deno task start
```

This will:
- Start the proxy server on port 8000
- Require network access (--allow-net)
- Require environment variable access (--allow-env)

## Usage

Send POST requests to `http://localhost:8000` with your Google AI API payload.
The proxy will forward the request to Google's API and return the response unchanged.

## Deployment

To deploy to Deno Deploy:
1. Create an account at https://deno.com/deploy
2. Connect your GitHub repository
3. Set the GOOGLE_API_KEY as an environment variable in the Deno Deploy dashboard
4. Deploy your project
