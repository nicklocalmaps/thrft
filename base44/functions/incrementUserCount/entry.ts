import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const records = await base44.asServiceRole.entities.AppStats.filter({ key: 'user_count' });

    if (records && records.length > 0) {
      const current = records[0].value || 11483;
      await base44.asServiceRole.entities.AppStats.update(records[0].id, { value: current + 1 });
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error('incrementUserCount error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});