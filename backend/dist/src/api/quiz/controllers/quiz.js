"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
exports.default = strapi_1.factories.createCoreController('api::quiz.quiz', ({ strapi }) => ({
    async create(ctx) {
        var _a;
        const user = ctx.state.user;
        if (!user)
            return ctx.unauthorized();
        const roleName = (_a = user.role) === null || _a === void 0 ? void 0 : _a.name;
        if (roleName !== 'Admin' && roleName !== 'Content Manager' && roleName !== 'Instructor') {
            return ctx.forbidden('You do not have permission to create quizzes');
        }
        const { course } = ctx.request.body.data || {};
        if (!course) {
            return ctx.badRequest('A course must be provided when creating a quiz');
        }
        if (roleName === 'Instructor') {
            const courseEntity = await strapi.entityService.findOne('api::course.course', course, { populate: ['instructor'] });
            if (!courseEntity || !courseEntity.instructor || courseEntity.instructor.id !== user.id) {
                return ctx.forbidden('You can only add quizzes to your own courses');
            }
        }
        return super.create(ctx);
    },
    async update(ctx) {
        var _a;
        const user = ctx.state.user;
        const { id } = ctx.params;
        if (!user)
            return ctx.unauthorized();
        const roleName = (_a = user.role) === null || _a === void 0 ? void 0 : _a.name;
        if (roleName === 'Instructor') {
            const quiz = await strapi.entityService.findOne('api::quiz.quiz', id, { populate: ['course', 'course.instructor'] });
            if (!quiz || !quiz.course || !quiz.course.instructor || quiz.course.instructor.id !== user.id) {
                return ctx.forbidden('You can only update quizzes in your own courses');
            }
        }
        else if (roleName !== 'Admin' && roleName !== 'Content Manager') {
            return ctx.forbidden('You do not have permission to update quizzes');
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
            const quiz = await strapi.entityService.findOne('api::quiz.quiz', id, { populate: ['course', 'course.instructor'] });
            if (!quiz || !quiz.course || !quiz.course.instructor || quiz.course.instructor.id !== user.id) {
                return ctx.forbidden('You can only delete quizzes in your own courses');
            }
        }
        else if (roleName !== 'Admin' && roleName !== 'Content Manager') {
            return ctx.forbidden('You do not have permission to delete quizzes');
        }
        return super.delete(ctx);
    },
    async submit(ctx) {
        var _a;
        const user = ctx.state.user;
        const { id } = ctx.params;
        if (!user)
            return ctx.unauthorized();
        if (((_a = user.role) === null || _a === void 0 ? void 0 : _a.name) !== 'Student') {
            return ctx.forbidden('Only students can submit quizzes');
        }
        const { answers } = ctx.request.body;
        if (!answers || typeof answers !== 'object') {
            return ctx.badRequest('Answers must be provided as an object mapping question IDs to selected options.');
        }
        // Fetch quiz with questions
        const quiz = await strapi.entityService.findOne('api::quiz.quiz', id, { populate: ['questions'] });
        if (!quiz)
            return ctx.notFound('Quiz not found');
        if (!quiz.questions || quiz.questions.length === 0) {
            return ctx.badRequest('This quiz has no questions.');
        }
        // Calculate score
        let score = 0;
        const totalQuestions = quiz.questions.length;
        for (const question of quiz.questions) {
            // Question IDs from entityService are numbers
            const studentAnswer = answers[question.id] || answers[String(question.id)];
            if (studentAnswer && studentAnswer === question.correctAnswer) {
                score++;
            }
        }
        // Save result
        const quizResult = await strapi.entityService.create('api::quiz-result.quiz-result', {
            data: {
                student: user.id,
                quiz: id,
                score,
                totalQuestions,
                publishedAt: new Date(),
            }
        });
        return {
            data: {
                score,
                totalQuestions,
                message: 'Quiz submitted successfully!'
            }
        };
    }
}));
