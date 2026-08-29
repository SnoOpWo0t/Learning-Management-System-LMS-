"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => {
    return async (ctx, next) => {
        ctx.set('X-Debug-Middleware', 'active');
        try {
            await next();
        }
        catch (err) {
            ctx.status = 418;
            ctx.body = {
                error: "CUSTOM_ERROR_CATCH",
                message: err.message,
                stack: err.stack,
                details: err.details
            };
            console.error('[CUSTOM-ERROR]', err);
        }
    };
};
