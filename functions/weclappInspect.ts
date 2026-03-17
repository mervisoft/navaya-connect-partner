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

        let reqBody = {};
        try { reqBody = await req.json(); } catch(_) {}

        const { customerId, partyId, mode } = reqBody;

        let url;
        if (customerId) {
            url = `https://${subdomain}.weclapp.com/webapp/api/v1/customer/id/${customerId}`;
        } else if (partyId) {
            // Look up a party/customer record by ID to get its name/details
            url = `https://${subdomain}.weclapp.com/webapp/api/v1/customer/id/${partyId}`;
        } else {
            // Find customers that have the "Betreut von Händler(n)" field set
            url = `https://${subdomain}.weclapp.com/webapp/api/v1/customer?pageSize=5&customAttribute453613.entityId-isnotnull=true`;
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

        // If fetching customers without ID, extract only relevant fields
        if (data.result && !customerId) {
            const simplified = data.result.map(c => ({
                id: c.id,
                company: c.company,
                customerNumber: c.customerNumber,
                customAttributes: c.customAttributes?.filter(a => a.attributeDefinitionId === '453613'),
            }));
            return Response.json({ success: true, count: data.result.length, customers: simplified });
        }

        return Response.json({ success: true, data });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});