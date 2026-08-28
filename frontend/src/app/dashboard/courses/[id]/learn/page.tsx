import { fetchAPI } from '@/lib/api';
import { notFound, redirect } from 'next/navigation';
import CoursePlayerClient from './CoursePlayerClient';

// Ensure the page doesn't cache dynamically for authenticated users
export const dynamic = 'force-dynamic';

export default async function CourseLearnPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  let course;
  let quiz = null;
  try {
    // Fetch course with lessons
    const res = await fetchAPI(`/courses/${id}?populate=instructor,lessons`);
    course = res.data;

    if (course) {
      // Fetch quiz for this course separately
      const quizRes = await fetchAPI(`/quizzes?filters[course][documentId][$eq]=${course.documentId}&populate=questions`);
      if (quizRes.data && quizRes.data.length > 0) {
        quiz = quizRes.data[0];
      }
    }
  } catch (err) {
    console.error('Failed to fetch course data:', err);
  }

  if (!course) {
    notFound();
  }

  // Sort lessons safely if they exist
  const lessons = (course.lessons || []).sort((a: any, b: any) => a.order - b.order);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col">
      <CoursePlayerClient 
        courseId={id}
        courseTitle={course.title}
        lessons={lessons}
        quiz={quiz}
      />
    </div>
  );
}
