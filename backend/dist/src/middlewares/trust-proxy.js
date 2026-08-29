"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * trust-proxy middleware
 *
 * Sets Koa's app.proxy = true so that X-Forwarded-Proto headers
 * from reverse proxies (Railway, Heroku, etc.) are trusted.
 * This allows secure cookies to work when SSL is terminated at the proxy.
 */
exports.default = () => {
    return async (ctx, next) => {
        if (!ctx.app.proxy) {
            ctx.app.proxy = true;
        }
        await next();
    };
};
