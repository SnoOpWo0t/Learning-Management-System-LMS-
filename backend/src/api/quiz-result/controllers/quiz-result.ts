import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::quiz-result.quiz-result', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const { quiz, answers } = ctx.request.body.data || {};
    
    if (!quiz) return ctx.badRequest('Quiz ID is required');
    if (!answers || typeof answers !== 'object') return ctx.badRequest('Answers object is required');

    // Normalize user documentId
    let targetStudentDocId = user.documentId;
    if (!targetStudentDocId) {
      const userObj = await strapi.db.query('plugin::users-permissions.user').findOne({ where: { id: user.id } });
      if (!userObj || !userObj.documentId) return ctx.badRequest('Could not resolve user documentId');
      targetStudentDocId = userObj.documentId;
    }

    try {
      // Fetch quiz with its questions using documents API to safely handle documentId
      const quizzes = await strapi.documents('api::quiz.quiz').findMany({
        filters: { documentId: quiz },
        populate: ['questions', 'course']
      });

      if (!quizzes || quizzes.length === 0) return ctx.notFound('Quiz not found');
      const quizEntity = quizzes[0];

      // Make sure user is enrolled in the course this quiz belongs to
      if (quizEntity.course) {
        const enrollments = await strapi.documents('api::enrollment.enrollment').findMany({
          filters: { student: { documentId: targetStudentDocId }, course: { documentId: quizEntity.course.documentId } }
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
        // Find what the user submitted for this question (by documentId)
        const submittedAnswer = answers[question.documentId];
        if (submittedAnswer && submittedAnswer === question.correctAnswer) {
          correctAnswers++;
        }
      }

      const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

      // Check if a result already exists to prevent duplicate entries if desired, but we'll just create a new one
      const result = await strapi.documents('api::quiz-result.quiz-result').create({
        data: {
          student: targetStudentDocId,
          quiz: quizEntity.documentId,
          score: score,
          totalQuestions: totalQuestions,
          publishedAt: new Date()
        }
      });
      
      // Attach detailed scoring for the frontend to show immediately (in a custom structure since we aren't using super.create)
      return {
        data: {
          ...result,
          score,
          totalQuestions,
          correctAnswers // Custom prop for immediate feedback
        }
      };
      
    } catch (err) {
      console.error('Error submitting quiz:', err);
      return ctx.badRequest('Failed to submit quiz: ' + err.message);
    }
  },
  
  async find(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const roleName = user.role?.name;
    
    const filters = (ctx.query.filters as any) || {};
    
    if (roleName === 'Student') {
      ctx.query.filters = { ...filters, student: { documentId: user.documentId } };
    } else if (roleName === 'Instructor') {
      ctx.query.filters = { ...filters, quiz: { course: { instructor: { documentId: user.documentId } } } };
    }

    return super.find(ctx);
  }
}));
