import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { email, role } = await req.json();
        if (!email || !role) {
            return Response.json({ error: 'email and role required' }, { status: 400 });
        }

        const users = await base44.asServiceRole.entities.User.filter({ email });
        if (!users || users.length === 0) {
            return Response.json({ error: 'User not found' }, { status: 404 });
        }

        const targetUser = users[0];
        await base44.asServiceRole.entities.User.update(targetUser.id, { role });

        return Response.json({ success: true, updated: { email, role } });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});