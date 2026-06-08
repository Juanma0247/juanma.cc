import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { MiddlewareHandler } from 'astro';

export const onRequest: MiddlewareHandler = ({ request }, next) => {
  const url = new URL(request.url);
  if (url.pathname === '/.py') {
    const base = import.meta.env.PROD
      ? join(process.cwd(), 'dist', 'client')
      : join(process.cwd(), 'public');
    const content = readFileSync(join(base, '.py'), 'utf-8');
    return new Response(content, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
  return next();
};
