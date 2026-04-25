import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const records = await base44.asServiceRole.entities.AppStats.filter({ key: 'user_count' });

    let count = 217;
    if (records && records.length > 0) {
      count = records[0].value;
    }

    return Response.json({ count });
  } catch (error) {
    console.error('getUserCount error:', error);
    return Response.json({ count: 217 });
  }
});