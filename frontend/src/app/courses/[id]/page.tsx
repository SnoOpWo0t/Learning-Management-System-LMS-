import { fetchAPI } from '@/lib/api';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ThemeToggle } from '@/components/ThemeToggle';

export const revalidate = 60; // ISR for course pages

export default async function PublicCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  let course;
  try {
    const res = await fetchAPI(`/courses/${id}?populate=instructor,lessons`);
    course = res.data;
  } catch (err) {
    console.error('Failed to fetch course');
  }

  if (!course) {
    notFound();
  }

  // Sort lessons safely if they exist
  const lessons = (course.lessons || []).sort((a: any, b: any) => a.order - b.order);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-black text-blue-600 tracking-tight">LMS<span className="text-gray-800">.</span></Link>
          <div className="flex gap-4 items-center">
            <ThemeToggle />
            <Link href="/login" className="text-gray-600 font-medium hover:text-blue-600">Login</Link>
            <Link href="/register" className="px-4 py-2 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors ml-2">Sign Up</Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-12 flex flex-col lg:flex-row gap-8">
        
        {/* Main Content Area */}
        <div className="flex-1 space-y-10">
          {/* Header Info */}
          <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-200">
            <div className="inline-block px-4 py-1.5 bg-blue-50 text-blue-700 text-sm font-bold rounded-full mb-6 border border-blue-100 uppercase tracking-wide">
              {course.difficulty} Level
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight leading-tight">{course.title}</h1>
            <p className="text-lg md:text-xl text-gray-600 whitespace-pre-wrap leading-relaxed">{course.description}</p>
            
            <div className="flex items-center gap-5 mt-10 pt-8 border-t border-gray-100">
              <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold shadow-md ring-4 ring-blue-50">
                {course.instructor?.username?.[0]?.toUpperCase() || 'I'}
              </div>
              <div>
                <p className="text-sm text-gray-500 font-semibold tracking-wide uppercase">Instructor</p>
                <p className="text-lg font-bold text-gray-900">{course.instructor?.username || 'Unknown Instructor'}</p>
              </div>
            </div>
          </div>

          {/* Syllabus */}
          <div className="pt-6">
            <h2 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">Course Syllabus</h2>
            {lessons.length === 0 ? (
              <p className="text-gray-500 italic bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">No lessons published yet.</p>
            ) : (
              <div className="space-y-4">
                {lessons.map((lesson: any, index: number) => (
                  <div key={lesson.documentId} className="group bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-5 hover:border-blue-300 hover:shadow-md transition-all cursor-not-allowed">
                    <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-sm font-black text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100 transition-colors">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-700 transition-colors">{lesson.title}</h3>
                      <p className="text-sm text-gray-500 mt-1 font-medium">Video & Article content</p>
                    </div>
                    <div className="text-gray-300 group-hover:text-gray-400 transition-colors bg-gray-50 p-2.5 rounded-full" title="Login to view content">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Enrollment CTA */}
        <div className="lg:w-80 relative">
          <div className="sticky top-28 bg-white p-8 rounded-3xl shadow-xl border border-gray-100 flex flex-col gap-6 text-center">
            <div className="aspect-video w-full bg-blue-50 rounded-xl overflow-hidden mb-2 shadow-inner ring-1 ring-black/5">
               <img 
                 src={`https://picsum.photos/seed/${id}/400/300`} 
                 alt={course.title} 
                 className="w-full h-full object-cover"
               />
            </div>
            
            <div>
              <p className="text-3xl font-black text-gray-900 tracking-tight">Free</p>
              <p className="text-sm font-medium text-gray-500 mt-1 uppercase tracking-wider">Full lifetime access</p>
            </div>
            
            <Link 
              href={`/login`} 
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              Sign in to Enroll
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
            
            <div className="text-sm text-gray-600 space-y-3 mt-4 pt-6 border-t border-gray-100 font-medium">
              <p className="flex items-center gap-3 justify-center">
                <span className="text-green-500 bg-green-50 rounded-full p-1">✓</span> Expert Instruction
              </p>
              <p className="flex items-center gap-3 justify-center">
                <span className="text-green-500 bg-green-50 rounded-full p-1">✓</span> Progress Tracking
              </p>
              <p className="flex items-center gap-3 justify-center">
                <span className="text-green-500 bg-green-50 rounded-full p-1">✓</span> Assessment Quizzes
              </p>
            </div>
          </div>
        </div>
        
      </main>
    </div>
  );
}
