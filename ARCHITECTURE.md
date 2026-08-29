# System Architecture

## Overview
This Learning Management System (LMS) follows a modern, decoupled architecture. It separates the frontend presentation layer from the backend data and logic layer. This allows for horizontal scaling, improved security, and faster iteration.

## Frontend Architecture (Next.js)
The frontend is built using **Next.js 15 (App Router)** and **React 19**, deployed on **Vercel**.
- **Server Components:** Used extensively for fetching initial page data (like the public course catalog) without shipping JavaScript to the client.
- **Client Components:** Used for interactive elements (like the Quiz engine and Lesson progress buttons).
- **Styling:** Vanilla CSS (`globals.css` and CSS Modules) are used strictly, satisfying requirements against utility frameworks.
- **State Management:** React Context (`AuthContext`) manages the user's session globally, automatically determining navigation access based on the user's role.

## Backend Architecture (Strapi)
The backend is powered by **Strapi v5**, acting as a Headless CMS and API server, deployed on **Railway** connected to a **PostgreSQL** database.
- **REST API:** Strapi exposes a strictly controlled REST API for the frontend to consume.
- **Controllers & Policies:** Custom backend logic intercepts API requests to enforce ownership and Role-Based Access Control (RBAC). For example, a student attempting to create a course will be rejected at the controller level before touching the database.
- **Entity Service:** Used internally (like in the `bootstrap` script) to safely bypass the REST API for system-level data seeding.

## Data Relationships
- **Course**: The root entity. Belongs to an `Instructor`.
- **Lesson**: Belongs to a `Course`. Contains an `order` field for sequential learning.
- **Quiz**: Belongs to a `Course`. 
- **Question**: Belongs to a `Quiz`. Contains multiple options and a `correctAnswer`.
- **Enrollment**: Links a `Student` to a `Course`.
- **Lesson Progress**: Links a `Student` to a `Lesson`, tracking `completed` state.
- **Quiz Result**: Links a `Student` to a `Quiz`, permanently storing their numerical `score`.
- **Blog Post**: Belongs to an `Author` (Admin/Content Manager) and has a `Draft` or `Published` state.

## Security & RBAC Model
Security is enforced on the backend. The frontend merely adapts the UI based on permissions.
- **Admin**: Can manage all users, roles, and content.
- **Content Manager**: Can manage all blogs and courses, but cannot manage users.
- **Instructor**: Ownership is strictly enforced. Instructors can only update or delete courses/lessons/quizzes that they created.
- **Student**: Cannot create or modify any content. They can only read published content, create enrollments, update their own lesson progress, and submit quizzes.
- **Quiz Grading**: When a student submits a quiz, the frontend sends their selected answers. The backend compares these against the `correctAnswer` (which is never sent to the client) and calculates the score on the server, preventing cheating.
- **Data Isolation**: A student can only fetch their own `lesson-progress` and `quiz-result` documents. The backend `me` controllers filter out other users' data automatically.

## Deployment
- **Frontend**: Vercel automatically builds and hosts the Next.js application, connecting to the backend via the `NEXT_PUBLIC_API_URL` environment variable.
- **Backend**: Railway builds the Strapi application using a Node.js Docker environment and connects it to a provisioned PostgreSQL database via the automatically injected `DATABASE_URL`.
