import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::course.course', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be logged in to create a course');
    }

    const roleName = user.role?.name;

    if (roleName !== 'Admin' && roleName !== 'Content Manager' && roleName !== 'Instructor') {
      return ctx.forbidden('You do not have permission to create courses');
    }

    // Force the instructor to be the current user if they are an Instructor
    if (roleName === 'Instructor') {
      if (!ctx.request.body.data) ctx.request.body.data = {};
      ctx.request.body.data.instructor = user.id;
    } else {
      // Content Manager and Admin can set the instructor manually, or default to themselves if omitted
      if (!ctx.request.body.data) ctx.request.body.data = {};
      if (!ctx.request.body.data.instructor) {
        ctx.request.body.data.instructor = user.id;
      }
    }

    // Call the default create logic
    const response = await super.create(ctx);
    return response;
  },

  async update(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;
    
    if (!user) return ctx.unauthorized();
    const roleName = user.role?.name;

    if (roleName === 'Instructor') {
      // Ensure the instructor owns the course
      const course: any = await strapi.entityService.findOne('api::course.course', id, { populate: ['instructor'] });
      if (!course) return ctx.notFound();
      if (!course.instructor || course.instructor.id !== user.id) {
        return ctx.forbidden('You can only update your own courses');
      }
    } else if (roleName !== 'Admin' && roleName !== 'Content Manager') {
      return ctx.forbidden('You do not have permission to update courses');
    }

    return super.update(ctx);
  },

  async delete(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;
    
    if (!user) return ctx.unauthorized();
    const roleName = user.role?.name;

    if (roleName === 'Instructor') {
      const course: any = await strapi.entityService.findOne('api::course.course', id, { populate: ['instructor'] });
      if (!course) return ctx.notFound();
      if (!course.instructor || course.instructor.id !== user.id) {
        return ctx.forbidden('You can only delete your own courses');
      }
    } else if (roleName !== 'Admin' && roleName !== 'Content Manager') {
      return ctx.forbidden('You do not have permission to delete courses');
    }

    return super.delete(ctx);
  }
}));
