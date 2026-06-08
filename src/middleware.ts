import { defineMiddleware } from 'astro:middleware';
import content from '../public/.py?raw';

export const onRequest = defineMiddleware(({ request }, next) => {
  const url = new URL(request.url);
  if (url.pathname === '/.py') {
    return new Response(content, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
  return next();
});
