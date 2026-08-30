"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
async function getUserRole(strapi, user) {
    var _a, _b;
    if ((_a = user.role) === null || _a === void 0 ? void 0 : _a.name)
        return user.role.name;
    if (user.roleType)
        return user.roleType;
    if (user.id) {
        const fullUser = await strapi.db.query('plugin::users-permissions.user').findOne({
            where: { id: user.id },
            populate: ['role']
        });
        return ((_b = fullUser === null || fullUser === void 0 ? void 0 : fullUser.role) === null || _b === void 0 ? void 0 : _b.name) || (fullUser === null || fullUser === void 0 ? void 0 : fullUser.roleType) || 'Student';
    }
    return 'Student';
}
exports.default = strapi_1.factories.createCoreController('api::blog-post.blog-post', ({ strapi }) => ({
    async delete(ctx) {
        const user = ctx.state.user;
        const { id } = ctx.params;
        if (!user)
            return ctx.unauthorized();
        const roleName = await getUserRole(strapi, user);
        if (roleName !== 'Admin' && roleName !== 'Content Manager') {
            return ctx.forbidden('You do not have permission to delete blog posts');
        }
        try {
            let blog;
            if (typeof id === 'string' && isNaN(Number(id))) {
                blog = await strapi.db.query('api::blog-post.blog-post').findOne({
                    where: { documentId: id }
                });
            }
            else {
                blog = await strapi.db.query('api::blog-post.blog-post').findOne({
                    where: { id: Number(id) }
                });
            }
            if (!blog)
                return ctx.notFound('Blog post not found');
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
        }
        catch (err) {
            console.error('Failed to delete blog post:', err);
            return ctx.badRequest('Failed to delete blog post: ' + ((err === null || err === void 0 ? void 0 : err.message) || 'Unknown error'));
        }
    }
}));
