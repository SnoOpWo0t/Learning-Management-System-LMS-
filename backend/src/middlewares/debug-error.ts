export default () => {
  return async (ctx: any, next: () => Promise<void>) => {
    ctx.set('X-Debug-Middleware', 'active');
    try {
      await next();
    } catch (err: any) {
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
