'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchAPI } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function BrowseCoursesPage() {
  const { token, user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);

  const fetchCourses = async () => {
    try {
      const res = await fetchAPI(`/courses?populate=instructor`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourses(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCourses();
    }
  }, [token]);

  const handleEnroll = async (courseId: string) => {
    setEnrolling(courseId);
    try {
      await fetchAPI('/enrollments', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          data: {
            student: user?.id,
            course: courseId
          }
        })
      });
      alert('Successfully enrolled!');
    } catch (err) {
      alert('Enrollment failed. You might already be enrolled.');
    } finally {
      setEnrolling(null);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['Student', 'Admin']}>
      <div className="space-y-8 pb-8">
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Browse Courses</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Discover new topics and expand your skillset.</p>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-20 animate-fade-in">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-16 rounded-3xl border border-gray-200/50 dark:border-slate-800/50 text-center animate-slide-up shadow-sm">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Courses Found</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">Check back later for new content! Our instructors are currently preparing amazing courses.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 animate-fade-in">
            {courses.map((course, index) => (
              <div key={course.documentId} style={{ animationDelay: `${index * 50}ms` }} className="animate-slide-up bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/50 dark:border-slate-800/50 overflow-hidden flex flex-col group hover-lift opacity-0">
                <div className="aspect-video w-full bg-gray-200 dark:bg-slate-800 relative overflow-hidden">
                  <img src={`https://picsum.photos/seed/${course.documentId}/400/300`} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-gray-800 dark:text-white shadow-sm">
                    {course.difficulty}
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-1">
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">{course.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 mb-6 flex-1">{course.description}</p>
                  
                  <div className="pt-4 mt-auto border-t border-gray-100 dark:border-slate-800/50 flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 font-medium">
                       <div 
                         className="rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs shadow-inner"
                         style={{ width: '24px', height: '24px', minWidth: '24px', minHeight: '24px', flexShrink: 0 }}
                       >
                         {course.instructor?.username?.[0]?.toUpperCase() || 'I'}
                       </div>
                       {course.instructor?.username || 'Instructor'}
                    </div>
                    <button 
                      onClick={() => handleEnroll(course.documentId)} 
                      disabled={enrolling === course.documentId}
                      className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                    >
                      {enrolling === course.documentId ? 'Enrolling...' : 'Enroll Now'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
