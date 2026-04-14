import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Called when an invited family member clicks their link and signs in.
// Payload: { family_group_id }
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { family_group_id } = body;
    if (!family_group_id) return Response.json({ error: 'Missing family_group_id' }, { status: 400 });

    // Find the family group
    const groups = await base44.asServiceRole.entities.FamilyGroup.filter({ id: family_group_id });
    const group = groups[0];
    if (!group) return Response.json({ error: 'Family group not found' }, { status: 404 });

    if (group.status !== 'active') {
      return Response.json({ error: 'This family plan is no longer active.' }, { status: 403 });
    }

    // Check if user already a member or admin
    if (group.admin_user_id === user.id) {
      return Response.json({ success: true, message: 'You are the admin of this family group.' });
    }

    const members = group.members || [];
    const existing = members.find(m => m.email === user.email || m.user_id === user.id);

    if (existing && existing.status === 'joined') {
      return Response.json({ success: true, message: 'Already a member.' });
    }

    if (members.filter(m => m.status === 'joined').length >= 5) {
      return Response.json({ error: 'This family plan is full (5 members maximum).' }, { status: 403 });
    }

    // Update member status to joined
    const updatedMembers = members.map(m =>
      m.email === user.email
        ? { ...m, user_id: user.id, status: 'joined' }
        : m
    );
    // If member wasn't pre-invited, add them
    if (!existing) {
      if (members.length >= 5) {
        return Response.json({ error: 'Family plan is full.' }, { status: 403 });
      }
      updatedMembers.push({ email: user.email, user_id: user.id, status: 'joined', invited_at: new Date().toISOString() });
    }

    await base44.asServiceRole.entities.FamilyGroup.update(family_group_id, { members: updatedMembers });

    // Grant premium access to the member
    await base44.auth.updateMe({
      account_type: 'family',
      family_group_id: family_group_id,
    });

    console.log(`User ${user.email} joined family group ${family_group_id}`);
    return Response.json({ success: true });
  } catch (error) {
    console.error('familyInviteAccept error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});