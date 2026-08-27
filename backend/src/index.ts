import type { Core } from '@strapi/strapi';

export default {
  register() {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // Bootstrap Roles
    const rolesToCreate = ['Admin', 'Content Manager', 'Instructor', 'Student'];
    const roleService = strapi.plugin('users-permissions').service('role');
    const existingRoles = await strapi.db.query('plugin::users-permissions.role').findMany({});
    const existingRoleNames = existingRoles.map(r => r.name);

    for (const roleName of rolesToCreate) {
      if (!existingRoleNames.includes(roleName)) {
        await roleService.createRole({
          name: roleName,
          description: `Custom ${roleName} role for LMS`,
        });
        strapi.log.info(`Created role: ${roleName}`);
      }
    }

    // Run Demo Data Seed
    try {
      await seedDemoData(strapi);
    } catch (err) {
      strapi.log.error('Error seeding demo data:', err);
    }
  },
};

async function seedDemoData(strapi: Core.Strapi) {
  // Check if we already seeded by looking for demo users
  const existingDemoUser = await strapi.db.query('plugin::users-permissions.user').findOne({
    where: { email: 'instructor@demo.com' }
  });

  if (existingDemoUser) {
    strapi.log.info('Demo data already seeded. Skipping.');
    return;
  }

  strapi.log.info('Seeding demo data...');

  // Get Roles
  const roles = await strapi.db.query('plugin::users-permissions.role').findMany();
  const getRole = (name: string) => roles.find(r => r.name === name)?.id;

  // 1. Create Users
  const authService = strapi.plugin('users-permissions').service('auth');

  const createUser = async (username: string, email: string, roleName: string) => {
    const roleId = getRole(roleName);
    const password = await authService.hashPassword('Password123!');
    
    return strapi.entityService.create('plugin::users-permissions.user', {
      data: {
        username,
        email,
        password,
        role: roleId,
        confirmed: true,
        provider: 'local',
      } as any, // bypassing strict types for dynamic properties
    });
  };

  const adminUser = await createUser('AdminDemo', 'admin@demo.com', 'Admin');
  const contentManager = await createUser('ContentDemo', 'content@demo.com', 'Content Manager');
  const instructor = await createUser('InstructorDemo', 'instructor@demo.com', 'Instructor');
  const student = await createUser('StudentDemo', 'student@demo.com', 'Student');
  const student2 = await createUser('StudentDemo2', 'student2@demo.com', 'Student');

  // 2. Create Courses
  const course1 = await strapi.entityService.create('api::course.course', {
    data: {
      title: 'Modern Web Architecture: From Zero to Hero',
      description: 'Master the principles of scalable system design. In this comprehensive course, we dive deep into decoupled architectures, headless CMS integration, server-side rendering with Next.js, and how to orchestrate high-availability systems. Perfect for developers looking to transition into architectural roles.',
      difficulty: 'Advanced',
      instructor: instructor.id,
      publishedAt: new Date()
    } as any
  });

  const course2 = await strapi.entityService.create('api::course.course', {
    data: {
      title: 'UI/UX Design Essentials for Engineers',
      description: 'Bridge the gap between engineering and design. Learn the fundamentals of color theory, typography, spacing, and modern principles like glassmorphism and subtle micro-animations. Build interfaces that wow your users without relying heavily on bloated frameworks.',
      difficulty: 'Beginner',
      instructor: instructor.id,
      publishedAt: new Date()
    } as any
  });

  // 3. Create Lessons for Course 1
  const c1l1 = await strapi.entityService.create('api::lesson.lesson', {
    data: {
      title: 'The Fall of Monoliths',
      order: 1,
      content: 'For decades, monolithic architecture was the default. All components (UI, business logic, database layer) were tightly coupled into a single deployable artifact.\n\nWhile this made early development fast, it caused massive scaling issues. In this lesson, we explore the tipping point where monoliths become unmaintainable and how to identify when it is time to break them apart into microservices or decoupled head/backend models.',
      course: course1.id,
      publishedAt: new Date()
    } as any
  });

  const c1l2 = await strapi.entityService.create('api::lesson.lesson', {
    data: {
      title: 'Embracing Headless CMS',
      order: 2,
      content: 'A Headless CMS provides the backend functionality (content creation, storage, and API delivery) without dictating how the content is presented. This allows developers to use any frontend technology they prefer, such as React, Vue, or even a mobile app.\n\nBy decoupling the frontend from the backend, teams can iterate faster, improve security, and scale seamlessly across multiple platforms.',
      course: course1.id,
      publishedAt: new Date()
    } as any
  });

  // 4. Create Lessons for Course 2
  const c2l1 = await strapi.entityService.create('api::lesson.lesson', {
    data: {
      title: 'Mastering Typography',
      order: 1,
      content: 'Typography is 90% of web design. The choice of typeface, line height, letter spacing, and contrast dictates the user\'s reading experience.\n\nKey Principles:\n- Never use pure black (#000) for text. Use #1f2937 or #374151 to reduce eye strain.\n- Establish a clear hierarchy using font weights (e.g., bold for headers, normal for body).\n- Keep line length between 60-80 characters for optimal readability.',
      course: course2.id,
      publishedAt: new Date()
    } as any
  });

  // 5. Create Quiz for Course 1
  const quiz1 = await strapi.entityService.create('api::quiz.quiz', {
    data: {
      title: 'Architecture Fundamentals Assessment',
      course: course1.id,
      publishedAt: new Date()
    } as any
  });

  await strapi.entityService.create('api::question.question', {
    data: {
      text: 'What is the primary advantage of a Headless CMS?',
      options: [
        'It automatically generates the frontend UI',
        'It decouples content management from content presentation',
        'It requires no database to function',
        'It only supports static websites'
      ],
      correctAnswer: 'It decouples content management from content presentation',
      quiz: quiz1.id,
      publishedAt: new Date()
    } as any
  });

  await strapi.entityService.create('api::question.question', {
    data: {
      text: 'Which of the following is a common issue with monolithic architectures at scale?',
      options: [
        'Deployment takes a very short time',
        'A bug in one module can crash the entire system',
        'They are completely stateless',
        'They force you to use JavaScript'
      ],
      correctAnswer: 'A bug in one module can crash the entire system',
      quiz: quiz1.id,
      publishedAt: new Date()
    } as any
  });

  // 6. Create Enrollments and Progress for Student 1
  await strapi.entityService.create('api::enrollment.enrollment', {
    data: {
      student: student.id,
      course: course1.id,
      publishedAt: new Date()
    } as any
  });

  await strapi.entityService.create('api::lesson-progress.lesson-progress', {
    data: {
      student: student.id,
      lesson: c1l1.id,
      completed: true,
      publishedAt: new Date()
    } as any
  });

  // 7. Create Blog Posts
  await strapi.entityService.create('api::blog-post.blog-post', {
    data: {
      title: 'Why Next.js is the Ultimate Full-Stack React Framework in 2026',
      body: 'React has evolved significantly over the years, and Next.js has been at the forefront of this evolution. With features like React Server Components, powerful caching, and simplified edge deployments, Next.js bridges the gap between static sites and fully dynamic applications.\n\nIn this article, we explore why Next.js remains the industry standard for production-grade React applications, diving deep into its App Router paradigm and performance optimization techniques.',
      status: 'Published',
      author: contentManager.id,
      publishedAt: new Date()
    } as any
  });

  await strapi.entityService.create('api::blog-post.blog-post', {
    data: {
      title: 'The Psychology of Colors in E-Learning Interfaces',
      body: 'Color is more than just aesthetics; it is a psychological tool. When designing an LMS, the choice of color can directly impact a student\'s cognitive load, retention, and motivation.\n\nFor example, blue often evokes trust and calmness, making it ideal for the core UI, while green signals success and progression, perfect for completion badges and "Mark Complete" buttons.\n\nAvoid overusing bright reds, which can trigger anxiety associated with failure or errors.',
      status: 'Published',
      author: adminUser.id,
      publishedAt: new Date()
    } as any
  });

  strapi.log.info('Successfully seeded demo data!');
}
