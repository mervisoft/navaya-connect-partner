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

        const { customerId } = await req.json();

        let url;
        if (customerId) {
            // Fetch specific customer by ID
            url = `https://${subdomain}.weclapp.com/webapp/api/v1/customer/id/${customerId}`;
        } else {
            // Fetch first customer to inspect schema
            url = `https://${subdomain}.weclapp.com/webapp/api/v1/customer?pageSize=1`;
        }

        const response = await fetch(url, {
            headers: {
                'AuthenticationToken': apiToken,
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            return Response.json({ error: `Weclapp API error: ${response.status}`, details: errorText }, { status: 500 });
        }

        const data = await response.json();
        return Response.json({ success: true, data });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});