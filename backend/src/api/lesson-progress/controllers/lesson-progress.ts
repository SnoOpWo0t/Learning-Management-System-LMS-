import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::lesson-progress.lesson-progress', ({ strapi }) => ({
  // ============================================================================
  // 🎬 [VIDEO DEMO - STEP 6: PROGRESS TRACKING LOGIC (EXPLAIN THIS IN VIDEO)]
  // Handles real-time lesson completion persistence per student per course.
  // ============================================================================
  async create(ctx) {
    // 1. Check User Authentication
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const { lesson } = ctx.request.body.data || {};
    if (!lesson) {
      return ctx.badRequest('Lesson is required');
    }

    const targetStudentId = user.id;

    try {
      // 2. Fetch the lesson and its parent course from PostgreSQL database
      let lessonEntity;
      if (typeof lesson === 'string') {
        lessonEntity = await strapi.db.query('api::lesson.lesson').findOne({ 
          where: { documentId: lesson },
          populate: ['course'] 
        });
      } else {
        lessonEntity = await strapi.db.query('api::lesson.lesson').findOne({ 
          where: { id: lesson },
          populate: ['course'] 
        });
      }
      
      if (!lessonEntity) {
        return ctx.badRequest('Invalid lesson');
      }
      
      if (!lessonEntity.course) {
        return ctx.badRequest('Lesson has no associated course');
      }

      // 3. Ensure student is actively enrolled in the course before recording progress
      const enrollments = await strapi.db.query('api::enrollment.enrollment').findMany({
        where: {
          student: targetStudentId,
          course: lessonEntity.course.id
        }
      });

      if (!enrollments || enrollments.length === 0) {
        return ctx.forbidden('You are not enrolled in this course');
      }

      // 4. Prevent duplicate completion records for the same lesson
      const existingProgress = await strapi.db.query('api::lesson-progress.lesson-progress').findMany({
        where: {
          student: targetStudentId,
          lesson: lessonEntity.id
        }
      });

      if (existingProgress && existingProgress.length > 0) {
        return ctx.badRequest('You have already completed this lesson');
      }

      // 5. Persist completed progress record in database (survives page refresh)
      const progress = await strapi.db.query('api::lesson-progress.lesson-progress').create({
        data: {
          student: targetStudentId,
          lesson: lessonEntity.id,
          completed: true,
          publishedAt: new Date()
        }
      });

      ctx.body = { data: progress };
      return;
    } catch (err: any) {
      console.error('Error marking lesson complete:', err);
      return ctx.badRequest('Failed to mark lesson complete: ' + (err?.message || 'Unknown error'));
    }
  },

  // ============================================================================
  // 🎬 [VIDEO DEMO - STEP 5: DATA ISOLATION FILTER (STUDENT vs INSTRUCTOR)]
  // Ensures students only see their own progress, and instructors see their cohort.
  // ============================================================================
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
