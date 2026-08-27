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
      <div className="space-y-6">
        <h2 className="text-3xl font-bold">My Courses</h2>
        
        {loading ? (
          <div className="loader">Loading...</div>
        ) : enrollments.length === 0 ? (
          <p className="text-gray-500">You are not enrolled in any courses yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map(enrollment => {
              const course = enrollment.course;
              if (!course) return null;
              
              return (
                <div key={enrollment.documentId} className="bg-white p-5 rounded-xl shadow-sm border flex flex-col justify-between">
                  <div>
                    <h4 className="text-lg font-bold">{course.title}</h4>
                    <span className="inline-block px-2 py-1 mt-2 text-xs font-semibold text-purple-800 bg-purple-100 rounded-full">{course.difficulty}</span>
                    <p className="mt-3 text-sm text-gray-600 line-clamp-3">{course.description}</p>
                  </div>
                  <div className="mt-6">
                     <Link href={`/dashboard/learn/${course.documentId}`} className="block text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium w-full">
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
