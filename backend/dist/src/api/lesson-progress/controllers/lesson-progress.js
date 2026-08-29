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
        const targetStudentId = user.id;
        try {
            // 1. Fetch the lesson to get numeric ID and its course numeric ID
            let lessonEntity;
            if (typeof lesson === 'string') {
                lessonEntity = await strapi.db.query('api::lesson.lesson').findOne({
                    where: { documentId: lesson },
                    populate: ['course']
                });
            }
            else {
                lessonEntity = await strapi.db.query('api::lesson.lesson').findOne({
                    where: { id: lesson },
                    populate: ['course']
                });
            }
            if (!lessonEntity) {
                return ctx.badRequest('Invalid lesson');
            }
            if (!lessonEntity.course) {
                return ctx.badRequest('Lesson has no associated course');
            }
            // 2. Ensure user is enrolled in the course (using numeric IDs)
            const enrollments = await strapi.db.query('api::enrollment.enrollment').findMany({
                where: {
                    student: targetStudentId,
                    course: lessonEntity.course.id
                }
            });
            if (!enrollments || enrollments.length === 0) {
                return ctx.forbidden('You are not enrolled in this course');
            }
            // 3. Check for duplicate progress (using numeric IDs)
            const existingProgress = await strapi.db.query('api::lesson-progress.lesson-progress').findMany({
                where: {
                    student: targetStudentId,
                    lesson: lessonEntity.id
                }
            });
            if (existingProgress && existingProgress.length > 0) {
                return ctx.badRequest('You have already completed this lesson');
            }
            // 4. Create manually on DB layer
            const progress = await strapi.db.query('api::lesson-progress.lesson-progress').create({
                data: {
                    student: targetStudentId,
                    lesson: lessonEntity.id,
                    completed: true,
                    publishedAt: new Date()
                }
            });
            ctx.body = { data: progress };
            return;
        }
        catch (err) {
            console.error('Error marking lesson complete:', err);
            return ctx.badRequest('Failed to mark lesson complete: ' + ((err === null || err === void 0 ? void 0 : err.message) || 'Unknown error'));
        }
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
