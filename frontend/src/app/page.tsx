import Link from 'next/link';
import { fetchAPI } from '@/lib/api';
import PublicNavbar from '@/components/PublicNavbar';

export const revalidate = 60; // ISR for homepage

export default async function HomePage() {
  let courses = [];
  try {
    // Fetch latest 3 published courses
    const res = await fetchAPI('/courses?populate=instructor&sort=createdAt:desc&pagination[limit]=3');
    courses = res.data || [];
  } catch (err) {
    console.error('Failed to fetch courses for homepage');
  }

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />

      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="px-4 py-20 text-center flex flex-col items-center justify-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight mb-6 leading-tight">
              The Future of <span className="text-blue-600">Learning</span> is Here.
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              A modern, robust, and beautiful Learning Management System designed to empower students and instructors worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="px-8 py-4 bg-blue-600 text-white rounded-full font-bold text-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg">
                Start Learning Now
              </Link>
              <Link href="/dashboard" className="px-8 py-4 bg-white text-gray-800 border border-gray-200 rounded-full font-bold text-lg hover:bg-gray-50 transition-all shadow-sm hover:shadow-md">
                Go to Dashboard
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Courses Section */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-3xl font-black text-gray-900">Featured Courses</h2>
                <p className="text-gray-600 mt-2">Explore our most recent premium offerings.</p>
              </div>
              <Link href="/register" className="hidden sm:block text-blue-600 font-bold hover:underline">
                View all courses &rarr;
              </Link>
            </div>
            
            {courses.length === 0 ? (
              <p className="text-gray-500">No courses available at the moment.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.map((course: any, idx: number) => (
                  <div key={course.documentId} className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group">
                    <div className="aspect-video w-full bg-gray-100 relative overflow-hidden">
                       <img 
                         src={`https://picsum.photos/seed/${course.documentId}/600/400`} 
                         alt={course.title} 
                         className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                       />
                       <div className="absolute top-4 right-4 bg-white/95 backdrop-blur px-3 py-1.5 rounded-full text-xs font-bold text-gray-800 shadow-sm border border-gray-100">
                         {course.difficulty}
                       </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-xl font-bold mb-3 line-clamp-2 text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">{course.title}</h3>
                      <p className="text-gray-500 text-sm line-clamp-3 mb-6 flex-1 leading-relaxed">{course.description}</p>
                      
                      <div className="flex items-center justify-between mt-auto pt-5 border-t border-gray-100">
                         <div className="text-sm font-medium text-gray-600 flex items-center gap-2.5">
                           <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold ring-1 ring-blue-100">
                             {course.instructor?.username?.[0]?.toUpperCase() || 'I'}
                           </div>
                           {course.instructor?.username || 'Instructor'}
                         </div>
                         <Link href={`/courses/${course.documentId}`} className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                           View <span aria-hidden="true">&rarr;</span>
                         </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-black text-gray-900 text-center mb-16">Why Choose Our Platform?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 border rounded-2xl bg-white text-center shadow-sm hover:shadow-md transition-all">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">🎓</div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Expert Instructors</h3>
                <p className="text-gray-600">Learn from industry professionals who are passionate about teaching and sharing knowledge.</p>
              </div>
              <div className="p-8 border rounded-2xl bg-white text-center shadow-sm hover:shadow-md transition-all">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">📈</div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Track Progress</h3>
                <p className="text-gray-600">Monitor your learning journey with intuitive progress tracking and interactive quizzes.</p>
              </div>
              <div className="p-8 border rounded-2xl bg-white text-center shadow-sm hover:shadow-md transition-all">
                <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">✍️</div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Engaging Content</h3>
                <p className="text-gray-600">Read the latest articles from our community in our fully featured blog system.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-gray-100 py-12 text-center text-sm text-gray-500">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-semibold">&copy; 2026 LMS Platform. Built by Senior Engineer.</p>
        </div>
      </footer>
    </div>
  );
}
