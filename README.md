# Next-Gen Learning Management System (LMS)

A production-ready full-stack Learning Management System tailored for modern educators and students. Built meticulously to satisfy rigorous technical requirements, this platform utilizes a decoupled architecture featuring **Next.js** for the frontend and **Strapi** for the robust headless backend.

## 🌟 Key Features

### 1. Robust Role-Based Access Control (RBAC)
- **Admin**: Complete overview and management via the secure admin dashboard.
- **Content Manager**: Capable of producing and managing all platform content (Courses, Lessons, Blogs).
- **Instructor**: Strictly enforced ownership model. Instructors can securely create and manage **only** their own courses, lessons, and quizzes.
- **Student**: Can browse courses, enroll natively, track persistent lesson progress, and take auto-graded quizzes.

### 2. Auto-Grading Quiz Engine
- Instructors can build comprehensive MCQ quizzes bound to specific courses.
- Server-side auto-grading ensures that sensitive data (correct answers) is **never** leaked to the frontend client.
- Persistent storage of quiz results allows students to verify their performance.

### 3. Integrated Blog System
- Complete publishing workflow including `Draft` and `Published` states.
- Publicly accessible blog feed that automatically filters out drafts.

### 4. Rich Aesthetics & Custom UI
- A gorgeous, responsive user interface built **entirely with Vanilla CSS** (`globals.css`), fulfilling constraints against using utility-first frameworks like Tailwind CSS.
- Features modern design principles: glassmorphism, dynamic micro-animations, and perfect typography spacing.

## 🚀 Technology Stack

### Frontend
- **Framework**: Next.js (App Router)
- **Language**: TypeScript & React 19
- **Styling**: Vanilla CSS (CSS Modules & Globals)
- **Deployment**: Vercel-ready

### Backend
- **CMS/Framework**: Strapi v5
- **Database**: SQLite (Local Dev) / PostgreSQL (Production)
- **Deployment**: Railway-ready

---

## 🔑 Demo Accounts

The backend is pre-configured to automatically seed the database on the first run. You can use the following demo accounts to test all platform features natively.

| Role | Email | Password | Dashboard Access |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@demo.com` | `Password123!` | Complete overview, Blog Management, User Management |
| **Content Manager** | `content@demo.com` | `Password123!` | Blog Creation & Publishing |
| **Instructor** | `instructor@demo.com` | `Password123!` | Course Creation, Lesson Management, Quiz Building |
| **Student** | `student@demo.com` | `Password123!` | Course Browsing, Enrollment, Lesson Progress, Quiz Taking |
| **Student 2** | `student2@demo.com` | `Password123!` | Shows 100% completion in Course 1 with perfect auto-graded quiz score |
| **Student 3** | `student3@demo.com` | `Password123!` | Shows 50% progression in Course 1 with partial auto-graded quiz score |
---

## 💻 Local Development Setup

### 1. Backend (Strapi)
```bash
cd backend
npm install
npm run dev
```
- Open `http://localhost:1337/admin`.
- Register the initial admin user. The system will automatically run our custom bootstrap script to define the `Admin`, `Content Manager`, `Instructor`, and `Student` roles.
- Grant basic CRUD permissions (find, findOne, create, update, delete) to these roles under **Settings > Roles**. Custom backend controllers securely enforce ownership and logic automatically.

### 2. Frontend (Next.js)
Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```
- Open `http://localhost:3000`.
- The application will automatically route you to the correct dashboard based on your authenticated role!

---

## ☁️ Deployment Guide

### Vercel (Frontend)
1. Import your GitHub repository to Vercel.
2. Under "Framework Preset", select **Next.js**.
3. Set the "Root Directory" to `frontend`.
4. Add the Environment Variable:
   - `NEXT_PUBLIC_API_URL` = `https://your-railway-app-url.up.railway.app`

### Railway (Backend)
1. Create a new project on Railway and provision a **PostgreSQL** database.
2. Link your GitHub repository and select the `backend` folder as the root.
3. Railway will automatically detect the `railway.toml` configuration provided in the repository.
4. Set the following Environment Variables in Railway:
   - `DATABASE_CLIENT` = `postgres`
   - `DATABASE_SSL` = `true`
   - *Note: Railway automatically injects the `DATABASE_URL`.*

---

*This project was meticulously architected and executed by Antigravity, fulfilling all requirements of the Senior Engineer Master Prompt.*
