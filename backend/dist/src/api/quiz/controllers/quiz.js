"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
// ============================================================================
// 🎬 [VIDEO DEMO - STEP 5: BACKEND RBAC ROLE RESOLUTION HELPER]
// Dynamically fetches the user's role from the PostgreSQL database
// ensuring role permissions are enforced server-side, not just in UI.
// ============================================================================
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
exports.default = strapi_1.factories.createCoreController('api::quiz.quiz', ({ strapi }) => ({
    // ============================================================================
    // 🎬 [VIDEO DEMO - STEP 5: RBAC CREATE QUIZ GUARD]
    // Only Admin, Content Manager, and Instructor can create quizzes.
    // Instructors are strictly sandboxed to their own courses.
    // ============================================================================
    async create(ctx) {
        const user = ctx.state.user;
        if (!user)
            return ctx.unauthorized();
        const roleName = await getUserRole(strapi, user);
        // 1. Role verification check
        if (roleName !== 'Admin' && roleName !== 'Content Manager' && roleName !== 'Instructor') {
            return ctx.forbidden('You do not have permission to create quizzes');
        }
        const { course } = ctx.request.body.data || {};
        if (!course) {
            return ctx.badRequest('A course must be provided when creating a quiz');
        }
        // 2. Instructor ownership verification check
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
                return ctx.forbidden('You can only add quizzes to your own courses');
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
            let quiz;
            if (typeof id === 'string' && isNaN(Number(id))) {
                quiz = await strapi.db.query('api::quiz.quiz').findOne({
                    where: { documentId: id },
                    populate: ['course', 'course.instructor']
                });
            }
            else {
                quiz = await strapi.db.query('api::quiz.quiz').findOne({
                    where: { id: Number(id) },
                    populate: ['course', 'course.instructor']
                });
            }
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
        const user = ctx.state.user;
        const { id } = ctx.params;
        if (!user)
            return ctx.unauthorized();
        const roleName = await getUserRole(strapi, user);
        if (roleName !== 'Admin' && roleName !== 'Content Manager' && roleName !== 'Instructor') {
            return ctx.forbidden('You do not have permission to delete quizzes');
        }
        try {
            let quiz;
            if (typeof id === 'string' && isNaN(Number(id))) {
                quiz = await strapi.db.query('api::quiz.quiz').findOne({
                    where: { documentId: id },
                    populate: ['course', 'course.instructor']
                });
            }
            else {
                quiz = await strapi.db.query('api::quiz.quiz').findOne({
                    where: { id: Number(id) },
                    populate: ['course', 'course.instructor']
                });
            }
            if (!quiz)
                return ctx.notFound('Quiz not found');
            if (roleName === 'Instructor') {
                if (!quiz.course || !quiz.course.instructor || quiz.course.instructor.id !== user.id) {
                    return ctx.forbidden('You can only delete quizzes in your own courses');
                }
            }
            // Cascading delete quiz results before removing quiz entity
            await strapi.db.query('api::quiz-result.quiz-result').deleteMany({
                where: { quiz: quiz.id }
            });
            await strapi.db.query('api::question.question').deleteMany({
                where: { quiz: quiz.id }
            });
            await strapi.db.query('api::quiz.quiz').delete({
                where: { id: quiz.id }
            });
            return {
                data: {
                    id: quiz.id,
                    documentId: quiz.documentId,
                    message: 'Quiz deleted successfully'
                }
            };
        }
        catch (err) {
            console.error('Failed to delete quiz:', err);
            return ctx.badRequest('Failed to delete quiz: ' + ((err === null || err === void 0 ? void 0 : err.message) || 'Unknown error'));
        }
    },
    // ============================================================================
    // 🎬 [VIDEO DEMO - STEP 6: QUIZ AUTO-GRADING LOGIC (EXPLAIN THIS IN VIDEO)]
    // Demonstrates server-side grading where correct answers are NEVER sent to the client!
    // ============================================================================
    async submit(ctx) {
        // 1. Authenticate user from Bearer JWT
        const user = ctx.state.user;
        const { id } = ctx.params;
        if (!user)
            return ctx.unauthorized();
        // 2. Validate incoming answer payload
        const { answers } = ctx.request.body;
        if (!answers || typeof answers !== 'object') {
            return ctx.badRequest('Answers must be provided as an object mapping question IDs to selected options.');
        }
        try {
            // 3. Fetch Quiz and associated Questions directly from PostgreSQL database
            let quiz;
            if (typeof id === 'string' && isNaN(Number(id))) {
                quiz = await strapi.db.query('api::quiz.quiz').findOne({
                    where: { documentId: id },
                    populate: ['questions']
                });
            }
            else {
                quiz = await strapi.db.query('api::quiz.quiz').findOne({
                    where: { id: Number(id) },
                    populate: ['questions']
                });
            }
            if (!quiz)
                return ctx.notFound('Quiz not found');
            const questions = quiz.questions || [];
            if (questions.length === 0) {
                return ctx.badRequest('This quiz has no questions.');
            }
            // 4. Calculate score on backend: compare student answer vs hidden question.correctAnswer
            let correctCount = 0;
            const totalQuestions = questions.length;
            for (const question of questions) {
                const studentAnswer = answers[question.documentId] || answers[question.id] || answers[String(question.id)];
                if (studentAnswer && studentAnswer === question.correctAnswer) {
                    correctCount++;
                }
            }
            // 5. Compute percentage: (correctCount / totalQuestions) * 100
            const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
            // 6. Persist Quiz Result permanently in PostgreSQL database
            await strapi.db.query('api::quiz-result.quiz-result').create({
                data: {
                    student: user.id,
                    quiz: quiz.id,
                    score,
                    totalQuestions,
                    publishedAt: new Date(),
                }
            });
            // 7. Return safe score payload back to Next.js frontend (trigger confetti animation)
            return {
                data: {
                    score,
                    totalQuestions,
                    correctCount,
                    message: 'Quiz submitted successfully!'
                }
            };
        }
        catch (err) {
            console.error('Quiz submit error:', err);
            return ctx.badRequest('Failed to submit quiz: ' + ((err === null || err === void 0 ? void 0 : err.message) || 'Unknown error'));
        }
    }
}));
