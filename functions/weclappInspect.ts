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
            url = `https://${subdomain}.weclapp.com/webapp/api/v1/customer/id/${customerId}`;
        } else {
            // Fetch ALL attribute definitions, then filter for dealer/händler related ones
            url = `https://${subdomain}.weclapp.com/webapp/api/v1/customAttributeDefinition?pageSize=200`;
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

        // If fetching attribute definitions, filter and summarize
        if (data.result && !customerId) {
            const summary = data.result.map(attr => ({
                id: attr.id,
                label: attr.label,
                attributeKey: attr.attributeKey,
                attributeType: attr.attributeType,
                entities: attr.entities,
                groupName: attr.groupName,
                description: attr.attributeDescription,
            }));
            // Filter for dealer/reseller related attributes
            const dealerAttrs = summary.filter(a => 
                (a.label || '').toLowerCase().includes('händ') ||
                (a.label || '').toLowerCase().includes('dealer') ||
                (a.label || '').toLowerCase().includes('partner') ||
                (a.label || '').toLowerCase().includes('betreut') ||
                (a.groupName || '').toLowerCase().includes('händ') ||
                (a.groupName || '').toLowerCase().includes('partner') ||
                (a.description || '').toLowerCase().includes('händ')
            );
            return Response.json({ success: true, allCount: data.result.length, dealerAttributes: dealerAttrs, allSummary: summary });
        }

        return Response.json({ success: true, data });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});