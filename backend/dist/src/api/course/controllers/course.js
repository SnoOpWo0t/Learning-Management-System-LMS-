"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
exports.default = strapi_1.factories.createCoreController('api::course.course', ({ strapi }) => ({
    async create(ctx) {
        var _a;
        const user = ctx.state.user;
        if (!user) {
            return ctx.unauthorized('You must be logged in to create a course');
        }
        const roleName = (_a = user.role) === null || _a === void 0 ? void 0 : _a.name;
        if (roleName !== 'Admin' && roleName !== 'Content Manager' && roleName !== 'Instructor') {
            return ctx.forbidden('You do not have permission to create courses');
        }
        // Force the instructor to be the current user if they are an Instructor
        if (roleName === 'Instructor') {
            if (!ctx.request.body.data)
                ctx.request.body.data = {};
            ctx.request.body.data.instructor = user.id;
        }
        else {
            // Content Manager and Admin can set the instructor manually, or default to themselves if omitted
            if (!ctx.request.body.data)
                ctx.request.body.data = {};
            if (!ctx.request.body.data.instructor) {
                ctx.request.body.data.instructor = user.id;
            }
        }
        // Call the default create logic
        const response = await super.create(ctx);
        return response;
    },
    async find(ctx) {
        var _a;
        const user = ctx.state.user;
        // Public users and Students can see courses (handled by Strapi's public permissions or default logic)
        // But if it's an Instructor, we should strictly filter to only show their courses
        if (user && ((_a = user.role) === null || _a === void 0 ? void 0 : _a.name) === 'Instructor') {
            const filters = ctx.query.filters || {};
            ctx.query.filters = { ...filters, instructor: { documentId: user.documentId } };
        }
        return super.find(ctx);
    },
    async update(ctx) {
        var _a;
        const user = ctx.state.user;
        const { id } = ctx.params;
        if (!user)
            return ctx.unauthorized();
        const roleName = (_a = user.role) === null || _a === void 0 ? void 0 : _a.name;
        if (roleName === 'Instructor') {
            // Ensure the instructor owns the course
            const course = await strapi.entityService.findOne('api::course.course', id, { populate: ['instructor'] });
            if (!course)
                return ctx.notFound();
            if (!course.instructor || course.instructor.id !== user.id) {
                return ctx.forbidden('You can only update your own courses');
            }
        }
        else if (roleName !== 'Admin' && roleName !== 'Content Manager') {
            return ctx.forbidden('You do not have permission to update courses');
        }
        return super.update(ctx);
    },
    async delete(ctx) {
        var _a;
        const user = ctx.state.user;
        const { id } = ctx.params;
        if (!user)
            return ctx.unauthorized();
        const roleName = (_a = user.role) === null || _a === void 0 ? void 0 : _a.name;
        if (roleName === 'Instructor') {
            const course = await strapi.entityService.findOne('api::course.course', id, { populate: ['instructor'] });
            if (!course)
                return ctx.notFound();
            if (!course.instructor || course.instructor.id !== user.id) {
                return ctx.forbidden('You can only delete your own courses');
            }
        }
        else if (roleName !== 'Admin' && roleName !== 'Content Manager') {
            return ctx.forbidden('You do not have permission to delete courses');
        }
        return super.delete(ctx);
    }
}));
