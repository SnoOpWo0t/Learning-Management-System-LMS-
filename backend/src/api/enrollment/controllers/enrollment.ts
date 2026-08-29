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
    let targetStudentDocId = user.documentId;
    if (!targetStudentDocId) {
      const userObj = await strapi.db.query('plugin::users-permissions.user').findOne({ where: { id: user.id } });
      if (!userObj || !userObj.documentId) return ctx.badRequest('Could not resolve user documentId');
      targetStudentDocId = userObj.documentId;
    }

    let targetCourseDocId = course;
    if (typeof course === 'number') {
      const courseObj = await strapi.db.query('api::course.course').findOne({ where: { id: course } });
      if (!courseObj || !courseObj.documentId) return ctx.badRequest('Could not resolve course documentId');
      targetCourseDocId = courseObj.documentId;
    }

    // Check for duplicate enrollment using the relations
    let existingEnrollments = [];
    try {
      existingEnrollments = await strapi.documents('api::enrollment.enrollment').findMany({
        filters: {
          course: { documentId: targetCourseDocId },
          student: { documentId: targetStudentDocId }
        }
      });
    } catch (e) {
      console.error('Error checking duplicate enrollment:', e);
    }

    if (existingEnrollments && existingEnrollments.length > 0) {
      return ctx.badRequest('User is already enrolled in this course');
    }

    try {
      // Create manually to ensure relation binding works in Strapi 5 using purely documentIds
      const enrollment = await strapi.documents('api::enrollment.enrollment').create({
        data: {
          student: targetStudentDocId,
          course: targetCourseDocId,
          publishedAt: new Date()
        },
        populate: ['course']
      });
      
      // Standard response format
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
