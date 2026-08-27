"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    register() { },
    async bootstrap({ strapi }) {
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
        // Grant Public Permissions
        try {
            await grantPublicPermissions(strapi);
        }
        catch (err) {
            strapi.log.error('Error granting public permissions:', err);
        }
        // Run Demo Data Seed
        try {
            await seedDemoData(strapi);
        }
        catch (err) {
            strapi.log.error('Error seeding demo data:', err);
        }
    },
};
async function grantPublicPermissions(strapi) {
    const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({ where: { name: 'Public' } });
    if (!publicRole) {
        strapi.log.warn('Public role not found! Permissions not granted.');
        return;
    }
    const permissionsToGrant = [
        'api::course.course.find',
        'api::course.course.findOne',
        'api::lesson.lesson.find',
        'api::lesson.lesson.findOne',
        'plugin::users-permissions.user.find',
        'api::blog-post.blog-post.find',
        'api::blog-post.blog-post.findOne',
    ];
    for (const action of permissionsToGrant) {
        const existing = await strapi.db.query('plugin::users-permissions.permission').findOne({
            where: { action, role: publicRole.id }
        });
        if (!existing) {
            await strapi.db.query('plugin::users-permissions.permission').create({
                data: { action, role: publicRole.id }
            });
            strapi.log.info(`Granted public permission: ${action}`);
        }
    }
}
async function seedDemoData(strapi) {
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
    const getRole = (name) => { var _a; return (_a = roles.find(r => r.name === name)) === null || _a === void 0 ? void 0 : _a.id; };
    // 1. Create Users
    const authService = strapi.plugin('users-permissions').service('auth');
    const createUser = async (username, email, roleName) => {
        const roleId = getRole(roleName);
        return strapi.entityService.create('plugin::users-permissions.user', {
            data: {
                username,
                email,
                password: 'Password123!',
                role: roleId,
                confirmed: true,
                provider: 'local',
            }, // bypassing strict types for dynamic properties
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
        }
    });
    const course2 = await strapi.entityService.create('api::course.course', {
        data: {
            title: 'UI/UX Design Essentials for Engineers',
            description: 'Bridge the gap between engineering and design. Learn the fundamentals of color theory, typography, spacing, and modern principles like glassmorphism and subtle micro-animations. Build interfaces that wow your users without relying heavily on bloated frameworks.',
            difficulty: 'Beginner',
            instructor: instructor.id,
            publishedAt: new Date()
        }
    });
    const course3 = await strapi.entityService.create('api::course.course', {
        data: {
            title: 'Advanced React Patterns in 2026',
            description: 'Go beyond the basics of React. Dive into Server Components, fine-grained reactivity, suspense boundaries, and custom hooks for complex state management. This course is designed for mid-level developers aiming to become seniors.',
            difficulty: 'Advanced',
            instructor: instructor.id,
            publishedAt: new Date()
        }
    });
    const course4 = await strapi.entityService.create('api::course.course', {
        data: {
            title: 'PostgreSQL Mastery for Web Developers',
            description: 'Stop treating your database like a dumb data store. Learn advanced indexing, window functions, complex joins, and how to write efficient raw SQL to dramatically speed up your application performance.',
            difficulty: 'Intermediate',
            instructor: instructor.id,
            publishedAt: new Date()
        }
    });
    const course5 = await strapi.entityService.create('api::course.course', {
        data: {
            title: 'The Art of Refactoring Legacy Code',
            description: 'Learn how to safely modify large, untested codebases. We will cover testing strategies, identifying code smells, the strangler fig pattern, and how to incrementally upgrade systems without halting product development.',
            difficulty: 'Advanced',
            instructor: instructor.id,
            publishedAt: new Date()
        }
    });
    const course6 = await strapi.entityService.create('api::course.course', {
        data: {
            title: 'Figma for Developers: Building Design Systems',
            description: 'Learn how to translate Figma designs into robust, reusable code components. We will explore design tokens, atomic design principles, and how to sync design updates directly into your CI/CD pipeline.',
            difficulty: 'Beginner',
            instructor: instructor.id,
            publishedAt: new Date()
        }
    });
    const course7 = await strapi.entityService.create('api::course.course', {
        data: {
            title: 'Machine Learning Fundamentals in JavaScript',
            description: 'You don\'t need Python to get started with AI. Learn how to train models, run inference in the browser, and implement neural networks completely in JavaScript using TensorFlow.js.',
            difficulty: 'Intermediate',
            instructor: instructor.id,
            publishedAt: new Date()
        }
    });
    // 3. Create Lessons for Course 1
    const c1l1 = await strapi.entityService.create('api::lesson.lesson', {
        data: {
            title: 'The Fall of Monoliths',
            order: 1,
            content: 'For decades, monolithic architecture was the default. All components (UI, business logic, database layer) were tightly coupled into a single deployable artifact.\n\nWhile this made early development fast, it caused massive scaling issues. In this lesson, we explore the tipping point where monoliths become unmaintainable and how to identify when it is time to break them apart into microservices or decoupled head/backend models.',
            course: course1.id,
            publishedAt: new Date()
        }
    });
    const c1l2 = await strapi.entityService.create('api::lesson.lesson', {
        data: {
            title: 'Embracing Headless CMS',
            order: 2,
            content: 'A Headless CMS provides the backend functionality (content creation, storage, and API delivery) without dictating how the content is presented. This allows developers to use any frontend technology they prefer, such as React, Vue, or even a mobile app.\n\nBy decoupling the frontend from the backend, teams can iterate faster, improve security, and scale seamlessly across multiple platforms.',
            course: course1.id,
            publishedAt: new Date()
        }
    });
    // 4. Create Lessons for Course 2
    const c2l1 = await strapi.entityService.create('api::lesson.lesson', {
        data: {
            title: 'Mastering Typography',
            order: 1,
            content: 'Typography is 90% of web design. The choice of typeface, line height, letter spacing, and contrast dictates the user\'s reading experience.\n\nKey Principles:\n- Never use pure black (#000) for text. Use #1f2937 or #374151 to reduce eye strain.\n- Establish a clear hierarchy using font weights (e.g., bold for headers, normal for body).\n- Keep line length between 60-80 characters for optimal readability.',
            course: course2.id,
            publishedAt: new Date()
        }
    });
    // 5. Create Quiz for Course 1
    const quiz1 = await strapi.entityService.create('api::quiz.quiz', {
        data: {
            title: 'Architecture Fundamentals Assessment',
            course: course1.id,
            publishedAt: new Date()
        }
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
        }
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
        }
    });
    // 6. Create Enrollments and Progress for Student 1
    await strapi.entityService.create('api::enrollment.enrollment', {
        data: {
            student: student.id,
            course: course1.id,
            publishedAt: new Date()
        }
    });
    await strapi.entityService.create('api::lesson-progress.lesson-progress', {
        data: {
            student: student.id,
            lesson: c1l1.id,
            completed: true,
            publishedAt: new Date()
        }
    });
    // 7. Create Blog Posts
    await strapi.entityService.create('api::blog-post.blog-post', {
        data: {
            title: 'Why Next.js is the Ultimate Full-Stack React Framework in 2026',
            body: 'React has evolved significantly over the years, and Next.js has been at the forefront of this evolution. With features like React Server Components, powerful caching, and simplified edge deployments, Next.js bridges the gap between static sites and fully dynamic applications.\n\nIn this article, we explore why Next.js remains the industry standard for production-grade React applications, diving deep into its App Router paradigm and performance optimization techniques.',
            status: 'Published',
            author: contentManager.id,
            publishedAt: new Date()
        }
    });
    await strapi.entityService.create('api::blog-post.blog-post', {
        data: {
            title: 'The Psychology of Colors in E-Learning Interfaces',
            body: 'Color is more than just aesthetics; it is a psychological tool. When designing an LMS, the choice of color can directly impact a student\'s cognitive load, retention, and motivation.\n\nFor example, blue often evokes trust and calmness, making it ideal for the core UI, while green signals success and progression, perfect for completion badges and "Mark Complete" buttons.\n\nAvoid overusing bright reds, which can trigger anxiety associated with failure or errors.',
            status: 'Published',
            author: adminUser.id,
            publishedAt: new Date()
        }
    });
    await strapi.entityService.create('api::blog-post.blog-post', {
        data: {
            title: 'State Management Showdown: Redux vs. Zustand vs. Context',
            body: 'State management in React is a constantly evolving ecosystem. While Redux dominated for years, developers are increasingly moving towards simpler, more atomic solutions.\n\nIn this technical deep dive, we compare Redux Toolkit, Zustand, and React Context across metrics like bundle size, rendering performance, and developer experience. Learn when to reach for a heavy-duty library and when built-in tools are sufficient.',
            status: 'Published',
            author: contentManager.id,
            publishedAt: new Date()
        }
    });
    await strapi.entityService.create('api::blog-post.blog-post', {
        data: {
            title: 'The Future of AI in Software Engineering',
            body: 'The integration of AI into the developer workflow is no longer a gimmick—it is a necessity for maintaining competitive velocity.\n\nHowever, this shift requires a new set of skills. Instead of purely focusing on syntax, modern developers must master prompt engineering, system design, and rigorous code review of AI-generated implementations.',
            status: 'Published',
            author: adminUser.id,
            publishedAt: new Date()
        }
    });
    await strapi.entityService.create('api::blog-post.blog-post', {
        data: {
            title: 'A Guide to Accessible Web Typography',
            body: 'Accessibility shouldn\'t be an afterthought. When designing typography for the web, it is critical to ensure your content is legible for everyone, including users with visual impairments.\n\nKey practices include maintaining a minimum contrast ratio of 4.5:1 for normal text, avoiding ultra-thin font weights, and respecting user preferences for larger text sizes via relative units (rem/em).',
            status: 'Published',
            author: adminUser.id,
            publishedAt: new Date()
        }
    });
    await strapi.entityService.create('api::blog-post.blog-post', {
        data: {
            title: 'Why We Dropped Tailwind CSS for Native Modules',
            body: 'Tailwind CSS is incredibly popular, but it isn\'t the right choice for every team. After a year of using Tailwind in production, we decided to migrate back to native CSS Modules.\n\nOur primary reasons included cleaner markup, better separation of concerns, and leveraging modern CSS features like native nesting and container queries that make utility classes feel redundant.',
            status: 'Published',
            author: contentManager.id,
            publishedAt: new Date()
        }
    });
    strapi.log.info('Successfully seeded demo data!');
}
