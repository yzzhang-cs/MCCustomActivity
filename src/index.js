function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json;charset=UTF-8'
    }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (pathname === '/health') {
      return jsonResponse({ status: 'ok', service: 'hello-world-custom-activity' });
    }

    if (pathname === '/save' || pathname === '/validate' || pathname === '/publish' || pathname === '/stop') {
      return jsonResponse({});
    }

    if (pathname === '/execute') {
      let body = {};
      try {
          body = await request.json();
      } catch {
          body = {};
      }
  
      console.log({
          event: 'execute_called',
          body: body,
          timestamp: new Date().toISOString()
      });

      const inArgs = body.inArguments || [];
      const firstArg = inArgs[0] || {};
      const secondArg = inArgs[1] || {};
      const emailAddress = firstArg.emailAddress || body.emailAddress || '';
      const message = secondArg.message ?? body.message ?? '';

      return jsonResponse({
        greeting: message ? `Hello ${emailAddress || 'there'}! Your message was: ${message}` : `Hello ${emailAddress || 'World'}!`,
        receivedMessage: message,
        emailAddress,
        echo: message
      });
    }

    if (pathname === '/' || pathname === '/index.html') {
      const asset = await env.ASSETS.fetch(new Request(new URL('/index.html', request.url)));
      if (asset.status !== 404) {
        return asset;
      }
    }

    const asset = await env.ASSETS.fetch(request);
    if (asset.status !== 404) {
      return asset;
    }

    return new Response('Not Found', { status: 404 });
  }
};
