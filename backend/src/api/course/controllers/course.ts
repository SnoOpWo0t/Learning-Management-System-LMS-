import { factories } from '@strapi/strapi';

// ============================================================================
// 🎬 [VIDEO DEMO - STEP 5: ROLE-BASED ACCESS CONTROL (RBAC) CONTROLLER]
// Demonstrates how permissions and ownership are strictly enforced on backend.
// ============================================================================
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

export default factories.createCoreController('api::course.course', ({ strapi }) => ({
  // 1. RBAC Guard on Course Creation
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be logged in to create a course');
    }

    const roleName = await getUserRole(strapi, user);

    // Reject Students from creating courses
    if (roleName !== 'Admin' && roleName !== 'Content Manager' && roleName !== 'Instructor') {
      return ctx.forbidden('You do not have permission to create courses');
    }

    // Force instructor relation to current authenticated user
    if (roleName === 'Instructor') {
      if (!ctx.request.body.data) ctx.request.body.data = {};
      ctx.request.body.data.instructor = user.id;
    } else {
      if (!ctx.request.body.data) ctx.request.body.data = {};
      if (!ctx.request.body.data.instructor) {
        ctx.request.body.data.instructor = user.id;
      }
    }

    return super.create(ctx);
  },

  // 2. Data Isolation on Course Listing (Instructors only see their own courses in studio)
  async find(ctx) {
    const user = ctx.state.user;
    if (user) {
      const roleName = await getUserRole(strapi, user);
      if (roleName === 'Instructor') {
        const filters = (ctx.query.filters as any) || {};
        ctx.query.filters = { ...filters, instructor: { id: user.id } };
      }
    }

    return super.find(ctx);
  },

  // 3. Ownership Verification on Course Updates
  async update(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;
    
    if (!user) return ctx.unauthorized();
    const roleName = await getUserRole(strapi, user);

    if (roleName === 'Instructor') {
      let course: any;
      if (typeof id === 'string' && isNaN(Number(id))) {
        course = await strapi.db.query('api::course.course').findOne({
          where: { documentId: id },
          populate: ['instructor']
        });
      } else {
        course = await strapi.db.query('api::course.course').findOne({
          where: { id: Number(id) },
          populate: ['instructor']
        });
      }

      if (!course) return ctx.notFound('Course not found');
      if (!course.instructor || course.instructor.id !== user.id) {
        return ctx.forbidden('You can only update your own courses');
      }
    } else if (roleName !== 'Admin' && roleName !== 'Content Manager') {
      return ctx.forbidden('You do not have permission to update courses');
    }

    return super.update(ctx);
  },

  // ============================================================================
  // 🎬 [VIDEO DEMO - STEP 4: CASCADING DATABASE COURSE DELETION]
  // Cleans all related child entities (Enrollments, Ratings, Quizzes, Questions,
  // Quiz Results, Lessons, Progress) before deleting parent Course.
  // ============================================================================
  async delete(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;
    
    if (!user) return ctx.unauthorized();
    const roleName = await getUserRole(strapi, user);

    if (roleName !== 'Admin' && roleName !== 'Content Manager' && roleName !== 'Instructor') {
      return ctx.forbidden('You do not have permission to delete courses');
    }

    try {
      let course: any;
      if (typeof id === 'string' && isNaN(Number(id))) {
        course = await strapi.db.query('api::course.course').findOne({
          where: { documentId: id },
          populate: ['instructor']
        });
      } else {
        course = await strapi.db.query('api::course.course').findOne({
          where: { id: Number(id) },
          populate: ['instructor']
        });
      }

      if (!course) return ctx.notFound('Course not found');

      if (roleName === 'Instructor') {
        if (!course.instructor || course.instructor.id !== user.id) {
          return ctx.forbidden('You can only delete your own courses');
        }
      }

      // Step 1: Cascading delete Enrollments
      await strapi.db.query('api::enrollment.enrollment').deleteMany({
        where: { course: course.id }
      });

      // Step 2: Cascading delete Course Ratings
      await strapi.db.query('api::course-rating.course-rating').deleteMany({
        where: { course: course.id }
      });

      // Step 3: Cascading delete Quizzes, Questions & Quiz Results
      const quizzes = await strapi.db.query('api::quiz.quiz').findMany({
        where: { course: course.id }
      });

      for (const quiz of quizzes) {
        await strapi.db.query('api::quiz-result.quiz-result').deleteMany({
          where: { quiz: quiz.id }
        });
        await strapi.db.query('api::question.question').deleteMany({
          where: { quiz: quiz.id }
        });
        await strapi.db.query('api::quiz.quiz').delete({
          where: { id: quiz.id }
        });
      }

      // Step 4: Cascading delete Lessons & Lesson Progress
      const lessons = await strapi.db.query('api::lesson.lesson').findMany({
        where: { course: course.id }
      });

      for (const lesson of lessons) {
        await strapi.db.query('api::lesson-progress.lesson-progress').deleteMany({
          where: { lesson: lesson.id }
        });
        await strapi.db.query('api::lesson.lesson').delete({
          where: { id: lesson.id }
        });
      }

      // Step 5: Delete parent course entity cleanly
      await strapi.db.query('api::course.course').delete({
        where: { id: course.id }
      });

      return {
        data: {
          id: course.id,
          documentId: course.documentId,
          message: 'Course and all associated content deleted successfully'
        }
      };
    } catch (err: any) {
      console.error('Failed to delete course:', err);
      return ctx.badRequest('Failed to delete course: ' + (err?.message || 'Unknown error'));
    }
  }
}));
