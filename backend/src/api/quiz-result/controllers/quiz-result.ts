import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::quiz-result.quiz-result', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const { quiz, answers } = ctx.request.body.data || {};
    
    if (!quiz) return ctx.badRequest('Quiz ID is required');
    if (!answers || typeof answers !== 'object') return ctx.badRequest('Answers object is required');

    const targetStudentId = user.id;

    try {
      // Fetch quiz with its questions using DB API to get numeric IDs
      let quizEntity;
      if (typeof quiz === 'string') {
        quizEntity = await strapi.db.query('api::quiz.quiz').findOne({
          where: { documentId: quiz },
          populate: ['questions', 'course']
        });
      } else {
        quizEntity = await strapi.db.query('api::quiz.quiz').findOne({
          where: { id: quiz },
          populate: ['questions', 'course']
        });
      }

      if (!quizEntity) return ctx.notFound('Quiz not found');

      // Make sure user is enrolled in the course this quiz belongs to (using numeric IDs)
      if (quizEntity.course) {
        const enrollments = await strapi.db.query('api::enrollment.enrollment').findMany({
          where: { student: targetStudentId, course: quizEntity.course.id }
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
      const result = await strapi.db.query('api::quiz-result.quiz-result').create({
        data: {
          student: targetStudentId,
          quiz: quizEntity.id,
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
