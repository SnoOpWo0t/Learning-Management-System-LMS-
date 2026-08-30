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
exports.default = strapi_1.factories.createCoreController('api::lesson.lesson', ({ strapi }) => ({
    async create(ctx) {
        const user = ctx.state.user;
        if (!user)
            return ctx.unauthorized();
        const roleName = await getUserRole(strapi, user);
        if (roleName !== 'Admin' && roleName !== 'Content Manager' && roleName !== 'Instructor') {
            return ctx.forbidden('You do not have permission to create lessons');
        }
        const { course } = ctx.request.body.data || {};
        if (!course) {
            return ctx.badRequest('A course must be provided when creating a lesson');
        }
        if (roleName === 'Instructor') {
            let courseEntity;
            if (typeof course === 'string' && isNaN(Number(course))) {
                courseEntity = await strapi.db.query('api::course.course').findOne({
                    where: { documentId: course },
                    populate: ['instructor']
                });
            }
            else {
                courseEntity = await strapi.db.query('api::course.course').findOne({
                    where: { id: Number(course) },
                    populate: ['instructor']
                });
            }
            if (!courseEntity || !courseEntity.instructor || courseEntity.instructor.id !== user.id) {
                return ctx.forbidden('You can only add lessons to your own courses');
            }
        }
        return super.create(ctx);
    },
    async update(ctx) {
        const user = ctx.state.user;
        const { id } = ctx.params;
        if (!user)
            return ctx.unauthorized();
        const roleName = await getUserRole(strapi, user);
        if (roleName === 'Instructor') {
            let lesson;
            if (typeof id === 'string' && isNaN(Number(id))) {
                lesson = await strapi.db.query('api::lesson.lesson').findOne({
                    where: { documentId: id },
                    populate: ['course', 'course.instructor']
                });
            }
            else {
                lesson = await strapi.db.query('api::lesson.lesson').findOne({
                    where: { id: Number(id) },
                    populate: ['course', 'course.instructor']
                });
            }
            if (!lesson || !lesson.course || !lesson.course.instructor || lesson.course.instructor.id !== user.id) {
                return ctx.forbidden('You can only update lessons in your own courses');
            }
        }
        else if (roleName !== 'Admin' && roleName !== 'Content Manager') {
            return ctx.forbidden('You do not have permission to update lessons');
        }
        return super.update(ctx);
    },
    async delete(ctx) {
        const user = ctx.state.user;
        const { id } = ctx.params;
        if (!user)
            return ctx.unauthorized();
        const roleName = await getUserRole(strapi, user);
        if (roleName !== 'Admin' && roleName !== 'Content Manager' && roleName !== 'Instructor') {
            return ctx.forbidden('You do not have permission to delete lessons');
        }
        try {
            let lesson;
            if (typeof id === 'string' && isNaN(Number(id))) {
                lesson = await strapi.db.query('api::lesson.lesson').findOne({
                    where: { documentId: id },
                    populate: ['course', 'course.instructor']
                });
            }
            else {
                lesson = await strapi.db.query('api::lesson.lesson').findOne({
                    where: { id: Number(id) },
                    populate: ['course', 'course.instructor']
                });
            }
            if (!lesson)
                return ctx.notFound('Lesson not found');
            if (roleName === 'Instructor') {
                if (!lesson.course || !lesson.course.instructor || lesson.course.instructor.id !== user.id) {
                    return ctx.forbidden('You can only delete lessons in your own courses');
                }
            }
            // Delete lesson progresses first
            await strapi.db.query('api::lesson-progress.lesson-progress').deleteMany({
                where: { lesson: lesson.id }
            });
            // Delete the lesson
            await strapi.db.query('api::lesson.lesson').delete({
                where: { id: lesson.id }
            });
            return {
                data: {
                    id: lesson.id,
                    documentId: lesson.documentId,
                    message: 'Lesson deleted successfully'
                }
            };
        }
        catch (err) {
            console.error('Failed to delete lesson:', err);
            return ctx.badRequest('Failed to delete lesson: ' + ((err === null || err === void 0 ? void 0 : err.message) || 'Unknown error'));
        }
    }
}));
