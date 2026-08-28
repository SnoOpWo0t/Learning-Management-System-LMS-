import Link from 'next/link';
import { fetchAPI } from '@/lib/api';
import PublicNavbar from '@/components/PublicNavbar';

export const revalidate = 60;

export default async function HomePage() {
  let courses = [];
  try {
    const res = await fetchAPI('/courses?populate=instructor&sort=createdAt:desc&pagination[limit]=100');
    courses = res.data || [];
  } catch (err) {
    console.error('Failed to fetch courses for homepage');
  }

  const categorizedCourses = {
    Beginner: courses.filter((c: any) => c.difficulty === 'Beginner'),
    Intermediate: courses.filter((c: any) => c.difficulty === 'Intermediate'),
    Advanced: courses.filter((c: any) => c.difficulty === 'Advanced'),
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0A0A0A] text-gray-900 dark:text-white font-sans selection:bg-blue-600 selection:text-white transition-colors duration-300">
      <PublicNavbar />

      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="relative w-full pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 flex flex-col items-center text-center overflow-hidden">
          {/* Subtle Glow Effects */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/10 dark:bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-500/10 dark:bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm font-medium text-blue-600 dark:text-blue-300 mb-8 backdrop-blur-md shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Over 50+ Premium Courses
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 leading-[1.1] text-gray-900 dark:text-white">
              Master your craft with <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">
                world-class experts.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl leading-relaxed">
              The ultimate platform for modern professionals. Learn system design, UI/UX, and advanced engineering from the people who build the future.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full sm:w-auto">
              <Link href="/register" className="w-full sm:w-auto px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-full font-semibold text-base hover:bg-gray-800 dark:hover:bg-gray-100 transition-all flex items-center justify-center gap-2 shadow-md">
                Start Learning Free
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </Link>
              <Link href="/dashboard" className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-full font-semibold text-base hover:bg-gray-50 dark:hover:bg-white/10 transition-all flex items-center justify-center backdrop-blur-sm shadow-sm">
                Explore Dashboard
              </Link>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-24 px-6 bg-gray-50 dark:bg-transparent text-gray-900 dark:text-white relative z-20 border-t border-gray-200 dark:border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16 max-w-3xl">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Curated Learning Paths.</h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">Structured curriculums designed to take you from beginner to industry-ready professional.</p>
            </div>

            {courses.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10">
                <p className="text-lg font-medium text-gray-500 dark:text-gray-400">No courses available at the moment.</p>
              </div>
            ) : (
              <div className="space-y-24">
                {categorizedCourses.Beginner.length > 0 && (
                  <CategorySection title="Beginner Essentials" courses={categorizedCourses.Beginner} />
                )}
                {categorizedCourses.Intermediate.length > 0 && (
                  <CategorySection title="Intermediate Skills" courses={categorizedCourses.Intermediate} />
                )}
                {categorizedCourses.Advanced.length > 0 && (
                  <CategorySection title="Advanced Mastery" courses={categorizedCourses.Advanced} />
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* CTA Section (Reference Image Style) */}
      <section className="bg-slate-800 dark:bg-slate-900 py-24 px-6 border-t border-slate-700/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <h2 className="text-3xl md:text-4xl font-serif text-white tracking-wide">
            Ready to start learning?
          </h2>
          <div className="w-full md:max-w-md">
            <form className="flex w-full items-center border border-slate-500 rounded-sm focus-within:border-white transition-colors">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full bg-transparent text-white px-4 py-3 outline-none placeholder:text-slate-400"
              />
              <button 
                type="submit" 
                className="text-white font-medium px-6 py-3 hover:bg-white/10 transition-colors border-l border-slate-500"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Deep Dark Footer (Reference Image Style) */}
      <footer className="bg-[#0f0a14] dark:bg-black pt-20 pb-10 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
            {/* Branding Column */}
            <div className="flex flex-col lg:pr-12">
              <span className="text-3xl font-black tracking-widest mb-6 uppercase">LMS<span className="text-blue-500">.</span></span>
              <p className="text-slate-300 text-sm leading-relaxed mb-6 font-medium">
                Premium educational content designed to elevate your career and skills.
              </p>
              <p className="text-white font-bold text-sm">
                Join our community @LMSPlatform
              </p>
            </div>
            
            {/* Link Column 1 */}
            <div className="flex flex-col">
              <h4 className="font-bold text-white mb-6">Platform</h4>
              <div className="flex flex-col gap-4 text-sm text-slate-300">
                <Link href="#" className="hover:text-white transition-colors">All Courses</Link>
                <Link href="#" className="hover:text-white transition-colors">Career Paths</Link>
                <Link href="#" className="hover:text-white transition-colors">Instructors</Link>
                <Link href="#" className="hover:text-white transition-colors">Pricing</Link>
              </div>
            </div>
            
            {/* Link Column 2 */}
            <div className="flex flex-col">
              <h4 className="font-bold text-white mb-6">Quick Links</h4>
              <div className="flex flex-col gap-4 text-sm text-slate-300">
                <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
                <Link href="/login" className="hover:text-white transition-colors">Student Login</Link>
                <Link href="/register" className="hover:text-white transition-colors">Register</Link>
                <Link href="#" className="hover:text-white transition-colors">Help Center</Link>
              </div>
            </div>
            
            {/* Link Column 3 */}
            <div className="flex flex-col">
              <h4 className="font-bold text-white mb-6">Stay In Touch</h4>
              <div className="flex flex-col gap-4 text-sm text-slate-300">
                <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
                <Link href="#" className="hover:text-white transition-colors">LinkedIn</Link>
                <Link href="#" className="hover:text-white transition-colors">YouTube</Link>
                <Link href="#" className="hover:text-white transition-colors">GitHub</Link>
              </div>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="pt-8 border-t border-slate-800 flex flex-col-reverse md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
            <p>&copy; 2026 LMS Platform. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function CategorySection({ title, courses }: { title: string, courses: any[] }) {
  return (
    <div>
      <h3 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white mb-6 pb-4 border-b border-gray-200 dark:border-white/10">{title}</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((course: any) => (
          <CourseCard key={course.documentId} course={course} />
        ))}
      </div>
    </div>
  );
}

function CourseCard({ course }: { course: any }) {
  return (
    <Link href={`/courses/${course.documentId}`} className="group flex flex-col bg-white dark:bg-white/5 rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 dark:hover:shadow-blue-500/10 hover:-translate-y-2 hover:border-blue-200 dark:hover:border-blue-500/30 transition-all duration-300">
      <div className="aspect-[16/9] w-full bg-gray-100 dark:bg-white/5 relative overflow-hidden border-b border-gray-100 dark:border-white/5">
         <img 
           src={`https://picsum.photos/seed/${course.documentId}/800/450`} 
           alt={course.title} 
           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
         />
         <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-gray-900 dark:text-white border border-black/5 dark:border-white/10 shadow-sm">
           {course.difficulty}
         </div>
      </div>
      
      <div className="p-6 flex flex-col flex-1">
        <h4 className="text-lg font-semibold mb-2 line-clamp-2 text-gray-900 dark:text-white leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{course.title}</h4>
        <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-6 flex-1">{course.description}</p>
        
        <div className="flex items-center gap-3 mt-auto">
           <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-xs font-bold text-gray-700 dark:text-gray-300 ring-1 ring-gray-200 dark:ring-white/10">
             {course.instructor?.username?.[0]?.toUpperCase() || 'I'}
           </div>
           <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{course.instructor?.username || 'Instructor'}</span>
        </div>
      </div>
    </Link>
  );
}


