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
    let targetStudent = student;
    // In Strapi v5 ctx.state.user doesn't auto-populate role, so we just enforce student to be current user if not provided or to be safe
    // If you need admin override, you should check ctx.state.user.role if it is populated
    targetStudent = user.documentId || user.id;

    // Check for duplicate enrollment
    const existingEnrollments = await strapi.documents('api::enrollment.enrollment').findMany({
      filters: {
        course: { documentId: course },
        student: { documentId: targetStudent }
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

    if (!roleName) {
      // Fallback if role is not populated
      ctx.query.filters = { ...filters, student: { documentId: user.documentId } };
    } else if (roleName === 'Student') {
      ctx.query.filters = { ...filters, student: { documentId: user.documentId } };
    } else if (roleName === 'Instructor') {
      ctx.query.filters = { ...filters, course: { instructor: { documentId: user.documentId } } };
    }

    return super.find(ctx);
  }
}));
