'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchAPI } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function AdminDashboardPage() {
  const { token } = useAuth();
  
  const [stats, setStats] = useState({ users: 0, courses: 0, lessons: 0, enrollments: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch all necessary data to generate stats
        // Note: For large apps, use custom backend routes. For this project, fetching the lists is fine.
        const [usersRes, coursesRes, lessonsRes, enrollRes] = await Promise.all([
          fetchAPI('/users', { headers: { Authorization: `Bearer ${token}` } }),
          fetchAPI('/courses', { headers: { Authorization: `Bearer ${token}` } }),
          fetchAPI('/lessons', { headers: { Authorization: `Bearer ${token}` } }),
          fetchAPI('/enrollments', { headers: { Authorization: `Bearer ${token}` } })
        ]);

        setStats({
          users: usersRes.length || 0, // /users returns an array directly
          courses: coursesRes.data?.length || 0,
          lessons: lessonsRes.data?.length || 0,
          enrollments: enrollRes.data?.length || 0,
        });
      } catch (err) {
        console.error('Failed to load stats', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchStats();
  }, [token]);

  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold">Admin Dashboard</h2>
          <p className="text-gray-600 mt-2">Platform Overview and Statistics</p>
        </div>
        
        {loading ? (
          <div className="flex justify-center"><div className="loader"></div></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-l-4 border-l-blue-500">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Users</h3>
              <p className="text-4xl font-black mt-2 text-gray-800">{stats.users}</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-l-4 border-l-indigo-500">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Courses</h3>
              <p className="text-4xl font-black mt-2 text-gray-800">{stats.courses}</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-l-4 border-l-purple-500">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Lessons</h3>
              <p className="text-4xl font-black mt-2 text-gray-800">{stats.lessons}</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-l-4 border-l-green-500">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Enrollments</h3>
              <p className="text-4xl font-black mt-2 text-gray-800">{stats.enrollments}</p>
            </div>
          </div>
        )}

        <div className="bg-white p-8 rounded-xl shadow-sm border">
           <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
           <div className="flex flex-wrap gap-4">
             <a href="/dashboard/manage-courses" className="px-6 py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700">Manage Courses</a>
             <a href="/dashboard/blog" className="px-6 py-3 bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-700">Manage Blog</a>
             <a href="http://localhost:1337/admin" target="_blank" rel="noreferrer" className="px-6 py-3 bg-gray-800 text-white rounded-md font-semibold hover:bg-gray-900">
               Open Strapi Admin Panel &rarr;
             </a>
           </div>
           <p className="text-sm text-gray-500 mt-4">
             Note: Deep user management (changing roles, permissions) is securely handled via the Strapi CMS Admin Panel.
           </p>
        </div>
      </div>
    </ProtectedRoute>
  );
}
