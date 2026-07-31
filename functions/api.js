// functions/api.js

export async function onRequest(context) {
  const method = context.request.method;

  // 1. Handle CORS pre-flight requests immediately
  if (method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  }

  // 2. Get D1 binding safely from context
  const DB = context.env.DB;

  if (!DB) {
    return new Response(
      JSON.stringify({ error: "D1 Binding not found. Check dashboard setup!" }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      }
    );
  }

  try {
    // Ensure table exists on first run
    await DB.prepare(`
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY,
        threadId INTEGER NOT NULL,
        subject TEXT DEFAULT '',
        name TEXT DEFAULT 'Anonymous',
        tripcode TEXT DEFAULT '',
        timestamp TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT DEFAULT 'all',
        attachment TEXT,
        isSticky INTEGER DEFAULT 0,
        isClosed INTEGER DEFAULT 0,
        isVerticalText INTEGER DEFAULT 0
      )
    `).run();

    // 3. Handle GET Requests (Fetch all posts)
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
          headers: { 
            "Content-Type": "application/json", 
            "Access-Control-Allow-Origin": "*" 
          }
        }
      );
    }

    // 4. Handle POST Requests (Create, Update, Delete)
    if (method === "POST") {
      const body = await context.request.json();

      // Action: Delete Post or Thread
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
          headers: { 
            "Content-Type": "application/json", 
            "Access-Control-Allow-Origin": "*" 
          }
        });
      }

      // Action: Update Timestamp
      if (body.action === "updateTimestamp" && body.id && body.timestamp) {
        await DB.prepare("UPDATE posts SET timestamp = ? WHERE id = ?")
          .bind(body.timestamp, body.id)
          .run();
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 
            "Content-Type": "application/json", 
            "Access-Control-Allow-Origin": "*" 
          }
        });
      }

      // Action: Upsert Post (Insert or Update on conflict)
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
          headers: { 
            "Content-Type": "application/json", 
            "Access-Control-Allow-Origin": "*" 
          }
        });
      }

      return new Response(JSON.stringify({ error: "Invalid post payload" }), {
        status: 400,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    // 5. Catch unsupported methods
    return new Response(JSON.stringify({ error: "Method not allowed" }), { 
      status: 405,
      headers: {
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}
