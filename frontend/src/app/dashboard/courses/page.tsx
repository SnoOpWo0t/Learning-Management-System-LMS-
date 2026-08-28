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
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-12 rounded-3xl border border-gray-200/50 dark:border-slate-800/50 text-center">
            <p className="text-xl text-gray-500 dark:text-gray-400">No courses available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {courses.map(course => (
              <div key={course.documentId} className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/50 dark:border-slate-800/50 overflow-hidden flex flex-col group hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
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
                       <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs shadow-inner">
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
