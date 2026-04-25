import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get the user_count stat record
    const records = await base44.asServiceRole.entities.AppStats.filter({ key: 'user_count' });

    let count = 217; // base seed count
    if (records && records.length > 0) {
      count = records[0].value;
    }

    return Response.json({ count });
  } catch (error) {
    console.error('getUserCount error:', error);
    // Return seed value on error so the UI always shows something
    return Response.json({ count: 217 });
  }
});