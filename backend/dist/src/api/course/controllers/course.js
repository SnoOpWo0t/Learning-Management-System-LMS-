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
exports.default = strapi_1.factories.createCoreController('api::course.course', ({ strapi }) => ({
    async create(ctx) {
        const user = ctx.state.user;
        if (!user) {
            return ctx.unauthorized('You must be logged in to create a course');
        }
        const roleName = await getUserRole(strapi, user);
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
            if (!ctx.request.body.data)
                ctx.request.body.data = {};
            if (!ctx.request.body.data.instructor) {
                ctx.request.body.data.instructor = user.id;
            }
        }
        return super.create(ctx);
    },
    async find(ctx) {
        const user = ctx.state.user;
        if (user) {
            const roleName = await getUserRole(strapi, user);
            if (roleName === 'Instructor') {
                const filters = ctx.query.filters || {};
                ctx.query.filters = { ...filters, instructor: { id: user.id } };
            }
        }
        return super.find(ctx);
    },
    async update(ctx) {
        const user = ctx.state.user;
        const { id } = ctx.params;
        if (!user)
            return ctx.unauthorized();
        const roleName = await getUserRole(strapi, user);
        if (roleName === 'Instructor') {
            let course;
            if (typeof id === 'string' && isNaN(Number(id))) {
                course = await strapi.db.query('api::course.course').findOne({
                    where: { documentId: id },
                    populate: ['instructor']
                });
            }
            else {
                course = await strapi.db.query('api::course.course').findOne({
                    where: { id: Number(id) },
                    populate: ['instructor']
                });
            }
            if (!course)
                return ctx.notFound('Course not found');
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
        const user = ctx.state.user;
        const { id } = ctx.params;
        if (!user)
            return ctx.unauthorized();
        const roleName = await getUserRole(strapi, user);
        if (roleName !== 'Admin' && roleName !== 'Content Manager' && roleName !== 'Instructor') {
            return ctx.forbidden('You do not have permission to delete courses');
        }
        try {
            // Find course by documentId or numeric id
            let course;
            if (typeof id === 'string' && isNaN(Number(id))) {
                course = await strapi.db.query('api::course.course').findOne({
                    where: { documentId: id },
                    populate: ['instructor']
                });
            }
            else {
                course = await strapi.db.query('api::course.course').findOne({
                    where: { id: Number(id) },
                    populate: ['instructor']
                });
            }
            if (!course)
                return ctx.notFound('Course not found');
            if (roleName === 'Instructor') {
                if (!course.instructor || course.instructor.id !== user.id) {
                    return ctx.forbidden('You can only delete your own courses');
                }
            }
            // Cascading deletion of related entities to prevent foreign key errors
            // 1. Delete Enrollments
            await strapi.db.query('api::enrollment.enrollment').deleteMany({
                where: { course: course.id }
            });
            // 2. Delete Course Ratings
            await strapi.db.query('api::course-rating.course-rating').deleteMany({
                where: { course: course.id }
            });
            // 3. Find and delete Quizzes & Questions & Quiz Results
            const quizzes = await strapi.db.query('api::quiz.quiz').findMany({
                where: { course: course.id }
            });
            for (const quiz of quizzes) {
                await strapi.db.query('api::quiz-result.quiz-result').deleteMany({
                    where: { quiz: quiz.id }
                });
                await strapi.db.query('api::question.question').deleteMany({
                    where: { quiz: quiz.id }
                });
                await strapi.db.query('api::quiz.quiz').delete({
                    where: { id: quiz.id }
                });
            }
            // 4. Find and delete Lessons & Lesson Progresses
            const lessons = await strapi.db.query('api::lesson.lesson').findMany({
                where: { course: course.id }
            });
            for (const lesson of lessons) {
                await strapi.db.query('api::lesson-progress.lesson-progress').deleteMany({
                    where: { lesson: lesson.id }
                });
                await strapi.db.query('api::lesson.lesson').delete({
                    where: { id: lesson.id }
                });
            }
            // 5. Delete the course itself
            await strapi.db.query('api::course.course').delete({
                where: { id: course.id }
            });
            return {
                data: {
                    id: course.id,
                    documentId: course.documentId,
                    message: 'Course and all associated content deleted successfully'
                }
            };
        }
        catch (err) {
            console.error('Failed to delete course:', err);
            return ctx.badRequest('Failed to delete course: ' + ((err === null || err === void 0 ? void 0 : err.message) || 'Unknown error'));
        }
    }
}));
