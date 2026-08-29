# 🚀 Production Deployment Guide: Next-Gen LMS

This guide provides an end-to-end, step-by-step walkthrough for deploying the full-stack Learning Management System (LMS) to production.

- **Backend**: Strapi v5 on **[Railway](https://railway.app)** (using managed **PostgreSQL**).
- **Frontend**: Next.js App Router on **[Vercel](https://vercel.com)**.

---

## 📋 Table of Contents
1. [Prerequisites & Requirements](#1-prerequisites--requirements)
2. [Step 1: Push Code to GitHub](#step-1-push-code-to-github)
3. [Step 2: Deploy Backend to Railway (Strapi + PostgreSQL)](#step-2-deploy-backend-to-railway-strapi--postgresql)
4. [Step 3: Initialize & Configure Strapi in Production](#step-3-initialize--configure-strapi-in-production)
5. [Step 4: Deploy Frontend to Vercel (Next.js)](#step-4-deploy-frontend-to-vercel-nextjs)
6. [Step 5: End-to-End Verification Checklist](#step-5-end-to-end-verification-checklist)
7. [Troubleshooting & Common Pitfalls](#troubleshooting--common-pitfalls)

---

## 1. Prerequisites & Requirements

Before starting, ensure you have:
1. **GitHub Account** with this repository pushed to a remote repo.
2. **[Railway](https://railway.app)** account (Free / Hobby / Pro tier).
3. **[Vercel](https://vercel.com)** account (Hobby / Pro tier).
4. **Node.js (v18 or v20+)** installed locally to generate secure random keys.

---

## Step 1: Push Code to GitHub

Ensure all your latest changes are committed and pushed:

```bash
git add .
git commit -m "feat: complete LMS production setup with RBAC, quiz engine, and UI polish"
git push origin main
```

---

## Step 2: Deploy Backend to Railway (Strapi + PostgreSQL)

### 2.1 Create a Railway Project
1. Log in to [Railway](https://railway.app/dashboard).
2. Click **+ New Project** → Select **Provision PostgreSQL**.
3. Railway will provision a dedicated PostgreSQL database service.

### 2.2 Add Strapi Web Service
1. In the same Railway project canvas, click **+ Create** / **+ New Service**.
2. Select **GitHub Repo** and choose your LMS repository.
3. Once created, click on the new service card and go to **Settings**:
   - **Service Name**: `lms-backend` (or similar)
   - **Root Directory**: `backend` (⚠️ **CRITICAL**: Do not leave as root `/`)
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run start`

### 2.3 Configure Environment Variables in Railway
Click on the **Variables** tab of your Strapi backend service and add the following:

| Variable Name | Value / Description |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `HOST` | `0.0.0.0` |
| `PORT` | `1337` |
| `DATABASE_CLIENT` | `postgres` |
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` *(Click "Add Reference" to link to your PostgreSQL service)* |
| `DATABASE_SSL` | `true` |
| `JWT_SECRET` | *(Generate via: `openssl rand -base64 32`)* |
| `ADMIN_JWT_SECRET` | *(Generate via: `openssl rand -base64 32`)* |
| `APP_KEYS` | *(Generate via: `openssl rand -base64 32,openssl rand -base64 32`)* |
| `API_TOKEN_SALT` | *(Generate via: `openssl rand -base64 32`)* |
| `TRANSFER_TOKEN_SALT` | *(Generate via: `openssl rand -base64 32`)* |

> 💡 **Quick Key Generator (PowerShell / Terminal)**:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
> ```

### 2.4 Generate Public Domain
1. In your Strapi service card, go to **Settings** → **Networking** / **Public Networking**.
2. Click **Generate Domain**.
3. Copy your backend URL (e.g., `https://lms-backend-production-xxxx.up.railway.app`).

---

## Step 3: Initialize & Configure Strapi in Production

1. Open your generated Railway backend URL in your browser:
   ```
   https://your-railway-url.up.railway.app/admin
   ```
2. **Create the First Administrator Account** (Username, Email, Password).
3. **Verify Demo Data & Roles**:
   - Navigate to **Settings** → **Users & Permissions Plugin** → **Roles**.
   - Confirm that the roles (`Admin`, `Content Manager`, `Instructor`, `Student`, `Public`) are present.
4. **Configure Public Permissions**:
   - Click on the **Public** role.
   - Under **Course**, check `find` and `findOne`.
   - Under **Blog-post**, check `find` and `findOne`.
   - Click **Save**.

---

## Step 4: Deploy Frontend to Vercel (Next.js)

### 4.1 Import Repository to Vercel
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** → **Project**.
3. Select your GitHub LMS repository.

### 4.2 Configure Build & Output Settings
1. In the **Configure Project** screen:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click *Edit* and select `frontend`.
2. **Environment Variables**:
   Add the following environment variable:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://your-railway-url.up.railway.app` *(Do NOT include trailing slash `/`)*

3. Click **Deploy**.

Vercel will build and deploy your Next.js application in ~1-2 minutes.

---

## Step 5: End-to-End Verification Checklist

Once both services are deployed, perform this complete testing checklist:

| Test Case | Steps | Expected Result |
| :--- | :--- | :--- |
| **Public Homepage** | Open Vercel URL (`https://your-app.vercel.app`) | Hero, category sections, and live course list load smoothly. |
| **Student Auth** | Log in with `student@demo.com` / `Password123!` | Redirects to Student Dashboard. Shows enrolled courses. |
| **Course Player** | Click a course → Start learning | Lessons load, clicking "Complete" tracks progress % in PostgreSQL. |
| **Quiz Auto-Grading**| Complete an MCQ quiz | Score calculated instantly on backend, results saved to DB. |
| **Course Rating** | Rate a completed course (1-5 stars) | Star rating persists and updates course stats. |
| **Instructor Role** | Log in with `instructor@demo.com` / `Password123!` | Can create/edit courses, manage lessons, and see enrolled student progress. |
| **Content Manager** | Log in with `content@demo.com` / `Password123!` | Can write blogs. Draft blogs are hidden from public, published blogs are live. |
| **Admin Workspace** | Log in with `admin@demo.com` / `Password123!` | Overview analytics charts load, User Role Management allows role promotion. |

---

## Troubleshooting & Common Pitfalls

### 1. `DATABASE_SSL` Error on Railway
- **Issue**: `self-signed certificate in certificate chain` or `Connection terminated unexpectedly`.
- **Solution**: Ensure `DATABASE_SSL=true` is set. In `backend/config/database.ts`, `rejectUnauthorized` is already set to `false` for Railway compatibility.

### 2. Frontend shows "No courses available"
- **Issue**: Missing `NEXT_PUBLIC_API_URL` or Public role permissions.
- **Solution**:
  1. Check Vercel **Settings → Environment Variables** → Verify `NEXT_PUBLIC_API_URL` matches your Railway URL without trailing `/`.
  2. Open Strapi Admin (`https://your-backend.up.railway.app/admin`) → **Settings → Roles → Public** → Ensure `find` and `findOne` are enabled for `Course` and `Blog-post`.

### 3. Vercel Build Fails with Root Directory Error
- **Issue**: Vercel tries to build the root package.
- **Solution**: In Vercel Project Settings, ensure **Root Directory** is explicitly set to `frontend`.

---

## 🎥 Recording Your 10-Minute Video Walkthrough

As specified in the assessment requirements, your 10-minute video submission should cover:
1. **Live Platform Walkthrough (4-5 mins)**:
   - Student journey: browse → enroll → track lesson progress → take auto-graded quiz → leave review.
   - Instructor journey: create course → add lessons/quiz → track student progress.
   - Content Manager / Admin: blog publishing (Draft vs Published) + Admin analytics overview.
2. **Architecture & RBAC Explanation (2 mins)**:
   - Show how Strapi backend controllers protect routes and enforce ownership.
3. **Deployment Setup (1-2 mins)**:
   - Show the live Railway PostgreSQL service and Vercel production dashboard.
4. **Key Code Highlights (2 mins)**:
   - Walk through `CoursePlayerClient.tsx` (progress tracking) and `quiz-result.ts` (server-side auto grading).
