Deno.serve(async (req) => {
  try {
    const body = await req.json();
    console.log('GOT BODY:', JSON.stringify(body));
    return Response.json({ ok: true, received: body });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
});