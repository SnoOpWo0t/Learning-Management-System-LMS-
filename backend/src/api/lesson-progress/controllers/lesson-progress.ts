import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::lesson-progress.lesson-progress', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const { lesson, student } = ctx.request.body.data || {};
    
    if (!lesson) {
      return ctx.badRequest('Lesson is required');
    }

    // Force student to use either ID or documentId safely
    const targetStudentId = user.id;
    const targetStudentDocId = user.documentId;

    try {
      // 1. Fetch the lesson to ensure it exists and get its course using documents API
      // Assume 'lesson' from frontend is a documentId because that's what the frontend uses
      const lessons = await strapi.documents('api::lesson.lesson').findMany({
        filters: { documentId: lesson },
        populate: ['course']
      });
      
      if (!lessons || lessons.length === 0) {
        return ctx.badRequest('Invalid lesson');
      }
      
      const lessonEntity = lessons[0];
      if (!lessonEntity.course) {
        return ctx.badRequest('Lesson has no associated course');
      }

      // 2. Ensure user is enrolled in the course
      const enrollments = await strapi.documents('api::enrollment.enrollment').findMany({
        filters: {
          student: { documentId: targetStudentDocId || targetStudentId },
          course: { documentId: lessonEntity.course.documentId }
        }
      });

      if (!enrollments || enrollments.length === 0) {
        return ctx.forbidden('You are not enrolled in this course');
      }

      // 3. Check for duplicate progress
      const existingProgress = await strapi.documents('api::lesson-progress.lesson-progress').findMany({
        filters: {
          student: { documentId: targetStudentDocId || targetStudentId },
          lesson: { documentId: lessonEntity.documentId }
        }
      });

      if (existingProgress && existingProgress.length > 0) {
        return ctx.badRequest('You have already completed this lesson');
      }

      // 4. Create manually to bypass any super.create relation payload bugs in v5
      const progress = await strapi.documents('api::lesson-progress.lesson-progress').create({
        data: {
          student: targetStudentDocId || targetStudentId,
          lesson: lessonEntity.documentId,
          completed: true,
          publishedAt: new Date()
        }
      });

      ctx.body = { data: progress };
      return;
    } catch (err) {
      console.error('Error marking lesson complete:', err);
      return ctx.badRequest('Failed to mark lesson complete: ' + err.message);
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
      ctx.query.filters = { ...filters, lesson: { course: { instructor: { documentId: user.documentId } } } };
    }

    return super.find(ctx);
  }
}));
