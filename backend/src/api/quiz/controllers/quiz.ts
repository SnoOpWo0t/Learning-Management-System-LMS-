import { factories } from '@strapi/strapi';

async function getUserRole(strapi: any, user: any) {
  if (user.role?.name) return user.role.name;
  if (user.roleType) return user.roleType;
  if (user.id) {
    const fullUser = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { id: user.id },
      populate: ['role']
    });
    return fullUser?.role?.name || fullUser?.roleType || 'Student';
  }
  return 'Student';
}

export default factories.createCoreController('api::quiz.quiz', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const roleName = await getUserRole(strapi, user);

    if (roleName !== 'Admin' && roleName !== 'Content Manager' && roleName !== 'Instructor') {
      return ctx.forbidden('You do not have permission to create quizzes');
    }

    const { course } = ctx.request.body.data || {};
    if (!course) {
      return ctx.badRequest('A course must be provided when creating a quiz');
    }

    if (roleName === 'Instructor') {
      let courseEntity: any;
      if (typeof course === 'string' && isNaN(Number(course))) {
        courseEntity = await strapi.db.query('api::course.course').findOne({
          where: { documentId: course },
          populate: ['instructor']
        });
      } else {
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
    
    if (!user) return ctx.unauthorized();
    const roleName = await getUserRole(strapi, user);

    if (roleName === 'Instructor') {
      let quiz: any;
      if (typeof id === 'string' && isNaN(Number(id))) {
        quiz = await strapi.db.query('api::quiz.quiz').findOne({
          where: { documentId: id },
          populate: ['course', 'course.instructor']
        });
      } else {
        quiz = await strapi.db.query('api::quiz.quiz').findOne({
          where: { id: Number(id) },
          populate: ['course', 'course.instructor']
        });
      }

      if (!quiz || !quiz.course || !quiz.course.instructor || quiz.course.instructor.id !== user.id) {
        return ctx.forbidden('You can only update quizzes in your own courses');
      }
    } else if (roleName !== 'Admin' && roleName !== 'Content Manager') {
      return ctx.forbidden('You do not have permission to update quizzes');
    }

    return super.update(ctx);
  },

  async delete(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;
    
    if (!user) return ctx.unauthorized();
    const roleName = await getUserRole(strapi, user);

    if (roleName !== 'Admin' && roleName !== 'Content Manager' && roleName !== 'Instructor') {
      return ctx.forbidden('You do not have permission to delete quizzes');
    }

    try {
      let quiz: any;
      if (typeof id === 'string' && isNaN(Number(id))) {
        quiz = await strapi.db.query('api::quiz.quiz').findOne({
          where: { documentId: id },
          populate: ['course', 'course.instructor']
        });
      } else {
        quiz = await strapi.db.query('api::quiz.quiz').findOne({
          where: { id: Number(id) },
          populate: ['course', 'course.instructor']
        });
      }

      if (!quiz) return ctx.notFound('Quiz not found');

      if (roleName === 'Instructor') {
        if (!quiz.course || !quiz.course.instructor || quiz.course.instructor.id !== user.id) {
          return ctx.forbidden('You can only delete quizzes in your own courses');
        }
      }

      // Delete quiz results
      await strapi.db.query('api::quiz-result.quiz-result').deleteMany({
        where: { quiz: quiz.id }
      });

      // Delete questions
      await strapi.db.query('api::question.question').deleteMany({
        where: { quiz: quiz.id }
      });

      // Delete quiz
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
    } catch (err: any) {
      console.error('Failed to delete quiz:', err);
      return ctx.badRequest('Failed to delete quiz: ' + (err?.message || 'Unknown error'));
    }
  },

  async submit(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;
    
    if (!user) return ctx.unauthorized();

    const { answers } = ctx.request.body;
    if (!answers || typeof answers !== 'object') {
      return ctx.badRequest('Answers must be provided as an object mapping question IDs to selected options.');
    }

    try {
      // Fetch quiz with questions using db query
      let quiz: any;
      if (typeof id === 'string' && isNaN(Number(id))) {
        quiz = await strapi.db.query('api::quiz.quiz').findOne({
          where: { documentId: id },
          populate: ['questions']
        });
      } else {
        quiz = await strapi.db.query('api::quiz.quiz').findOne({
          where: { id: Number(id) },
          populate: ['questions']
        });
      }

      if (!quiz) return ctx.notFound('Quiz not found');

      const questions = quiz.questions || [];
      if (questions.length === 0) {
        return ctx.badRequest('This quiz has no questions.');
      }

      // Calculate score
      let correctCount = 0;
      const totalQuestions = questions.length;

      for (const question of questions) {
        // Accept either numeric id or documentId from frontend
        const studentAnswer = answers[question.documentId] || answers[question.id] || answers[String(question.id)];
        if (studentAnswer && studentAnswer === question.correctAnswer) {
          correctCount++;
        }
      }

      const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

      // Save result using db.query with numeric IDs
      await strapi.db.query('api::quiz-result.quiz-result').create({
        data: {
          student: user.id,
          quiz: quiz.id,
          score,
          totalQuestions,
          publishedAt: new Date(),
        }
      });

      return { 
        data: {
          score, 
          totalQuestions,
          correctCount,
          message: 'Quiz submitted successfully!'
        }
      };
    } catch (err: any) {
      console.error('Quiz submit error:', err);
      return ctx.badRequest('Failed to submit quiz: ' + (err?.message || 'Unknown error'));
    }
  }
}));
