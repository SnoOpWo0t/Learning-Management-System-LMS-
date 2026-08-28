import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::enrollment.enrollment', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const { course, student } = ctx.request.body.data || {};
    
    if (!course) {
      return ctx.badRequest('Course is required');
    }

    // Force student to be the current user if they are not an Admin/Content Manager
    const roleName = user.role?.name;
    let targetStudent = student;
    if (roleName !== 'Admin' && roleName !== 'Content Manager') {
      targetStudent = user.id;
    } else if (!targetStudent) {
      targetStudent = user.id;
    }

    // Check for duplicate enrollment
    const existingEnrollments = await strapi.entityService.findMany('api::enrollment.enrollment', {
      filters: {
        course: course,
        student: targetStudent
      }
    });

    if (existingEnrollments && existingEnrollments.length > 0) {
      return ctx.badRequest('User is already enrolled in this course');
    }

    // Override the body data securely
    ctx.request.body.data.student = targetStudent;
    ctx.request.body.data.course = course;

    return super.create(ctx);
  },

  async find(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const roleName = user.role?.name;

    const filters = (ctx.query.filters as any) || {};

    if (roleName === 'Student') {
      ctx.query.filters = { ...filters, student: { documentId: user.documentId } };
    } else if (roleName === 'Instructor') {
      ctx.query.filters = { ...filters, course: { instructor: { documentId: user.documentId } } };
    }

    return super.find(ctx);
  }
}));
