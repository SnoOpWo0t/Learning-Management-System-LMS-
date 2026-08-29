/**
 * trust-proxy middleware
 * 
 * Sets Koa's app.proxy = true so that X-Forwarded-Proto headers
 * from reverse proxies (Railway, Heroku, etc.) are trusted.
 * This allows secure cookies to work when SSL is terminated at the proxy.
 */
export default () => {
  return async (ctx: any, next: () => Promise<void>) => {
    if (!ctx.app.proxy) {
      ctx.app.proxy = true;
    }
    await next();
  };
};
