import { fetchAPI } from '@/lib/api';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PublicNavbar from '@/components/PublicNavbar';
import Footer from '@/components/Footer';
import EnrollButton from '@/components/EnrollButton';

export const dynamic = 'force-dynamic';

export default async function PublicCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  let course;
  try {
    const res = await fetchAPI(`/courses/${id}?populate[0]=instructor&populate[1]=lessons&populate[2]=course_ratings.student`);
    course = res.data;
  } catch (err) {
    console.error('Failed to fetch course');
  }

  if (!course) {
    notFound();
  }

  // Sort lessons safely if they exist
  const lessons = (course.lessons || []).sort((a: any, b: any) => a.order - b.order);

  // Calculate Ratings
  const ratings = course.course_ratings || [];
  const averageRating = ratings.length > 0 
    ? (ratings.reduce((acc: number, curr: any) => acc + curr.rating, 0) / ratings.length).toFixed(1)
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0A0A0A] text-gray-900 dark:text-white transition-colors duration-300">
      <PublicNavbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-12 flex flex-col lg:flex-row gap-8">
        
        {/* Main Content Area */}
        <div className="flex-1 space-y-12">
          {/* Header Info - Hero Style */}
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-b from-gray-900 to-black dark:from-[#111] dark:to-black border border-gray-200 dark:border-white/10 shadow-2xl p-8 md:p-14">
            {/* Glow effects */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/20 blur-[100px] rounded-full pointer-events-none -translate-x-1/3 translate-y-1/3" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center px-4 py-1.5 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-full mb-6 border border-blue-500/20 uppercase tracking-widest backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse" />
                {course.difficulty} Level
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-6 tracking-tight leading-[1.1]">
                {course.title}
              </h1>
              
              {/* Rating Summary Display */}
              <div className="flex items-center gap-3 mb-8">
                <div className="flex items-center px-3 py-1.5 bg-yellow-500/10 rounded-full border border-yellow-500/20 backdrop-blur-md shadow-inner">
                  <span className="font-black text-yellow-400 mr-2">{averageRating || '0.0'}</span>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-4 h-4 ${i < Math.round(Number(averageRating || 0)) ? 'fill-current drop-shadow-md' : 'text-gray-700'}`} viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-400">({ratings.length} reviews)</span>
              </div>

              <p className="text-lg md:text-xl text-gray-300 whitespace-pre-wrap leading-relaxed max-w-3xl mb-12">
                {course.description}
              </p>
              
              <div className="inline-flex items-center gap-4 bg-white/5 dark:bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                <div 
                  className="flex-none rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-xl font-black shadow-lg ring-2 ring-white/20 overflow-hidden"
                  style={{ width: '48px', height: '48px', minWidth: '48px', minHeight: '48px', flexShrink: 0 }}
                >
                  {course.instructor?.username?.[0]?.toUpperCase() || 'I'}
                </div>
                <div className="flex flex-col justify-center pr-4">
                  <p className="text-xs text-gray-400 font-bold tracking-widest uppercase mb-0.5">Taught by</p>
                  <p className="text-lg font-bold text-white leading-none">{course.instructor?.username || 'Unknown Instructor'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Syllabus */}
          <div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-8 tracking-tight flex items-center gap-3">
              <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              Course Syllabus
            </h2>
            {lessons.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 italic bg-gray-50 dark:bg-white/5 p-8 rounded-3xl border border-gray-100 dark:border-white/10 shadow-inner">No lessons published yet.</p>
            ) : (
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-7 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-blue-500 before:via-purple-500 before:to-transparent">
                {lessons.map((lesson: any, index: number) => (
                  <div key={lesson.documentId} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                    <div className="flex items-center justify-center w-14 h-14 rounded-full border-4 border-white dark:border-[#0A0A0A] bg-blue-50 dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xl z-10 shrink-0 md:mx-auto group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                      <span className="font-black text-lg">{index + 1}</span>
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-white dark:bg-[#111] p-6 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm hover:shadow-xl hover:border-blue-400/50 hover:-translate-y-1 transition-all duration-300">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{lesson.title}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 font-medium flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Video & Article Content
                          </p>
                        </div>
                        <div className="text-gray-300 dark:text-gray-600 bg-gray-50 dark:bg-black p-2.5 rounded-full shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reviews Section */}
          <div className="pt-10">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-8 tracking-tight flex items-center gap-3">
              <svg className="w-8 h-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
              Student Reviews
            </h2>
            {ratings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ratings.map((r: any) => (
                  <div key={r.id} className="bg-white dark:bg-[#111] p-8 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                      <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
                    </div>
                    <div className="flex items-center gap-4 mb-5 relative z-10">
                      <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 flex items-center justify-center font-black text-xl ring-2 ring-white dark:ring-black">
                        {r.student?.username?.[0]?.toUpperCase() || 'S'}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-lg">{r.student?.username || 'Student'}</p>
                        <div className="flex text-yellow-400 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className={`w-4 h-4 ${i < r.rating ? 'fill-current' : 'text-gray-200 dark:text-gray-700'}`} viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                    {r.review && (
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed relative z-10 italic">"{r.review}"</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic bg-gray-50 dark:bg-white/5 p-8 rounded-3xl border border-gray-100 dark:border-white/10 shadow-inner text-center">
                No reviews yet. Be the first to rate this course after completing it!
              </p>
            )}
          </div>
        </div>

        {/* Sidebar Enrollment CTA */}
        <div className="lg:w-[22rem] relative">
          <div className="sticky top-28 bg-white dark:bg-[#111] p-8 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-white/10 flex flex-col gap-6 text-center before:absolute before:inset-0 before:rounded-[2rem] before:bg-gradient-to-b before:from-white/5 before:to-transparent before:pointer-events-none">
            <div className="relative aspect-video w-full bg-blue-50 dark:bg-black rounded-2xl overflow-hidden mb-2 shadow-inner ring-1 ring-black/5 dark:ring-white/10 group">
               <img 
                 src={`https://picsum.photos/seed/${id}/400/300`} 
                 alt={course.title} 
                 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white">
                   <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                 </div>
               </div>
            </div>
            
            <div>
              <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 tracking-tight">Free</p>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-500 mt-2 uppercase tracking-widest">Full lifetime access</p>
            </div>
            
            <EnrollButton courseId={id} />
            
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-4 mt-6 pt-6 border-t border-gray-100 dark:border-white/10 font-medium text-left px-2">
              <p className="flex items-center gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500/10 text-green-500"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></span> 
                Expert Instruction
              </p>
              <p className="flex items-center gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500/10 text-green-500"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></span> 
                Progress Tracking
              </p>
              <p className="flex items-center gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500/10 text-green-500"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></span> 
                Assessment Quizzes
              </p>
              <p className="flex items-center gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500/10 text-green-500"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></span> 
                Course Reviews
              </p>
            </div>
          </div>
        </div>
        
      </main>
      
      <Footer />
    </div>
  );
}
