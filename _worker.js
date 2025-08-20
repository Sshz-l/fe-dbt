export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // 处理 API 路由
    if (url.pathname.startsWith('/api/')) {
      // 可以在这里添加特定的 API 处理逻辑
      return new Response('API endpoint', { status: 200 });
    }

    // 对于其他请求，让 Pages 处理
    try {
      let response = await env.ASSETS.fetch(request);
      return response;
    } catch (e) {
      return new Response('Not Found', { status: 404 });
    }
  },
}; 