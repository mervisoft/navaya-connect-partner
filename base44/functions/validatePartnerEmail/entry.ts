import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subdomain = Deno.env.get('WECLAPP_SUBDOMAIN');
    const apiToken = Deno.env.get('WECLAPP_API_TOKEN');

    if (!subdomain || !apiToken) {
      return Response.json({ error: 'Missing Weclapp credentials' }, { status: 500 });
    }

    // Search for a customer with this email that has the partner attribute set
    const searchUrl = `https://${subdomain}.weclapp.com/webapp/api/v1/customer?email=${encodeURIComponent(user.email)}&pageSize=5`;
    
    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'AuthenticationToken': apiToken,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Weclapp error:', response.status, errorText);
      return Response.json({ error: `Weclapp error ${response.status}: ${errorText}` }, { status: 500 });
    }

    const data = await response.json();
    const customers = data.result || [];

    // User is a valid partner if they exist as a customer in Weclapp
    const isPartner = customers.length > 0;

    return Response.json({ 
      isPartner,
      email: user.email,
      found: customers.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});