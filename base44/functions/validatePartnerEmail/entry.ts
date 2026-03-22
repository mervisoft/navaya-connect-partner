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

    // Search for systemUser by email in Weclapp
    const searchUrl = `https://${subdomain}.weclapp.com/webapp/api/v1/systemUser?pageSize=100`;
    
    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'AuthenticationToken': apiToken,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return Response.json({ error: 'Failed to query Weclapp' }, { status: 500 });
    }

    const data = await response.json();
    const systemUsers = data.result || [];

    // Check if the user's email exists as a partner/handler
    const userExists = systemUsers.some(su => 
      su.email && su.email.toLowerCase() === user.email.toLowerCase()
    );

    return Response.json({ 
      isPartner: userExists,
      email: user.email
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});