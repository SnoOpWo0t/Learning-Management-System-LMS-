import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::quiz.quiz', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const roleName = user.role?.name;

    if (roleName !== 'Admin' && roleName !== 'Content Manager' && roleName !== 'Instructor') {
      return ctx.forbidden('You do not have permission to create quizzes');
    }

    const { course } = ctx.request.body.data || {};
    if (!course) {
      return ctx.badRequest('A course must be provided when creating a quiz');
    }

    if (roleName === 'Instructor') {
      const courseEntity: any = await strapi.entityService.findOne('api::course.course', course, { populate: ['instructor'] });
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
    const roleName = user.role?.name;

    if (roleName === 'Instructor') {
      const quiz: any = await strapi.entityService.findOne('api::quiz.quiz', id, { populate: ['course', 'course.instructor'] });
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
    const roleName = user.role?.name;

    if (roleName === 'Instructor') {
      const quiz: any = await strapi.entityService.findOne('api::quiz.quiz', id, { populate: ['course', 'course.instructor'] });
      if (!quiz || !quiz.course || !quiz.course.instructor || quiz.course.instructor.id !== user.id) {
        return ctx.forbidden('You can only delete quizzes in your own courses');
      }
    } else if (roleName !== 'Admin' && roleName !== 'Content Manager') {
      return ctx.forbidden('You do not have permission to delete quizzes');
    }

    return super.delete(ctx);
  }
}));
