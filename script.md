# 🚀 স্টেপ-বাই-স্টেপ টেকনিক্যাল রেকর্ডিং গাইড (ভিডিওর দ্বিতীয় অংশ)

> **💡 প্রো-টিপ:** আপনি ঠিক যেভাবে চিন্তা করেছেন, **Data Flow** এবং **Quiz Auto-Grading Logic** একসাথে উপস্থাপন করাটাই সবচেয়ে কার্যকর ও প্রফেশনাল অ্যাপ্রোচ! এতে পরীক্ষক বুঝতে পারবেন কীভাবে ব্রাউজারের একটি অ্যাকশন ব্যাকএন্ড কোড হয়ে ডাটাবেজে পারসিস্ট হয় এবং তাৎক্ষণিক ফিডব্যাক দেয়।

---

## 📌 স্টেপ ১: Data Flow + Quiz Auto-Grading Logic (একসাথে কম্বাইন্ড ডেমো ও কোড)

### 🖥️ স্ক্রিনে যা যা করবেন (Sequence):
1. **ব্রাউজারে যান:** Student হিসেবে লগইন করে যেকোনো কোর্সের কুইজ পেজে যান (`/dashboard/courses/[id]/learn` &rarr; **Quiz** ট্যাব)।
2. **DevTools ওপেন করুন:** **`F12`** চাপুন &rarr; **`Network`** ট্যাবে গিয়ে **`Fetch/XHR`** সিলেক্ট করুন।
3. **কুইজ সাবমিট করুন:** ৩টি প্রশ্নের উত্তর সিলেক্ট করে **"Submit Answers"** বাটনে ক্লিক করুন।
4. **Network Request দেখান:** Network ট্যাবে আসা `submit` রিকোয়েস্টে ক্লিক করে **Headers** (Bearer JWT টোকেন) এবং **Payload** (`{ answers: { ... } }`) দেখান।
5. **সরাসরি VS Code-এ সুইচ করুন:** [`backend/src/api/quiz/controllers/quiz.ts`](file:///F:/Learning%20Management%20System%20%28LMS%29/backend/src/api/quiz/controllers/quiz.ts) ফাইলের `submit` মেথডটি ওপেন করুন (লাইন ১৫২ থেকে ২১৮)।
6. **কোডের স্টেপগুলো মাউস দিয়ে দেখান:**
   * `// 1. Authenticate user from Bearer JWT`
   * `// 3. Fetch Quiz and Questions from PostgreSQL database`
   * `// 4. Calculate score on backend: compare student answer vs hidden question.correctAnswer`
   * `// 5. Compute percentage: (correctCount / totalQuestions) * 100`
   * `// 6. Persist Quiz Result permanently in PostgreSQL database`
7. **আবার ব্রাউজারে ফেরত আসুন:** Network ট্যাবের **Response** (`{ score: 100, message: "Quiz submitted successfully!" }`) এবং স্ক্রিনে কনফেটি অ্যানিমেশন ও স্কোর ব্যাজ দেখান।

---

### 🗣️ মুখে যা বলবেন (বাংলায়):

> "এখন আমি প্ল্যাটফর্মের **Data Flow** এবং **Quiz Auto-Grading Logic** একসাথে লাইভ এবং কোডের মাধ্যমে দেখাচ্ছি।
> 
> **১. Client Request (Frontend to Backend):**
> স্টুডেন্ট যখন কুইজের উত্তর সাবমিট করে, তখন Next.js ফ্রন্টএন্ড থেকে Strapi ব্যাকএন্ডের `POST /api/quizzes/:id/submit` এন্ডপয়েন্টে রিকোয়েস্ট যায়। Network ট্যাবে দেখতে পাচ্ছেন Headers-এ ইউজারের সিকিউর Bearer JWT টোকেন রয়েছে এবং Payload-এ স্টুডেন্টের দেওয়া উত্তরগুলো রয়েছে। ফ্রন্টএন্ডে কিন্তু সঠিক উত্তর পাঠানো হয়নি যাতে ক্লায়েন্ট-সাইডে কেউ চিটিং করতে না পারে।
> 
> **২. Backend Auto-Grading Execution (Inside `quiz.ts`):**
> এবার ব্যাকএন্ড কোডে দেখুন:
> * **লাইন ১৫২–১৫৭:** `ctx.state.user` দিয়ে JWT টোকেন ডিকোড করে ইউজার ভ্যালিডেট করা হয়।
> * **লাইন ১৬৩–১৭৬:** ডাটাবেজ থেকে কুইজ এবং তার সাথে যুক্ত আসল `questions` ফেচ করা হয়।
> * **লাইন ১৯৩–২০২:** একটি লুপের মাধ্যমে প্রতিটি প্রশ্নের ডাটাবেজে থাকা গোপন `question.correctAnswer`-এর সাথে স্টুডেন্টের সাবমিট করা উত্তরের তুলনা করা হয় এবং সঠিক হলে `correctCount` ১ বাড়ানো হয়।
> * **লাইন ২০৫:** `(correctCount / totalQuestions) * 100` সূত্রের মাধ্যমে সার্ভারেই শতকরা স্কোর হিসাব করা হয়।
> * **লাইন ২০৭–২১৬:** `strapi.db.query('api::quiz-result.quiz-result').create` দিয়ে স্টুডেন্ট আইডি, কুইজ আইডি ও প্রাপ্ত স্কোর স্থায়ীভাবে PostgreSQL ডাটাবেজে সেভ করা হয়।
> 
> **৩. Server Response (Backend to Frontend):**
> এরপর ব্যাকএন্ড থেকে এই ক্যালকুলেটেড স্কোর ও মেসেজ রেসপন্স হিসেবে পাঠানো হয় এবং ফ্রন্টএন্ড তা রিসিভ করার সাথে সাথে স্ক্রিনে সেলিব্রেশন কনফেটি এবং স্কোর আপডেট করে দেয়। এটিই আমাদের সম্পূর্ণ এন্ড-টু-এন্ড ডেটা ফ্লো।"

---

## 📌 স্টেপ ২: Progress Tracking Logic (লাইন-বাই-লাইন কোড ব্যাখ্যা)

### 🖥️ স্ক্রিনে যা দেখাবেন:
* VS Code-এ [`backend/src/api/lesson-progress/controllers/lesson-progress.ts`](file:///F:/Learning%20Management%20System%20%28LMS%29/backend/src/api/lesson-progress/controllers/lesson-progress.ts) ওপেন করুন।

### 🗣️ মুখে যা বলবেন (লাইন-বাই-লাইন বাংলায়):

> "এবার আমি **Progress Tracking Logic**-টি ব্যাখ্যা করছি:
> 
> দেখুন `lesson-progress.ts` ফাইলে:
> * **লাইন ৭–১২:** `ctx.state.user` চেক করে নিশ্চিত করা হয় যে রিকোয়েস্টকারী একজন অথেন্টিকেটেড ইউজার।
> * **লাইন ১৮–৩৫:** স্টুডেন্ট যে লেসনটি সম্পন্ন করছে, তার `lessonEntity` এবং তার প্যারেন্ট `course` ডাটাবেজ থেকে খুঁজে বের করা হয়।
> * **লাইন ৪০–৪৯:** `enrollment` টেবিলে চেক করা হয় এই স্টুডেন্ট আদৌ এই কোর্সে এনরোল্ড কি না। এনরোল্ড না থাকলে প্রগ্রেস মার্ক করতে দেওয়া হয় না।
> * **লাইন ৫১–৬১:** `existingProgress` চেক করে একই লেসনে ডুপ্লিকেট কমপ্লিশন এন্ট্রি রোধ করা হয়।
> * **লাইন ৬৪–৭২:** সব ভ্যালিডেশন শেষে `strapi.db.query('api::lesson-progress.lesson-progress').create` দিয়ে স্টুডেন্ট আইডি, লেসন আইডি এবং `completed: true` ডাটাবেজে পারসিস্ট করা হয়। ফলে পেজ রিফ্রেশ দিলেও প্রগ্রেস ডাটাবেজ থেকেই রিলোড হয়।"

---

## 📌 স্টেপ ৩: Role-Based Access Control (RBAC) ব্যাকএন্ড এনফোর্সমেন্ট

### 🖥️ স্ক্রিনে যা দেখাবেন:
* VS Code-এ [`backend/src/api/course/controllers/course.ts`](file:///F:/Learning%20Management%20System%20%28LMS%29/backend/src/api/course/controllers/course.ts) ফাইলটি ওপেন করে `create`, `find`, এবং `update` মেথড দেখান।

### 🗣️ মুখে যা বলবেন (বাংলায়):

> "সিকিউরিটির ক্ষেত্রে আমরা শুধু ফ্রন্টএন্ডে বাটন লুকিয়ে রাখিনি, বরং ব্যাকএন্ডের কন্ট্রোলার লেভেলে প্রতিটি ডাটাবেজ অপারেশনে কঠোর Role-Based Access Control (RBAC) নিশ্চিত করেছি।
> 
> দেখুন `course.ts` কন্ট্রোলারে:
> * আমরা `getUserRole(strapi, user)` ফাংশনের মাধ্যমে ডাটাবেজ থেকে ইউজারের রোল ফেচ করি।
> * কোনো Student যদি এপিআই কল দিয়ে কোর্স তৈরি বা ডিলিট করার চেষ্টা করে, ব্যাকএন্ড তাকে `403 Forbidden` রিটার্ন করে।
> * আবার একজন Instructor শুধু তার নিজের তৈরি করা কোর্সের ডেটাই মডিফাই করতে পারে—অন্য ইনস্ট্রাক্টরের কোর্সে হাত দিলে ব্যাকএন্ড স্বয়ংক্রিয়ভাবে রিকোয়েস্ট ব্লক করে দেয়।"

---

## 📌 স্টেপ ৪: Admin Panel + Blog Draft &rarr; Publish Flow

### 🖥️ স্ক্রিনে যা দেখাবেন:
1. **Admin Panel:** `/dashboard/admin/users` পেজে গিয়ে যেকোনো ইউজারের রোলের ড্রপডাউনে ক্লিক করে রোল পরিবর্তন করে দেখান।
2. **Blog Draft &rarr; Publish:**
   * `/dashboard/blogs` পেজে গিয়ে **"Write New Post"** বাটনে ক্লিক করুন।
   * Title দিন: `"Sample Draft Article"`, Status দিন **Draft** &rarr; Save করুন।
   * পাবলিক পেজ `/blog` এ গিয়ে দেখান যে ড্রাফট আর্টিকেলটি এখানে আসেনি।
   * আবার ড্যাশবোর্ডে এসে আর্টিকেলটি **Edit** করে Status দিন **Published** &rarr; Save করুন।
   * এবার `/blog` পেজ রিফ্রেশ করে দেখান যে আর্টিকেলটি সাথে সাথে লাইভ হয়ে গেছে!

### 🗣️ মুখে যা বলবেন (বাংলায়):

> "এখানে অ্যাডমিন প্যানেল থেকে আমরা সরাসরি লাইভ ইউজারদের রোল প্রমোট বা পরিবর্তন করতে পারি।
> 
> ব্লগের ক্ষেত্রে আমাদের কমপ্লিট **Draft vs Published** লাইফসাইকেল রয়েছে:
> যখন কনটেন্ট ম্যানেজার বা অ্যাডমিন কোনো আর্টিকেল 'Draft' হিসেবে রাখেন, তখন সেটি ডাটাবেজে সংরক্ষিত থাকলেও পাবলিক `/blog` পেজে দেখা যায় না। যখনই এটিকে 'Published' করা হয়, সাথে সাথে এটি পাবলিকলি লাইভ হয়ে যায়।"

---

## 📌 স্টেপ ৫: Deployment Setup (Railway, Vercel & Environment Variables)

### 🖥️ স্ক্রিনে যা দেখাবেন:
1. **Railway Dashboard Tab:** Strapi Service &rarr; **Variables** ট্যাবে গিয়ে `DATABASE_CLIENT=postgres`, `DATABASE_URL`, `JWT_SECRET` দেখান।
2. **Vercel Dashboard Tab:** Next.js Project &rarr; **Settings &rarr; Environment Variables** এ গিয়ে `NEXT_PUBLIC_API_URL` দেখান।

### 🗣️ মুখে যা বলবেন (বাংলায়):

> "সর্বশেষে ডিপ্লয়মেন্ট আর্কিটেকচার নিয়ে সংক্ষেপে বলছি:
> * **Railway:** ব্যাকএন্ডের জন্য আমরা Strapi 5-কে Railway-তে ডিপ্লয় করেছি এবং সরাসরি একটি পরিচালিত PostgreSQL ডাটাবেজের সাথে কানেক্ট করেছি। এখানে `DATABASE_CLIENT=postgres` এবং সিকিউর JWT সিক্রেটগুলো এনভায়রনমেন্ট ভেরিয়েবলে কনফিগার করা আছে।
> * **Vercel:** ফ্রন্টএন্ড Next.js অ্যাপটি Vercel-এর গ্লোবাল এজ নেটওয়ার্কে হোস্ট করা এবং `NEXT_PUBLIC_API_URL` এনভায়রনমেন্ট ভেরিয়েবলের মাধ্যমে সরাসরি Railway ব্যাকএন্ড এপিআই-এর সাথে সংযুক্ত।
> 
> প্রজেক্টটির গিটহাবে একটি স্বচ্ছ ও অর্থপূর্ণ কমিট হিস্টোরি রয়েছে এবং রুট `README.md`-তে সমস্ত আর্কিটেকচার ডায়াগ্রাম ও লোকাল সেটআপ গাইড বিস্তারিতভাবে দেওয়া আছে।
> 
> ধৈর্য ধরে পুরো ওয়াকথ্রুটি দেখার জন্য সবাইকে ধন্যবাদ!"

---

## 📋 ফাইনাল চেকলিস্ট (ভিডিও রেকর্ড করার সময় চোখের সামনে রাখুন):
| ক্রম | বিষয় | স্ক্রিন অ্যাকশন |
| :---: | :--- | :--- |
| **১** | **Data Flow + Quiz Grading** | ব্রাউজারে F12 Network Tab &rarr; কুইজ সাবমিট &rarr; `quiz.ts` কোড দেখান &rarr; রেসপন্স JSON ও কনফেটি |
| **২** | **Progress Tracking** | VS Code-এ `lesson-progress.ts` ফাইল ওপেন করে কমেন্ট অনুযায়ী লাইনগুলো দেখান |
| **৩** | **Backend RBAC** | VS Code-এ `course.ts` ফাইলে `getUserRole` ও ওনারশিপ গার্ড দেখান |
| **৪** | **Admin & Blog Lifecycle** | ড্যাশবোর্ডে রোল চেঞ্জ &rarr; ব্লগে Draft সেভ করে দেখানো &rarr; Publish করে লাইভ পেজে দেখানো |
| **৫** | **Deployment Setup** | Railway Variables (PostgreSQL) এবং Vercel Variables (`NEXT_PUBLIC_API_URL`) দেখানো |
