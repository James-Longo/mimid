/**
 * Mimid API Proxy - Optimized for Cloudflare Workers
 * 
 * This worker acts as a secure gateway for eBird and Xeno-canto API requests,
 * injecting API keys from environment variables so they remain hidden from the client.
 */

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const corsHeaders = {
            "Access-Control-Allow-Origin": "*", // You can restrict this to your GitHub Pages domain
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        };

        // Handle CORS preflight
        if (request.method === "OPTIONS") {
            return new Response(null, { headers: corsHeaders });
        }

        try {
            // 1. Xeno-canto Proxy
            if (url.pathname.startsWith("/api/xc")) {
                const xcQuery = url.searchParams.get("query");
                if (!xcQuery) return new Response("Missing query", { status: 400, headers: corsHeaders });

                const xcKey = env.XC_API_KEY;
                const targetUrl = `https://xeno-canto.org/api/3/recordings?query=${encodeURIComponent(xcQuery)}&key=${xcKey}`;

                const response = await fetch(targetUrl);
                const data = await response.json();

                return new Response(JSON.stringify(data), {
                    headers: { ...corsHeaders, "Content-Type": "application/json" }
                });
            }

            // 2. eBird Proxy
            if (url.pathname.startsWith("/api/ebird")) {
                const regionCode = url.searchParams.get("region");
                if (!regionCode) return new Response("Missing region", { status: 400, headers: corsHeaders });

                const ebKey = env.EBIRD_API_KEY;
                const targetUrl = `https://api.ebird.org/v2/product/spplist/${regionCode}?key=${ebKey}`;

                const response = await fetch(targetUrl);
                const data = await response.json();

                return new Response(JSON.stringify(data), {
                    headers: { ...corsHeaders, "Content-Type": "application/json" }
                });
            }

            return new Response("Not Found", { status: 404, headers: corsHeaders });

        } catch (err) {
            return new Response(JSON.stringify({ error: err.message }), {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }
    },
};
