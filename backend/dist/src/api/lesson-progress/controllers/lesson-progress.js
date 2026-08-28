"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
exports.default = strapi_1.factories.createCoreController('api::lesson-progress.lesson-progress', ({ strapi }) => ({
    async create(ctx) {
        const user = ctx.state.user;
        if (!user)
            return ctx.unauthorized();
        const { lesson, student } = ctx.request.body.data || {};
        if (!lesson) {
            return ctx.badRequest('Lesson is required');
        }
        // Force student to be the current user
        const targetStudent = user.id;
        // Fetch the lesson to find the course
        const lessonEntity = await strapi.entityService.findOne('api::lesson.lesson', lesson, { populate: ['course'] });
        if (!lessonEntity || !lessonEntity.course) {
            return ctx.badRequest('Invalid lesson');
        }
        // Ensure user is enrolled in the course
        const enrollments = await strapi.entityService.findMany('api::enrollment.enrollment', {
            filters: {
                student: targetStudent,
                course: lessonEntity.course.id
            }
        });
        if (!enrollments || enrollments.length === 0) {
            return ctx.forbidden('You are not enrolled in this course');
        }
        // Check for duplicate progress
        const existingProgress = await strapi.entityService.findMany('api::lesson-progress.lesson-progress', {
            filters: {
                student: targetStudent,
                lesson: lesson
            }
        });
        if (existingProgress && existingProgress.length > 0) {
            return ctx.badRequest('You have already completed this lesson');
        }
        ctx.request.body.data.student = targetStudent;
        ctx.request.body.data.completed = true;
        return super.create(ctx);
    },
    async find(ctx) {
        var _a;
        const user = ctx.state.user;
        if (!user)
            return ctx.unauthorized();
        const roleName = (_a = user.role) === null || _a === void 0 ? void 0 : _a.name;
        const filters = ctx.query.filters || {};
        if (roleName === 'Student') {
            ctx.query.filters = { ...filters, student: { documentId: user.documentId } };
        }
        else if (roleName === 'Instructor') {
            ctx.query.filters = { ...filters, lesson: { course: { instructor: { documentId: user.documentId } } } };
        }
        return super.find(ctx);
    }
}));
