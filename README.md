# 🎓 Next-Generation Learning Management System (LMS)

[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Strapi 5](https://img.shields.io/badge/Backend-Strapi%205-purple?style=flat&logo=strapi)](https://strapi.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Deployment](https://img.shields.io/badge/Deploy-Vercel%20%2B%20Railway-success?style=flat)](https://vercel.com/)

A modern, enterprise-grade, full-stack **Learning Management System (LMS)** built with **Next.js 16 (App Router)** and **Strapi 5 Headless CMS**. Engineered with robust Role-Based Access Control (RBAC), interactive video learning players, auto-graded MCQ assessment engines, editorial publishing workflows, and dynamic analytical dashboards for four distinct user roles.

---

## 🌐 Live Production Deployments

| Component | Platform | Live URL |
| :--- | :--- | :--- |
| **Frontend Web App** | Vercel | [https://learning-management-system-lms-five.vercel.app](https://learning-management-system-lms-five.vercel.app) |
| **Backend REST API** | Railway | [https://learning-management-system-lms-production.up.railway.app](https://learning-management-system-lms-production.up.railway.app) |
| **Strapi Admin Panel** | Railway | [https://learning-management-system-lms-production.up.railway.app/admin](https://learning-management-system-lms-production.up.railway.app/admin) |

---

## 🔑 Pre-Configured Demo Accounts

The database is automatically bootstrapped on first launch with courses, lessons, quizzes, articles, and sample users. You can immediately sign in at [`/login`](https://learning-management-system-lms-five.vercel.app/login) using any of the following accounts:

> **Universal Password for all Demo Accounts:** `Password123!`

| Role | Email | Password | Primary Focus & Dashboard Capabilities |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@demo.com` | `Password123!` | Global platform oversight, user role management, system-wide moderation, cascading database cleanup. |
| **Content Manager** | `content@demo.com` | `Password123!` | Editorial & Publishing Hub, article drafting/publishing, curriculum overview, content mix analytics. |
| **Instructor** | `instructor@demo.com` | `Password123!` | Sandboxed Course Studio, lesson & video manager, quiz builder, student cohort progress tracking. |
| **Student** | `student@demo.com` | `Password123!` | Course discovery, 1-click dynamic enrollment, video player, personal sticky notes, auto-graded quizzes. |
| **Student (100% Complete)** | `student2@demo.com` | `Password123!` | Perfect completion state across courses, 100% quiz scores, certificate-ready dashboard view. |
| **Student (50% In-Progress)** | `student3@demo.com` | `Password123!` | Active learning in progress with dynamic "Continue Learning" feed and partial quiz history. |

---

## 🏗️ Visual Architecture & System Diagrams

### 1. System & Technology Architecture

```mermaid
graph TD
    Client["Browser / Client (Desktop & Mobile)"]

    subgraph Vercel ["Vercel Edge Network (Frontend)"]
        NextApp["Next.js 16 App Router"]
        ThemeAuth["AuthContext (JWT Session) + ThemeProvider"]
        PageViews["Public Pages (/courses, /blog) + Protected Dashboards"]
        Player["Interactive Course Player & Quiz Client"]
    end

    subgraph Railway ["Railway Cloud Infrastructure (Backend)"]
        StrapiAPI["Strapi 5 Headless CMS (Node.js/TypeScript)"]
        AuthGuards["JWT Middleware & RBAC Permission Policies"]
        Controllers["Custom Controllers (getUserRole, Cascading Deletion, Submission Engine)"]
        AutoSeeder["Bootstrap Auto-Seeder Engine"]
    end

    subgraph DatabaseLayer ["Data Persistence Layer"]
        DB[(PostgreSQL in Production / SQLite in Local Dev)]
        Media[(Cloud Media / Uploads)]
    end

    Client <-->|HTTPS / SSL| NextApp
    NextApp --> ThemeAuth
    ThemeAuth --> PageViews
    PageViews --> Player
    NextApp <-->|REST API + Bearer JWT| StrapiAPI
    StrapiAPI --> AuthGuards
    AuthGuards --> Controllers
    Controllers <--> DB
    AutoSeeder -.->|Auto-seeds initial catalog| DB
    StrapiAPI <--> Media
```

---

### 2. Database Entity-Relationship (ER) Model

```mermaid
erDiagram
    USER ||--o{ ENROLLMENT : "enrolls in"
    USER ||--o{ LESSON_PROGRESS : "completes"
    USER ||--o{ QUIZ_RESULT : "submits"
    USER ||--o{ COURSE : "teaches (Instructor)"
    USER ||--o{ BLOG_POST : "authors"
    USER ||--o{ COURSE_RATING : "rates"
    ROLE ||--o{ USER : "classifies"

    COURSE ||--o{ LESSON : "contains"
    COURSE ||--o| QUIZ : "assesses via"
    COURSE ||--o{ ENROLLMENT : "enrolled by"
    COURSE ||--o{ COURSE_RATING : "reviewed in"

    LESSON ||--o{ LESSON_PROGRESS : "tracks progress"
    QUIZ ||--o{ QUESTION : "contains MCQ"
    QUIZ ||--o{ QUIZ_RESULT : "records score"

    USER {
        int id PK
        string username
        string email
        string roleType
    }

    COURSE {
        int id PK
        string documentId
        string title
        text description
        string difficulty
    }

    LESSON {
        int id PK
        string documentId
        string title
        string videoUrl
        text content
    }

    QUIZ {
        int id PK
        string documentId
        string title
    }

    QUESTION {
        int id PK
        string questionText
        json options
        string correctAnswer
    }

    ENROLLMENT {
        int id PK
        datetime enrolledAt
    }

    LESSON_PROGRESS {
        int id PK
        boolean completed
    }

    QUIZ_RESULT {
        int id PK
        int score
        int totalQuestions
    }

    BLOG_POST {
        int id PK
        string title
        text body
        string status
    }
```

---

### 3. Authentication & Authorization Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as User Browser
    participant Next as Next.js Frontend
    participant Strapi as Strapi Backend
    participant DB as PostgreSQL Database

    User->>Next: Submits login form (email, password)
    Next->>Strapi: POST /api/auth/local
    Strapi->>DB: Validates credentials & loads role
    DB-->>Strapi: User record + Role (Admin/Instructor/Content Manager/Student)
    Strapi-->>Next: Returns JWT + Safe User Metadata
    Next->>Next: Stores session in AuthContext & Secure Local Storage
    Next->>Next: Evaluates roleType & routes to custom dashboard

    Note over User,Next: Subsequent API Calls
    User->>Next: Navigates to Protected Route (/dashboard/manage-courses)
    Next->>Strapi: GET /api/courses with Header Authorization: Bearer JWT
    Strapi->>Strapi: getUserRole() verifies permissions
    Strapi->>DB: Queries only authorized records
    DB-->>Strapi: Returns data
    Strapi-->>Next: 200 OK JSON Response
    Next-->>User: Renders personalized dashboard
```

---

## 👥 Role Workflows: How Each Role Works

### 1. 🧑‍🎓 Student Workflow

Students are the learners on the platform. They discover courses, enroll in curriculum modules, stream video lessons, take notes, and take auto-graded quizzes to measure their mastery.

```mermaid
graph LR
    A[1. Browse Catalog] --> B[2. View Course Page]
    B --> C{Enrolled?}
    C -->|No| D[Click 'Enroll Now']
    C -->|Yes| E[Click 'Continue Learning']
    D --> F[1-Click Enrollment Created]
    F --> G[Open Course Player]
    E --> G
    G --> H[Watch Video Lessons]
    H --> I[Take Personal Notes]
    I --> J[Mark Lesson Complete]
    J --> K[Take Assessment Quiz]
    K --> L[Server-Side Auto-Grading]
    L --> M[Instant Score & Progress Updated]
```

* **Dynamic Course Page CTA**: Detects user state automatically:
  * Guest visitor: Shows **"Sign in to Enroll"** &rarr; `/login`.
  * Logged in, not enrolled: Shows **"Enroll Now (Free)"** &rarr; 1-click instant enrollment.
  * Already enrolled: Shows **"Continue Learning &rarr;"** &rarr; jumps directly into the course player.
* **Persistent Progress & Notes**: Lesson checkboxes update database completion flags instantly; notes are synced locally per course.
* **Secure Quiz Room**: Questions and options are displayed without revealing answers. When submitted, the backend calculates the percentage and returns the result safely.

---

### 2. 👨‍🏫 Instructor Workflow

Instructors are educators who own their courses. They create curriculum structures, attach instructional videos, author quiz assessments with MCQ questions, and track enrolled student progress.

```mermaid
graph LR
    A[1. Sign In as Instructor] --> B[2. Instructor Studio Dashboard]
    B --> C[View Assigned Courses & Students Count]
    B --> D[Create New Course]
    D --> E[Add Lessons & YouTube/MP4 URLs]
    E --> F[Create MCQ Assessment Quiz]
    F --> G[Add Questions, Choices & Correct Key]
    G --> H[Publish to Public Catalog]
    B --> I[Open Cohort Progress]
    I --> J[Monitor Student Progress & Quiz Scores]
```

* **Sandboxed Ownership Model**: Instructors can only view, edit, or delete courses they authored.
* **Curriculum Builder**: Manage lessons, rearrange topics, and embed video URLs directly.
* **Quiz Creator**: Define custom multi-choice questions and set the server-validated answer keys.
* **Cohort Analytics**: Review student rosters and inspect how learners perform across their courses.

---

### 3. ✍️ Content Manager Workflow

Content Managers are editorial and curriculum supervisors. They oversee the blog publishing workflow, ensure course quality standards, and monitor overall platform content distribution.

```mermaid
graph LR
    A[1. Sign In as Content Manager] --> B[2. Editorial & Publishing Hub]
    B --> C[Inspect Content Mix & Skill Level Charts]
    B --> D[Write New Blog Article]
    D --> E{Choose Status}
    E -->|Draft| F[Save Private Draft]
    E -->|Published| G[Publish Live to /blog]
    B --> H[Curriculum Oversight]
    H --> I[Audit All Courses, Lessons & Quizzes]
    B --> J[Edit or Delete Outdated Articles]
```

* **Editorial Dashboard**: Live counters for Total Courses, Lessons, Articles (Published vs. Drafts), and Quizzes.
* **Interactive Visual Analytics**: Content Mix Pie Chart and Course Skill-Level Bar Chart powered by Recharts.
* **Article Publishing Suite**: Full CRUD operations for blog posts with status toggle (`Draft` vs. `Published`).
* **Curriculum Moderation**: Full access to review and adjust any course in the platform.

---

### 4. 🛡️ Admin Workflow

Admins possess master governance over the entire platform. They monitor global system metrics, assign and change user roles, moderate all content, and perform cascading database operations safely.

```mermaid
graph LR
    A[1. Sign In as Admin] --> B[2. Master Admin Cockpit]
    B --> C[Global Users, Courses & Enrollment Metrics]
    B --> D[Role Distribution & Revenue Charts]
    B --> E[Manage Users & Reassign Roles]
    B --> F[Moderate Catalog & Blog Posts]
    F --> G[Execute Cascading Course Deletion]
    G --> H[Auto-Cleans Lessons, Quizzes, Questions & Enrollments]
```

* **Master Cockpit**: Real-time metrics across all registered users, total courses, and platform enrollments.
* **User & Role Governance**: Assign roles (`Student`, `Instructor`, `Content Manager`, `Admin`) dynamically.
* **Cascading Deletion Engine**: Deleting a course cleanly removes all associated lessons, quizzes, questions, quiz results, enrollments, and ratings in a single transaction with zero PostgreSQL constraint errors.

---

## 📊 Complete Roles & Capabilities Matrix

| Capability / Resource | Student | Instructor | Content Manager | Admin |
| :--- | :---: | :---: | :---: | :---: |
| **View Course Catalog & Read Published Blogs** | ✅ | ✅ | ✅ | ✅ |
| **Enroll in Courses (Dynamic CTA Button)** | ✅ | ❌ | ❌ | ❌ |
| **Stream Lessons & Toggle Completion** | ✅ | Preview | Preview | Preview |
| **Take Quizzes & Auto-Score Calculation** | ✅ | ❌ | ❌ | ❌ |
| **Personal Notes Saver (Per Course)** | ✅ | ❌ | ❌ | ❌ |
| **Create & Edit Courses** | ❌ | ✅ (Own Only) | ✅ (All) | ✅ (All) |
| **Add Lessons & Video Embeds** | ❌ | ✅ (Own Only) | ✅ (All) | ✅ (All) |
| **Create & Edit Quizzes with MCQ Questions** | ❌ | ✅ (Own Only) | ✅ (All) | ✅ (All) |
| **Track Enrolled Students & Cohort Grades** | ❌ | ✅ (Own Courses) | ✅ (All) | ✅ (All) |
| **Write, Edit & Publish Blog Posts** | ❌ | ❌ | ✅ | ✅ |
| **Access Editorial Hub & Content Mix Charts** | ❌ | ❌ | ✅ | ✅ |
| **Access Master System Analytics & Charts** | ❌ | ❌ | ❌ | ✅ |
| **Change User Roles & Manage Accounts** | ❌ | ❌ | ❌ | ✅ |
| **Cascading Database Course Deletion** | ❌ | ✅ (Own Only) | ✅ | ✅ |

---

## 📂 Repository Directory Breakdown

```
Learning-Management-System-LMS-/
├── backend/                             # Strapi 5 Headless CMS (Node.js / TypeScript)
│   ├── config/                          # Server, database, admin, and plugin configs
│   │   ├── database.ts                  # Dual SQLite (local) & PostgreSQL (production) driver
│   │   ├── middlewares.ts               # CORS, security headers, and body parser settings
│   │   └── plugins.ts                   # Users & Permissions plugin configuration
│   ├── src/
│   │   ├── api/                         # Content Type Modules & Business Logic
│   │   │   ├── blog-post/               # Blog articles with Draft/Published workflow & delete handler
│   │   │   ├── course/                  # Courses with instructor relations & cascading delete
│   │   │   ├── course-rating/           # Student star ratings & reviews
│   │   │   ├── custom-auth/             # Custom registration & role resolution endpoints
│   │   │   ├── enrollment/              # Student course enrollments
│   │   │   ├── lesson/                  # Video / Text lessons with progress links
│   │   │   ├── lesson-progress/         # Lesson completion tracking per student
│   │   │   ├── question/                # MCQ questions with server-side validation
│   │   │   ├── quiz/                    # Quizzes & auto-submission grading engine
│   │   │   └── quiz-result/             # Graded quiz submission history
│   │   └── index.ts                     # Database bootstrap & auto-seeding engine
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/                            # Next.js 16 Web Application (App Router)
    ├── src/
    │   ├── app/                         # App Router Pages & Layouts
    │   │   ├── layout.tsx               # Root layout with ThemeProvider & AuthProvider
    │   │   ├── page.tsx                 # Public homepage with course hero & catalog
    │   │   ├── (auth)/
    │   │   │   ├── login/page.tsx       # Authentication sign-in
    │   │   │   └── register/page.tsx    # Multi-role student / instructor registration
    │   │   ├── blog/                    # Public blog catalog and article details
    │   │   ├── courses/[id]/page.tsx    # Dynamic public course preview & smart CTA
    │   │   └── dashboard/               # Role-Aware Management Suite
    │   │       ├── page.tsx             # Dynamic Dashboard Role Router
    │   │       ├── AdminOverview.tsx    # Admin system health & user metrics
    │   │       ├── ContentManagerOverview.tsx # Editorial publishing metrics & content charts
    │   │       ├── InstructorOverview.tsx     # Instructor course studio & cohort metrics
    │   │       ├── courses/[id]/learn/  # Interactive video player & quiz room
    │   │       ├── manage-courses/      # Course curriculum & quiz editor
    │   │       ├── blogs/               # Article writer & editor (Draft/Publish)
    │   │       └── admin/users/         # User role assignment panel
    │   ├── components/                  # Reusable UI components
    │   │   ├── PublicNavbar.tsx         # Solid, theme-aware public navigation header
    │   │   ├── EnrollButton.tsx         # Smart dynamic enrollment & CTA button
    │   │   ├── ProtectedRoute.tsx       # Client-side RBAC route guard
    │   │   └── ThemeToggle.tsx          # Light/Dark mode switcher
    │   └── context/
    │       └── AuthContext.tsx          # User session, JWT persistence, and role context
    ├── package.json
    └── next.config.ts
```

---

## ⚡ Quick Start: Running Locally (Step-by-Step)

Follow these simple instructions to run both the backend and frontend on your local computer in under 5 minutes.

### 📋 Prerequisites

* **Node.js**: Version `18.x`, `20.x`, or `22.x` ([Download Node.js](https://nodejs.org/))
* **Git**: ([Download Git](https://git-scm.com/))
* **npm**: (Installed automatically with Node.js)

---

### Step 1: Clone the Repository

Open your terminal or command prompt and clone the project:

```bash
git clone https://github.com/SnoOpWo0t/Learning-Management-System-LMS-.git
cd Learning-Management-System-LMS-
```

---

### Step 2: Start the Backend (Strapi API)

1. Open your terminal and navigate to `backend/`:
   ```bash
   cd backend
   ```

2. Install all backend dependencies:
   ```bash
   npm install
   ```

3. Create your `.env` file in the `backend/` directory:
   ```env
   HOST=0.0.0.0
   PORT=1337
   APP_KEYS=wPD3TubNMyNkgSR8CWUTCw==,HVb+CNHa/C8hEDinOJZb0g==,vobo3gEuTmbvSy6mwUNbGA==,KcimxQZ62eR31WPtFzHOKg==
   API_TOKEN_SALT=8SSyvlvZJrPxwHETpOvm1w==
   ADMIN_JWT_SECRET=CGJHv/v4N8PW2p/uhmOP6A==
   JWT_SECRET=jaafbpS0XdVX+i5CXuj+yg==
   TRANSFER_TOKEN_SALT=dmS9RlHq9i+t4ZJoI9gOQQ==
   ENCRYPTION_KEY=OM9x2YfKwl9e1m4Hf6+Rag==

   # Local SQLite Database (Created automatically)
   DATABASE_CLIENT=sqlite
   DATABASE_FILENAME=.tmp/data.db
   ```

4. Start the backend development server:
   ```bash
   npm run dev
   ```

> 💡 **Automatic Database Initialization:**
> Strapi will create `backend/.tmp/data.db`, execute all migrations, auto-grant API permissions, seed demo courses, lessons, quizzes, and generate the demo accounts (`admin@demo.com`, etc.).
> * **API Endpoint**: `http://localhost:1337`
> * **CMS Admin Panel**: `http://localhost:1337/admin`

---

### Step 3: Start the Frontend (Next.js)

1. Open a **second terminal window** and navigate to `frontend/`:
   ```bash
   cd frontend
   ```

2. Install all frontend dependencies:
   ```bash
   npm install
   ```

3. Create your `.env.local` file in the `frontend/` directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:1337
   ```

4. Start the Next.js development server:
   ```bash
   npm run dev
   ```

5. Open your web browser and navigate to:
   ```
   http://localhost:3000
   ```

You are ready! Sign in using any demo account from the table above with password `Password123!`.

---

## 🚀 Production Deployment Manual

### 1. Backend on Railway (with PostgreSQL)

1. Create a project on [Railway](https://railway.com/) and add a **PostgreSQL** database service.
2. Link your GitHub repository and set the root directory to `/backend`.
3. In the Railway Service **Variables** tab, configure:
   ```env
   HOST=0.0.0.0
   PORT=1337
   NODE_ENV=production
   
   # Security Keys
   APP_KEYS=your_generated_app_keys
   API_TOKEN_SALT=your_api_token_salt
   ADMIN_JWT_SECRET=your_admin_jwt_secret
   JWT_SECRET=your_jwt_secret
   TRANSFER_TOKEN_SALT=your_transfer_token_salt
   ENCRYPTION_KEY=your_encryption_key
   
   # PostgreSQL Connection (Use Railway Variable References)
   DATABASE_CLIENT=postgres
   DATABASE_HOST=${{Postgres.PGHOST}}
   DATABASE_PORT=${{Postgres.PGPORT}}
   DATABASE_NAME=${{Postgres.PGDATABASE}}
   DATABASE_USERNAME=${{Postgres.PGUSER}}
   DATABASE_PASSWORD=${{Postgres.PGPASSWORD}}
   DATABASE_SSL=false
   ```
4. Set **Build Command**: `npm run build`
5. Set **Start Command**: `npm run start`

---

### 2. Frontend on Vercel

1. Import the repository into [Vercel](https://vercel.com/).
2. Set the **Root Directory** to `frontend`.
3. Under **Environment Variables**, provide your live Railway URL:
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend-railway-url.up.railway.app
   ```
4. Click **Deploy**. Vercel will build and distribute the Next.js App Router globally on its edge network.

---

## 🛡️ Key Architectural & Security Features

* **Server-Side MCQ Auto-Grading**: Answers are verified strictly within `backend/src/api/quiz/controllers/quiz.ts`. The client never receives correct keys in JSON payloads, eliminating cheating via DevTools.
* **Cascading Relational Deletion**: Course deletion triggers an automated cleanup of child lessons, progress trackers, quizzes, questions, submissions, enrollments, and reviews via direct database queries, ensuring PostgreSQL integrity without orphan records.
* **Dynamic Role Gatekeeping (`getUserRole`)**: Strapi v5 custom controller layer dynamically resolves user roles from the database to securely enforce permission policies across Admin, Content Manager, Instructor, and Student actions.
* **Responsive Smart CTA**: Public course previews inspect client authentication and enrollment state in real-time, displaying `Sign in to Enroll`, `Enroll Now (Free)`, or `Continue Learning →` accordingly.

---

## 📝 License

This project is open-source and released under the **MIT License**.
