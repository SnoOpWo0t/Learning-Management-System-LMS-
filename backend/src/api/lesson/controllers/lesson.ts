import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::lesson.lesson', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const roleName = user.role?.name;

    if (roleName !== 'Admin' && roleName !== 'Content Manager' && roleName !== 'Instructor') {
      return ctx.forbidden('You do not have permission to create lessons');
    }

    const { course } = ctx.request.body.data || {};
    if (!course) {
      return ctx.badRequest('A course must be provided when creating a lesson');
    }

    if (roleName === 'Instructor') {
      const courseEntity: any = await strapi.entityService.findOne('api::course.course', course, { populate: ['instructor'] });
      if (!courseEntity || !courseEntity.instructor || courseEntity.instructor.id !== user.id) {
        return ctx.forbidden('You can only add lessons to your own courses');
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
      const lesson: any = await strapi.entityService.findOne('api::lesson.lesson', id, { populate: ['course', 'course.instructor'] });
      if (!lesson || !lesson.course || !lesson.course.instructor || lesson.course.instructor.id !== user.id) {
        return ctx.forbidden('You can only update lessons in your own courses');
      }
    } else if (roleName !== 'Admin' && roleName !== 'Content Manager') {
      return ctx.forbidden('You do not have permission to update lessons');
    }

    return super.update(ctx);
  },

  async delete(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;
    
    if (!user) return ctx.unauthorized();
    const roleName = user.role?.name;

    if (roleName === 'Instructor') {
      const lesson: any = await strapi.entityService.findOne('api::lesson.lesson', id, { populate: ['course', 'course.instructor'] });
      if (!lesson || !lesson.course || !lesson.course.instructor || lesson.course.instructor.id !== user.id) {
        return ctx.forbidden('You can only delete lessons in your own courses');
      }
    } else if (roleName !== 'Admin' && roleName !== 'Content Manager') {
      return ctx.forbidden('You do not have permission to delete lessons');
    }

    return super.delete(ctx);
  }
}));
