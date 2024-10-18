export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const { pathname } = url;
        const db = env.DB;

        if (request.method === 'GET' && pathname === '/posts') {
            // 获取所有帖子
            const posts = await db.prepare('SELECT * FROM posts').all();
            return new Response(JSON.stringify(posts), {
                headers: { 'Content-Type': 'application/json' }
            });

        } else if (request.method === 'POST' && pathname === '/posts') {
            // 创建新帖子
            const { title, content, author } = await request.json();
            const result = await db.prepare('INSERT INTO posts (title, content, author, date, score) VALUES (?, ?, ?, ?, 0)')
                .bind(title, content, author, new Date().toISOString())
                .run();
            const newPost = await db.prepare('SELECT * FROM posts WHERE id = ?').bind(result.lastInsertRowid).first();
            return new Response(JSON.stringify(newPost), {
                headers: { 'Content-Type': 'application/json' }
            });

        } else if (request.method === 'POST' && pathname.startsWith('/posts/') && pathname.endsWith('/replies')) {
            // 回复帖子
            const postId = pathname.split('/')[2];
            const { content, author } = await request.json();
            const result = await db.prepare('INSERT INTO replies (post_id, content, author, date, score) VALUES (?, ?, ?, ?, 0)')
                .bind(postId, content, author, new Date().toISOString())
                .run();
            const newReply = await db.prepare('SELECT * FROM replies WHERE id = ?').bind(result.lastInsertRowid).first();
            return new Response(JSON.stringify(newReply), {
                headers: { 'Content-Type': 'application/json' }
            });

        } else if (request.method === 'GET' && pathname.startsWith('/posts/') && pathname.endsWith('/replies')) {
            // 获取帖子的所有回复
            const postId = pathname.split('/')[2];
            const replies = await db.prepare('SELECT * FROM replies WHERE post_id = ?').bind(postId).all();
            return new Response(JSON.stringify(replies), {
                headers: { 'Content-Type': 'application/json' }
            });

        } else if (request.method === 'POST' && pathname.startsWith('/posts/') && pathname.endsWith('/like')) {
            // 给帖子点赞
            const postId = pathname.split('/')[2];
            await db.prepare('UPDATE posts SET score = score + 1 WHERE id = ?').bind(postId).run();
            const updatedPost = await db.prepare('SELECT * FROM posts WHERE id = ?').bind(postId).first();
            return new Response(JSON.stringify(updatedPost), {
                headers: { 'Content-Type': 'application/json' }
            });

        } else if (request.method === 'POST' && pathname.startsWith('/posts/') && pathname.endsWith('/dislike')) {
            // 给帖子点踩
            const postId = pathname.split('/')[2];
            await db.prepare('UPDATE posts SET score = score - 1 WHERE id = ?').bind(postId).run();
            const updatedPost = await db.prepare('SELECT * FROM posts WHERE id = ?').bind(postId).first();
            return new Response(JSON.stringify(updatedPost), {
                headers: { 'Content-Type': 'application/json' }
            });

        } else if (request.method === 'POST' && pathname.startsWith('/replies/') && pathname.endsWith('/like')) {
            // 给回复点赞
            const replyId = pathname.split('/')[2];
            await db.prepare('UPDATE replies SET score = score + 1 WHERE id = ?').bind(replyId).run();
            const updatedReply = await db.prepare('SELECT * FROM replies WHERE id = ?').bind(replyId).first();
            return new Response(JSON.stringify(updatedReply), {
                headers: { 'Content-Type': 'application/json' }
            });

        } else if (request.method === 'POST' && pathname.startsWith('/replies/') && pathname.endsWith('/dislike')) {
            // 给回复点踩
            const replyId = pathname.split('/')[2];
            await db.prepare('UPDATE replies SET score = score - 1 WHERE id = ?').bind(replyId).run();
            const updatedReply = await db.prepare('SELECT * FROM replies WHERE id = ?').bind(replyId).first();
            return new Response(JSON.stringify(updatedReply), {
                headers: { 'Content-Type': 'application/json' }
            });

        } else {
            return new Response('Not Found', { status: 404 });
        }
    }
};
