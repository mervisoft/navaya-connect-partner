import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const WECLAPP_ATTR_ID = '453613'; // "Betreut von Händler(n)" attribute

async function weclappFetch(subdomain, apiToken, path) {
    const response = await fetch(`https://${subdomain}.weclapp.com/webapp/api/v1${path}`, {
        headers: {
            'AuthenticationToken': apiToken,
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Weclapp API error ${response.status}: ${text}`);
    }
    return response.json();
}

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

        const { mode, email, partyId, page = 1, pageSize = 100 } = reqBody;

        // --- MODE: resolve --- 
        // Given a user email, find the matching weclapp customer and return partyId
        if (mode === 'resolve') {
            const targetEmail = email || user.email;
            // Search by email in customer list
            const data = await weclappFetch(subdomain, apiToken,
                `/customer?email=${encodeURIComponent(targetEmail)}&pageSize=5`
            );
            const matches = (data.result || []);
            if (matches.length > 0) {
                const match = matches[0];
                return Response.json({
                    success: true,
                    partyId: match.id,
                    company: match.company,
                    customerNumber: match.customerNumber,
                });
            }
            return Response.json({ success: false, partyId: null, message: 'No weclapp customer found for this email' });
        }

        // --- MODE: customers (default) ---
        // Fetch all customers that have the dealer attribute set, then filter client-side by partyId
        if (!partyId && user.role !== 'admin') {
            return Response.json({ success: false, error: 'No partyId provided and user is not admin' }, { status: 403 });
        }

        // Fetch all customers with the attribute set (may need pagination for large datasets)
        const url = `/customer?pageSize=250&page=1&customAttribute${WECLAPP_ATTR_ID}.entityId-isnotnull=true`;
        const data = await weclappFetch(subdomain, apiToken, url);
        const customers = (data.result || []).map(c => ({
            id: c.id,
            customerNumber: c.customerNumber,
            company: c.company,
            email: c.email,
            phone: c.phone,
            website: c.website,
            city: c.addresses?.find(a => a.primeAddress)?.city || '',
            street: c.addresses?.find(a => a.primeAddress)?.street1 || '',
            zipcode: c.addresses?.find(a => a.primeAddress)?.zipcode || '',
            countryCode: c.addresses?.find(a => a.primeAddress)?.countryCode || '',
            contacts: (c.contacts || []).map(ct => ({
                id: ct.id,
                firstName: ct.firstName,
                lastName: ct.lastName,
                email: ct.email,
                phone: ct.phone,
            })),
            assignedDealerIds: (c.customAttributes || [])
                .filter(a => a.attributeDefinitionId === WECLAPP_ATTR_ID)
                .flatMap(a => (a.selectedValueId ? [a.selectedValueId] : []))
                .concat(
                    (c.customAttributes || [])
                        .filter(a => a.attributeDefinitionId === WECLAPP_ATTR_ID)
                        .flatMap(a => (a.entityReferences || []).map(r => r.entityId))
                ),
        }));

        return Response.json({ success: true, count: customers.length, customers });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});