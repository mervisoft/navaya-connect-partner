import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const subdomain = Deno.env.get("WECLAPP_SUBDOMAIN");
        const apiToken = Deno.env.get("WECLAPP_API_TOKEN");

        let customerId = null;
        try {
            const body = await req.json();
            customerId = body.customerId;
        } catch (_) {
            // No body provided, customerId remains null
        }

        let url;
        if (customerId) {
            // Fetch specific customer by ID
            url = `https://${subdomain}.weclapp.com/webapp/api/v1/customer/id/${customerId}`;
        } else {
            // Fetch first customer to inspect schema
            url = `https://${subdomain}.weclapp.com/webapp/api/v1/customer?pageSize=1`;
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(url, {
            headers: {
                'AuthenticationToken': apiToken,
                'Content-Type': 'application/json',
            },
            signal: controller.signal
        });
        clearTimeout(timeout);

        const responseText = await response.text();

        if (!response.ok) {
            return Response.json({ error: `Weclapp API error: ${response.status}`, details: responseText }, { status: 500 });
        }

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (_) {
            return Response.json({ error: 'Could not parse response', raw: responseText });
        }

        return Response.json({ success: true, data });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});