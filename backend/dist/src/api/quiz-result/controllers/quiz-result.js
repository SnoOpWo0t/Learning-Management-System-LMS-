"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
exports.default = strapi_1.factories.createCoreController('api::quiz-result.quiz-result', ({ strapi }) => ({
    async create(ctx) {
        const user = ctx.state.user;
        if (!user)
            return ctx.unauthorized();
        const { quiz, answers } = ctx.request.body.data || {};
        if (!quiz)
            return ctx.badRequest('Quiz ID is required');
        if (!answers || typeof answers !== 'object')
            return ctx.badRequest('Answers object is required');
        // Fetch quiz with its questions
        const quizEntity = await strapi.entityService.findOne('api::quiz.quiz', quiz, {
            populate: ['questions', 'course']
        });
        if (!quizEntity)
            return ctx.notFound('Quiz not found');
        // Make sure user is enrolled in the course this quiz belongs to
        if (quizEntity.course) {
            const enrollments = await strapi.entityService.findMany('api::enrollment.enrollment', {
                filters: { student: user.id, course: quizEntity.course.id }
            });
            if (!enrollments || enrollments.length === 0) {
                return ctx.forbidden('You are not enrolled in this course');
            }
        }
        // Calculate Score
        const questions = quizEntity.questions || [];
        let correctAnswers = 0;
        const totalQuestions = questions.length;
        for (const question of questions) {
            // Find what the user submitted for this question
            const submittedAnswer = answers[question.documentId];
            if (submittedAnswer && submittedAnswer === question.correctAnswer) {
                correctAnswers++;
            }
        }
        const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
        // Check if a result already exists, if so update it or just create a new one. The requirements 
        // say "Student's quiz result is stored and viewable later". We can store multiple attempts or just one.
        // Let's just create a new one.
        ctx.request.body.data = {
            student: user.id,
            quiz: quiz,
            score: score,
            totalQuestions: totalQuestions
        };
        const response = await super.create(ctx);
        // Attach detailed scoring for the frontend to show immediately
        response.data.attributes.correctAnswers = correctAnswers;
        return response;
    },
    async find(ctx) {
        var _a;
        // Only return the current student's results unless Admin/Instructor
        const user = ctx.state.user;
        if (!user)
            return ctx.unauthorized();
        const roleName = (_a = user.role) === null || _a === void 0 ? void 0 : _a.name;
        if (roleName === 'Student') {
            ctx.query.filters = {
                ...ctx.query.filters,
                student: user.id
            };
        }
        // Instructors should technically only see results for their courses, but for simplicity
        // we let admins see all. Let's just use Strapi's default behavior for others.
        return super.find(ctx);
    }
}));
