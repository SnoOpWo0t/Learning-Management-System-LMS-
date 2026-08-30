import { factories } from '@strapi/strapi';

async function getUserRole(strapi: any, user: any) {
  if (user.role?.name) return user.role.name;
  if (user.roleType) return user.roleType;
  if (user.id) {
    const fullUser = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { id: user.id },
      populate: ['role']
    });
    return fullUser?.role?.name || fullUser?.roleType || 'Student';
  }
  return 'Student';
}

export default factories.createCoreController('api::blog-post.blog-post', ({ strapi }) => ({
  async delete(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;
    
    if (!user) return ctx.unauthorized();
    const roleName = await getUserRole(strapi, user);

    if (roleName !== 'Admin' && roleName !== 'Content Manager') {
      return ctx.forbidden('You do not have permission to delete blog posts');
    }

    try {
      let blog: any;
      if (typeof id === 'string' && isNaN(Number(id))) {
        blog = await strapi.db.query('api::blog-post.blog-post').findOne({
          where: { documentId: id }
        });
      } else {
        blog = await strapi.db.query('api::blog-post.blog-post').findOne({
          where: { id: Number(id) }
        });
      }

      if (!blog) return ctx.notFound('Blog post not found');

      await strapi.db.query('api::blog-post.blog-post').delete({
        where: { id: blog.id }
      });

      return {
        data: {
          id: blog.id,
          documentId: blog.documentId,
          message: 'Blog post deleted successfully'
        }
      };
    } catch (err: any) {
      console.error('Failed to delete blog post:', err);
      return ctx.badRequest('Failed to delete blog post: ' + (err?.message || 'Unknown error'));
    }
  }
}));
