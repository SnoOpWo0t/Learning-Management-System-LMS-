'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchAPI } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function BrowseCoursesPage() {
  const { token, user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    try {
      const res = await fetchAPI(`/courses?populate=*`, {
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
    }
  };

  return (
    <ProtectedRoute allowedRoles={['Student', 'Admin']}>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold">Browse Courses</h2>
        
        {loading ? (
          <div className="loader">Loading...</div>
        ) : courses.length === 0 ? (
          <p className="text-gray-500">No courses available at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <div key={course.documentId} className="bg-white p-5 rounded-xl shadow-sm border flex flex-col justify-between">
                <div>
                  <h4 className="text-lg font-bold">{course.title}</h4>
                  <span className="inline-block px-2 py-1 mt-2 text-xs font-semibold text-green-800 bg-green-100 rounded-full">{course.difficulty}</span>
                  <p className="mt-3 text-sm text-gray-600 line-clamp-3">{course.description}</p>
                </div>
                <div className="mt-6 flex justify-between items-center">
                   <button onClick={() => handleEnroll(course.documentId)} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium w-full">
                     Enroll Now
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
