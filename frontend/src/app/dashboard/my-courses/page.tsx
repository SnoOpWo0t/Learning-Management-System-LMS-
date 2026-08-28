'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchAPI } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

export default function MyCoursesPage() {
  const { token, user } = useAuth();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEnrollments = async () => {
    try {
      // In Strapi v5, we populate course to get course details
      const query = `?filters[student][id][$eq]=${user?.id}&populate=course`;
      const res = await fetchAPI(`/enrollments${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEnrollments(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && user) {
      fetchEnrollments();
    }
  }, [token, user]);

  return (
    <ProtectedRoute allowedRoles={['Student']}>
      <div className="space-y-8 pb-8">
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">My Courses</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Pick up right where you left off.</p>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : enrollments.length === 0 ? (
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-12 rounded-3xl border border-gray-200/50 dark:border-slate-800/50 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-3xl mb-4">📚</div>
            <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">No active courses</p>
            <p className="text-gray-500 dark:text-gray-400 mb-6">You are not enrolled in any courses yet.</p>
            <Link href="/dashboard/courses" className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {enrollments.map(enrollment => {
              const course = enrollment.course;
              if (!course) return null;
              
              return (
                <div key={enrollment.documentId} className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-gray-200/50 dark:border-slate-800/50 flex flex-col group hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/20 hover:border-blue-500/50 transition-all duration-500">
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-inner group-hover:scale-110 transition-transform">
                        {course.title[0]}
                      </div>
                      <span className="inline-block px-2.5 py-1 text-xs font-bold text-purple-800 dark:text-purple-200 bg-purple-100 dark:bg-purple-900/60 rounded-full">
                        {course.difficulty}
                      </span>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">{course.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 mb-6">{course.description}</p>
                  </div>
                  
                  <div className="mt-6 space-y-4">
                     <div className="h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-500 w-[15%] rounded-full"></div>
                     </div>
                     <Link href={`/dashboard/courses/${course.documentId}/learn`} className="block text-center px-4 py-3 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/40 hover:text-blue-600 dark:hover:text-blue-400 text-sm font-bold w-full transition-colors border border-gray-200/50 dark:border-slate-700/50">
                       Continue Learning
                     </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
