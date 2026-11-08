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

function isAssignedTo(c, partyId) {
    if (!partyId) return false;
    const attr = (c.customAttributes || []).find(a => a.attributeDefinitionId === WECLAPP_ATTR_ID);
    if (!attr) return false;
    return (attr.entityReferences || []).some(r => r.entityId === String(partyId));
}

// Server-side ermittelte Party-ID des eingeloggten Nutzers (nie vom Client uebernommen).
async function getOwnPartyId(base44, user, subdomain, apiToken) {
    if (user.weclapp_party_id) return String(user.weclapp_party_id);
    if (!user.email) return null;
    const data = await weclappFetch(subdomain, apiToken,
        `/customer?email=${encodeURIComponent(user.email)}&pageSize=5`
    );
    const match = (data.result || [])[0];
    if (!match) return null;
    try {
        await base44.asServiceRole.entities.User.update(user.id, { weclapp_party_id: String(match.id) });
    } catch (e) {
        console.error('Could not persist weclapp_party_id', e?.message);
    }
    return String(match.id);
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

        const { mode, email, weclappId } = reqBody;
        const isAdmin = user.role === 'admin';
        // Nicht-Admins: Party-ID immer serverseitig bestimmen, Client-Wert ignorieren
        const partyId = isAdmin
            ? (reqBody.partyId ? String(reqBody.partyId) : null)
            : (mode === 'resolve' ? null : await getOwnPartyId(base44, user, subdomain, apiToken));

        // --- MODE: single customer by weclappId ---
        if (mode === 'customer' && weclappId) {
            const data = await weclappFetch(subdomain, apiToken, `/customer/id/${encodeURIComponent(String(weclappId))}`);
            const c = data;
            if (!isAdmin && !isAssignedTo(c, partyId)) {
                return Response.json({ error: 'Forbidden' }, { status: 403 });
            }
            return Response.json({
                success: true,
                customer: {
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
                }
            });
        }

        // --- MODE: resolve --- 
        // Given a user email, find the matching weclapp customer and return partyId
        if (mode === 'resolve') {
            if (!isAdmin) {
                // Nur die eigene E-Mail; Ergebnis wird serverseitig am Nutzer gespeichert
                const own = await getOwnPartyId(base44, user, subdomain, apiToken);
                return own
                    ? Response.json({ success: true, partyId: own })
                    : Response.json({ success: false, partyId: null, message: 'No weclapp customer found for this email' });
            }
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
        // Admins see all customers; regular users filtered by their partyId
        if (!partyId && !isAdmin) {
            return Response.json({ success: false, error: 'No partyId provided and user is not admin' }, { status: 403 });
        }

        // Fetch all customers (with or without dealer attribute)
        // Admins get all customers; dealers get only their assigned ones
        let url;
        if (isAdmin && !partyId) {
            // Admin without specific partyId: get ALL customers
            url = `/customer?pageSize=250&page=1`;
        } else {
            // Dealer or admin filtering by specific partyId: filter by attribute
            url = `/customer?pageSize=250&page=1`;
        }
        const data = await weclappFetch(subdomain, apiToken, url);
        let results = data.result || [];

        // Client-side filter by partyId if provided (for dealers or admin impersonation)
        if (partyId) {
            // Strikt: nur zugeordnete Kunden (kein Fallback auf alle Kunden)
            results = results.filter(c => isAssignedTo(c, partyId));
        }

        const customers = results.map(c => ({
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

        return Response.json({ success: true, count: customers.length, total: (data.result || []).length, customers });

    } catch (error) {
        console.error('weclappProxy error', error?.message);
        return Response.json({ error: 'Interner Fehler' }, { status: 500 });
    }
});