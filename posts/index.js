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
        // 获取分页参数
        const pageLimit = 30; // 每页显示的帖子数量，默认30
        const pageOffset = parseInt(url.searchParams.get('offset')) || 0; // 偏移量，默认0
        // 获取所有帖子
        const posts = await env.DB.prepare('SELECT * FROM posts LIMIT ? OFFSET ?')
            .bind(pageLimit, pageOffset)
            .all();
        return new Response(JSON.stringify(posts), {
            headers: { 'Content-Type': 'application/json' }
        });
    },
    async onRequestPost(context) {
        const { request, env } = context;
        const url = new URL(request.url);
        // 创建新帖子
        const { title, content, author } = await request.json();
        const maxPostIdResult = await env.DB.prepare('SELECT MAX(id) as maxId FROM posts').first();
        const newPostId = (maxPostIdResult.maxId || 0) + 1;
        const result = await env.DB.prepare('INSERT INTO posts (id, title, content, author, date, score) VALUES (?, ?, ?, ?, ?, 0)')
            .bind(newPostId, title, content, author, new Date().toISOString())
            .run();
        const newPost = await env.DB.prepare('SELECT * FROM posts WHERE id = ?')
            .bind(newPostId)
            .first();
        return new Response(JSON.stringify(newPost), {
            headers: { 'Content-Type': 'application/json' }
        });
    }
};