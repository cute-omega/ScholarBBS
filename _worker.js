export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const { pathname, searchParams } = url;
        const db = env.DB;

        if (request.method === 'GET' && pathname === '/posts') {
            // 获取分页参数
            const pageLimit = 30; // 每页显示的帖子数量，默认30
            const pageOffset = parseInt(searchParams.get('offset')) || 0; // 偏移量，默认0

            // 获取所有帖子
            const posts = await db.prepare('SELECT * FROM posts LIMIT ? OFFSET ?').bind(pageLimit, pageOffset).all();
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
            // 获取帖子的回复
            const postId = pathname.split('/')[2];
            const replyLimit = 30; // 每页显示的回复数量，默认30
            const replyOffset = parseInt(searchParams.get('offset')) || 0; // 回复的偏移量，默认0

            const replies = await db.prepare('SELECT * FROM replies WHERE post_id = ? LIMIT ? OFFSET ?')
                .bind(postId, replyLimit, replyOffset)
                .all();
            return new Response(JSON.stringify(replies), {
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }
}
