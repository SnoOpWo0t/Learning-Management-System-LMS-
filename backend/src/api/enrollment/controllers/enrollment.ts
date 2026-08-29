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
    const targetStudentId = user.id;

    // Resolve course to numeric ID
    let targetCourseId = course;
    if (typeof course === 'string') {
      const courseObj = await strapi.db.query('api::course.course').findOne({ where: { documentId: course } });
      if (!courseObj) return ctx.badRequest('Could not resolve course ID');
      targetCourseId = courseObj.id;
    }

    // Check for duplicate enrollment using numeric IDs on the DB layer
    let existingEnrollments = [];
    try {
      existingEnrollments = await strapi.db.query('api::enrollment.enrollment').findMany({
        where: {
          course: targetCourseId,
          student: targetStudentId
        }
      });
    } catch (e) {
      console.error('Error checking duplicate enrollment:', e);
    }

    if (existingEnrollments && existingEnrollments.length > 0) {
      return ctx.badRequest('User is already enrolled in this course');
    }

    try {
      // Create manually on DB layer with numeric IDs
      const enrollment = await strapi.db.query('api::enrollment.enrollment').create({
        data: {
          student: targetStudentId,
          course: targetCourseId,
          publishedAt: new Date()
        },
        populate: ['course']
      });
      
      // Standard response format (wrap in data object)
      ctx.body = { data: enrollment };
      return;
    } catch (createErr) {
      console.error('Error creating enrollment:', createErr);
      return ctx.badRequest('Enrollment creation failed: ' + createErr.message);
    }
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
