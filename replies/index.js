export default {
    async onRequest(context) {
        const response = await context.next();
        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Max-Age', '86400');
        return response;
    },
    async onRequestOptions(context) {
        const response = await context.next();
        response.status = 204;
        response.headers.set('Access-Control-Allow-Headers', '*');
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        return response;
    },
    async onRequestGet(context) {
        const { request, env } = context;
        const url = new URL(request.url);
        // 获取帖子的回复
        const postId = parseInt(url.searchParams.get('postId')); // 帖子ID
        const replyLimit = 30; // 每页显示的回复数量，默认30
        const replyOffset = parseInt(url.searchParams.get('offset')) || 0; // 回复的偏移量，默认0

        const replies = await env.DB.prepare('SELECT * FROM replies WHERE post_id = ? LIMIT ? OFFSET ?')
            .bind(postId, replyLimit, replyOffset)
            .all();
        return new Response(JSON.stringify(replies), {
            headers: { 'Content-Type': 'application/json' }
        });
    },
    async onRequestPost(context) {
        const { request, env } = context;
        const url = new URL(request.url);
        // 回复帖子
        const postId = parseInt(url.searchParams.get('postId')); // 帖子ID
        const { content, author } = await request.json();
        const maxReplyIdResult = await env.DB.prepare('SELECT MAX(id) as maxId FROM replies').first();
        const newReplyId = (maxReplyIdResult.maxId || 0) + 1;
        const result = await env.DB.prepare('INSERT INTO replies (id, post_id, content, author, date, score) VALUES (?, ?, ?, ?, ?, 0)')
            .bind(newReplyId, postId, content, author, new Date().toISOString())
            .run();
        const newReply = await env.DB.prepare('SELECT * FROM replies WHERE id = ?')
            .bind(newReplyId)
            .first();
        return new Response(JSON.stringify(newReply), {
            headers: { 'Content-Type': 'application/json' }
        });
    }
};