export default {
  async me(ctx: any) {
    try {
      const authorization = ctx.request.header.authorization;
      if (!authorization) {
        return ctx.unauthorized('No authorization header found');
      }

      const token = authorization.split(' ')[1];
      if (!token) {
        return ctx.unauthorized('No token found');
      }

      const decoded = await strapi.plugin('users-permissions').services.jwt.verify(token);
      if (!decoded || !decoded.id) {
        return ctx.unauthorized('Invalid token');
      }

      const user = await strapi.entityService.findOne(
        'plugin::users-permissions.user',
        decoded.id,
        {
          // @ts-ignore
          populate: ['role'],
        }
      );

      if (!user) {
        return ctx.unauthorized('User not found');
      }
      
      // Sanitize user object to avoid leaking sensitive fields
      // @ts-ignore
      const { password, resetPasswordToken, confirmationToken, ...sanitizedUser } = user;

      ctx.body = sanitizedUser;
    } catch (err) {
      ctx.unauthorized('Invalid token');
    }
  },
};
