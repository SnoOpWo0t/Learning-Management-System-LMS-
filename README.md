# LMS-Project: A Next-Generation Learning Management System

A comprehensive, production-ready learning platform built for scale. Features a robust four-role architecture: course and lesson management, student enrollment with progress tracking, an auto-graded MCQ quiz engine, rich per-role analytics dashboards, an integrated blog system with draft/publish workflows, and a powerful administrative backend.

| Layer | Technology | Hosting |
|---|---|---|
| Frontend | Next.js 15 (App Router) | Vercel |
| Backend / CMS | Strapi 5 (TypeScript) | Railway |
| Database | SQLite locally, PostgreSQL in production | Railway |

```
LMS-project/
  backend/     Strapi 5 - API, data model, RBAC, business logic
  frontend/    Next.js 15 - Public site, auth, role-aware dashboards
```

**Live Deployments:**

| | |
|---|---|
| Frontend | [https://learning-management-system-lms-git-main-snoopwo0ts-projects.vercel.app](https://learning-management-system-lms-git-main-snoopwo0ts-projects.vercel.app) |
| Strapi CMS | [https://lms-project-production-19cf.up.railway.app/admin](https://lms-project-production-19cf.up.railway.app/admin) |

---

## 🔑 Demo Accounts

The backend includes a bootstrap script that automatically seeds the database on first run. You can use the following demo accounts to test all platform features natively. The password is the same for all accounts: `Password123!`.

Sign in at the live site's `/login` route.

| Role | Email | Password | Dashboard Experience |
|---|---|---|---|
| **Admin** | `admin@demo.com` | `Password123!` | Complete system overview, platform analytics, and user management. |
| **Content Manager** | `content@demo.com` | `Password123!` | Blog writing analytics, draft/publish workflow, and engagement stats. |
| **Instructor** | `instructor@demo.com` | `Password123!` | Instructor cohort analytics, course performance, and quiz grading insights. |
| **Student** | `student@demo.com` | `Password123!` | Course browsing, native enrollment, lesson tracking, and quiz taking. |
| **Student (100%)** | `student2@demo.com` | `Password123!` | Enrolled in advanced courses with perfect 100% quiz scores and progress. |
| **Student (50%)** | `student3@demo.com` | `Password123!` | Part-way through a course with a 50% quiz score. |

### What each account is for

- **Admin (`admin@demo.com`)**: 
  The highest authority. View platform-wide statistics, manage users, and moderate the entire blog and course catalog.
- **Content Manager (`content@demo.com`)**: 
  Owns the blog and can manage all platform content. Experience the bespoke Writing Dashboard tracking publishing velocity.
- **Instructor (`instructor@demo.com`)**: 
  Strictly enforced ownership model. Instructors can securely create and manage **only** their own courses, lessons, and quizzes. Attempting to view another instructor's course returns a 404 natively.
- **Students (`student*@demo.com`)**: 
  The core learning experience. Access the dynamic "Continue Learning" feeds, track visual progress rings, and take auto-graded quizzes where sensitive answers are never exposed to the client.

---

## 🚀 Running Locally

### 1. Backend (Strapi)

Requires Node.js 18+ and npm.

```bash
cd backend
npm install
npm run dev
```

Strapi boots up on **http://localhost:1337**. 
The database is SQLite (`backend/.tmp/data.db`), created and seeded automatically. Delete that file to start from scratch. Open `/admin` to register the initial SuperAdmin account for CMS access.

### 2. Frontend (Next.js)

The backend must be running first, as Next.js Server Components call it during render.

```bash
cd frontend
npm install
npm run dev
```

The frontend boots up on **http://localhost:3000**. 
Log in with any of the demo accounts above, and the platform will automatically route you to your role-specific dashboard.

---

## 🔒 Architecture & Security

### How Authentication Works

The browser **never** holds the Strapi JWT natively in JavaScript variables, protecting against XSS attacks.

1. The login form posts to `/api/auth/login`, a Next.js API route handler.
2. That handler securely exchanges credentials with Strapi and writes the returned JWT into a hardened **httpOnly** cookie.
3. Next.js Server Components securely read this cookie and communicate directly with Strapi's API on behalf of the user. 
4. Client components utilize a secure Context Provider that only exposes safe user metadata (ID, role, name), never the token.

### Route Protection

Three layers of defense, deliberately engineered:

| Layer | Implementation | What it decides |
|---|---|---|
| **Middleware** | `middleware.ts` | Edge-level checks: Does a session cookie exist? Unauthenticated visitors are routed to `/login`. |
| **Page Guards** | `ProtectedRoute` | Does this user's specific role allow them to render this dashboard? (Wrong role redirects to `/dashboard`). |
| **API** | Strapi Controllers | The absolute boundary. Re-checked on every database interaction, ensuring data ownership and authorization. |

---

## 🎨 Design System

Built meticulously fulfilling constraints against using utility-first frameworks like Tailwind CSS, this platform leverages **Vanilla CSS** (`globals.css` and CSS Modules) to achieve a modern, portfolio-ready aesthetic.

- **Theme**: Dark-first, premium interface tailored to reduce cognitive load.
- **Aesthetics**: Glassmorphism (blur backdrops), deep slate backgrounds, and vivid blue interactive accents.
- **Micro-animations**: Custom CSS keyframes (`animate-slide-up`, `animate-fade-in`, `.hover-lift`) applied systematically to dashboards, grids, and cards to create a dynamic, living interface.
- **Typography**: Precision spacing and modern geometric sans-serif fonts to ensure readability during long learning sessions.

---

## 📊 Roles & Permissions Matrix

| Action | Admin | Content Manager | Instructor | Student |
|---|---|---|---|---|
| View platform statistics | ✅ | ❌ | ❌ | ❌ |
| Create / edit / delete courses | ✅ | ✅ | Own only | ❌ |
| Add / edit / delete lessons | ✅ | ✅ | Own courses | ❌ |
| Create quizzes | ✅ | ✅ | Own courses | ❌ |
| Write / manage blog posts | ✅ | ✅ | ❌ | ❌ |
| Enroll in a course | ❌ | ❌ | ❌ | ✅ |
| Take quizzes & view grades | ❌ | ❌ | ❌ | ✅ |
| Track persistent lesson progress | ❌ | ❌ | ❌ | ✅ |
| Edit their own profile | ✅ | ✅ | ✅ | ✅ |

*Note: Enforced on the backend via the `users-permissions` grid and custom core controllers.*

---

## ✨ Features Completed

**Backend Infrastructure** ✅
- [x] Complete REST API with custom core controllers enforcing business logic.
- [x] Role-Based Access Control (RBAC) securely sandboxing Instructors to their own content.
- [x] Auto-grading quiz engine evaluating answers entirely server-side.
- [x] Deep Strapi v5 integration utilizing `documentId` architecture for relational integrity.
- [x] Automated database seeding script deploying full catalog and user states.

**Next.js Frontend Foundation** ✅
- [x] App Router architecture maximizing Server-Side Rendering (SSR).
- [x] Custom CSS design system with glassmorphism and keyframe animations.
- [x] Secure `httpOnly` JWT authentication flow.
- [x] Protected routes and smart dashboard redirects based on parsed JWT roles.
- [x] Elegant empty states, loading skeletons, and immersive error handling.

**Student Experience** ✅
- [x] Immersive course catalog with visual difficulty indicators.
- [x] Dynamic "Continue Learning" widget tracking most recent course engagement.
- [x] Robust Lesson Player with persistent progress checking.
- [x] Interactive Quiz Interface with instant auto-graded score reveals.
- [x] Dedicated Notes system saving insights directly to local storage per course.

**Authoring & Admin Experience** ✅
- [x] Role-tailored overview dashboards displaying distinct analytics components based on authentication.
- [x] Instructor cohort analysis tracking student progression across owned courses.
- [x] Complete Blog publishing workflow supporting Draft and Published states.
- [x] Admin system-wide overview monitoring global platform health.
