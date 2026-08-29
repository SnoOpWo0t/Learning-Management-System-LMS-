import Link from 'next/link';
import { fetchAPI } from '@/lib/api';
import PublicNavbar from '@/components/PublicNavbar';
import Footer from '@/components/Footer';

export const revalidate = 0;

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
    Other: courses.filter((c: any) => !['Beginner', 'Intermediate', 'Advanced'].includes(c.difficulty)),
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0A0A0A] text-gray-900 dark:text-white font-sans selection:bg-blue-600 selection:text-white transition-colors duration-300">
      <PublicNavbar />

      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="relative w-full pt-28 pb-16 lg:pt-36 lg:pb-24 px-6 flex flex-col items-center text-center overflow-hidden">
          {/* Subtle Glow Effects */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/10 dark:bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-500/10 dark:bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
            <div className="badge badge-blue mb-8">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              Over {courses.length || '50'}+ Premium Courses
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
              <Link href="/register" className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white font-semibold rounded-full text-base hover:bg-blue-700 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-1 flex items-center justify-center gap-2">
                Start Learning Free
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </Link>
              <Link href="/dashboard" className="w-full sm:w-auto px-8 py-4 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-full font-semibold text-base hover:bg-gray-200 dark:hover:bg-white/10 transition-all duration-300 flex items-center justify-center backdrop-blur-sm shadow-sm hover:-translate-y-0.5">
                Explore Dashboard
              </Link>
            </div>
          </div>
        </section>

        {/* Courses Catalog Section */}
        <section className="py-16 md:py-24 px-6 bg-gray-50/50 dark:bg-transparent text-gray-900 dark:text-white relative z-20 border-t border-gray-200/80 dark:border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="mb-14 max-w-3xl">
              <div className="badge badge-blue mb-4">
                Course Directory
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Curated Learning Paths</h2>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400">Structured curriculums designed to take you from beginner to industry-ready professional.</p>
            </div>

            {courses.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10">
                <p className="text-lg font-medium text-gray-500 dark:text-gray-400">No courses available at the moment.</p>
              </div>
            ) : (
              <div className="space-y-20">
                {categorizedCourses.Beginner.length > 0 && (
                  <CategorySection 
                    title="Beginner Essentials" 
                    subtitle="Fundamental concepts and foundational engineering skills"
                    level="Beginner"
                    badgeColor="emerald"
                    courses={categorizedCourses.Beginner} 
                  />
                )}
                {categorizedCourses.Intermediate.length > 0 && (
                  <CategorySection 
                    title="Intermediate Skills" 
                    subtitle="Hands-on system architecture, databases, and advanced tools"
                    level="Intermediate"
                    badgeColor="amber"
                    courses={categorizedCourses.Intermediate} 
                  />
                )}
                {categorizedCourses.Advanced.length > 0 && (
                  <CategorySection 
                    title="Advanced Mastery" 
                    subtitle="Deep-dive engineering, high-scale performance, and refactoring"
                    level="Advanced"
                    badgeColor="purple"
                    courses={categorizedCourses.Advanced} 
                  />
                )}
                {categorizedCourses.Other.length > 0 && (
                  <CategorySection 
                    title="Specialized Tracks" 
                    subtitle="Specialized topics and elective study modules"
                    level="General"
                    badgeColor="blue"
                    courses={categorizedCourses.Other} 
                  />
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Reusable Footer Component */}
      <Footer />
    </div>
  );
}

function CategorySection({ 
  title, 
  subtitle, 
  level, 
  badgeColor, 
  courses 
}: { 
  title: string; 
  subtitle: string; 
  level: string; 
  badgeColor: string; 
  courses: any[];
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-4 border-b border-gray-200 dark:border-white/10">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{title}</h3>
            <span className="badge badge-blue text-xs">
              {courses.length} {courses.length === 1 ? 'course' : 'courses'}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course: any) => (
          <CourseCard key={course.documentId} course={course} />
        ))}
      </div>
    </div>
  );
}

function CourseCard({ course }: { course: any }) {
  const getDifficultyBadgeClass = (diff: string) => {
    switch (diff) {
      case 'Beginner':
        return 'badge-green';
      case 'Intermediate':
        return 'badge-amber';
      case 'Advanced':
        return 'badge-purple';
      default:
        return 'badge-blue';
    }
  };

  return (
    <Link 
      href={`/courses/${course.documentId}`} 
      className="group flex flex-col h-full bg-white dark:bg-[#111] rounded-2xl overflow-hidden border border-gray-200/80 dark:border-white/10 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-400 dark:hover:border-blue-500/40 hover:-translate-y-1.5 transition-all duration-300"
    >
      {/* Card Header Image / Banner */}
      <div className="h-48 w-full bg-gradient-to-br from-gray-800 to-gray-950 relative overflow-hidden shrink-0">
        <img 
          src={`https://picsum.photos/seed/${course.documentId}/800/450`} 
          alt={course.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out opacity-90 group-hover:opacity-100"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Difficulty Badge */}
        <div className="absolute top-3 left-3">
          <span className={`badge ${getDifficultyBadgeClass(course.difficulty || 'Beginner')}`}>
            {course.difficulty || 'Beginner'}
          </span>
        </div>
      </div>
      
      {/* Card Body - flex-1 for consistent height */}
      <div className="p-6 flex flex-col flex-1 justify-between gap-4">
        <div>
          <h4 className="text-xl font-bold text-gray-900 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 min-h-[3.25rem]">
            {course.title}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed mt-2 min-h-[2.5rem]">
            {course.description}
          </p>
        </div>
        
        {/* Card Footer */}
        <div className="pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-black ring-1 ring-blue-100 dark:ring-blue-800 shrink-0"
            >
              {course.instructor?.username?.[0]?.toUpperCase() || 'I'}
            </div>
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 truncate max-w-[130px]">
              {course.instructor?.username || 'Instructor'}
            </span>
          </div>

          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-300">
            View Course
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path>
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}


