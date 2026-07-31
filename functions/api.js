// functions/api.js

export async function onRequest(context) {
  // 1. Get D1 binding safely from context
  const DB = context.env.DB;

  if (!DB) {
    return new Response(
      JSON.stringify({ error: "D1 Binding not found. Check dashboard setup!" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  try {
    // Auto-create table if not existing
    await DB.prepare(`
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY,
        threadId INTEGER,
        subject TEXT,
        name TEXT,
        tripcode TEXT,
        timestamp TEXT,
        content TEXT,
        category TEXT,
        attachment TEXT,
        isSticky INTEGER,
        isClosed INTEGER,
        isVerticalText INTEGER
      )
    `).run();

    const method = context.request.method;

    if (method === "GET") {
      const { results } = await DB.prepare("SELECT * FROM posts ORDER BY id DESC").all();
      const formattedPosts = (results || []).map((p) => ({
        ...p,
        isSticky: Boolean(p.isSticky),
        isClosed: Boolean(p.isClosed),
        isVerticalText: Boolean(p.isVerticalText),
        attachment: p.attachment ? JSON.parse(p.attachment) : undefined
      }));

      return new Response(
        JSON.stringify({ success: true, results: formattedPosts, posts: formattedPosts }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        }
      );
    }

    if (method === "POST") {
      const body = await context.request.json();

      if (body.action === "delete" && body.id) {
        const targetId = body.id;
        const { results } = await DB.prepare("SELECT * FROM posts WHERE id = ?").bind(targetId).all();
        if (results && results.length > 0) {
          const target = results[0];
          if (target.id === target.threadId) {
            await DB.prepare("DELETE FROM posts WHERE threadId = ?").bind(target.id).run();
          } else {
            await DB.prepare("DELETE FROM posts WHERE id = ?").bind(targetId).run();
          }
        }
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
      }

      if (body.action === "updateTimestamp" && body.id && body.timestamp) {
        await DB.prepare("UPDATE posts SET timestamp = ? WHERE id = ?")
          .bind(body.timestamp, body.id)
          .run();
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
      }

      const post = body.post || body;
      if (post && post.id) {
        await DB.prepare(`
          INSERT INTO posts (id, threadId, subject, name, tripcode, timestamp, content, category, attachment, isSticky, isClosed, isVerticalText)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            threadId = excluded.threadId,
            subject = excluded.subject,
            name = excluded.name,
            tripcode = excluded.tripcode,
            timestamp = excluded.timestamp,
            content = excluded.content,
            category = excluded.category,
            attachment = excluded.attachment,
            isSticky = excluded.isSticky,
            isClosed = excluded.isClosed,
            isVerticalText = excluded.isVerticalText
        `).bind(
          post.id,
          post.threadId || post.id,
          post.subject || '',
          post.name || 'Anonymous',
          post.tripcode || '',
          post.timestamp || '',
          post.content || '',
          post.category || 'all',
          post.attachment ? JSON.stringify(post.attachment) : null,
          post.isSticky ? 1 : 0,
          post.isClosed ? 1 : 0,
          post.isVerticalText ? 1 : 0
        ).run();

        return new Response(JSON.stringify({ success: true, post }), {
          status: 200,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
      }

      return new Response(JSON.stringify({ error: "Invalid post payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
