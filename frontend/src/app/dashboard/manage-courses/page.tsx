'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchAPI } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function ManageCoursesPage() {
  const { token, user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Course Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('Beginner');

  const fetchCourses = async () => {
    try {
      // In Strapi v5, filtering might need specific syntax. For simplicity, we just fetch them.
      // Strapi's custom controller handles RBAC on actions, but for fetching, we should 
      // ideally filter by instructor if role is Instructor.
      let query = '?populate=*';
      if (user?.roleType === 'Instructor') {
        query += `&filters[instructor][id][$eq]=${user.id}`;
      }
      
      const res = await fetchAPI(`/courses${query}`, {
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
    if (token && user) {
      fetchCourses();
    }
  }, [token, user]);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchAPI('/courses', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          data: {
            title,
            description,
            difficulty,
            instructor: user?.id,
          }
        })
      });
      setTitle('');
      setDescription('');
      fetchCourses();
    } catch (err) {
      alert('Failed to create course');
    }
  };

  const handleDeleteCourse = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
      await fetchAPI(`/courses/${documentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCourses();
    } catch (err) {
      alert('Failed to delete course');
    }
  };

  return (
    <ProtectedRoute allowedRoles={['Admin', 'Content Manager', 'Instructor']}>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold">Manage Courses</h2>
        
        {/* Create Course Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-xl font-semibold mb-4">Create New Course</h3>
          <form onSubmit={handleCreateCourse} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700">Course Title</label>
              <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md" rows={3}></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Difficulty</label>
              <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md">
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Create Course
            </button>
          </form>
        </div>

        {/* Course List */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Your Courses</h3>
          {loading ? (
            <div className="loader">Loading...</div>
          ) : courses.length === 0 ? (
            <p className="text-gray-500">No courses found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map(course => (
                <div key={course.documentId} className="bg-white p-5 rounded-xl shadow-sm border flex flex-col justify-between">
                  <div>
                    <h4 className="text-lg font-bold">{course.title}</h4>
                    <span className="inline-block px-2 py-1 mt-2 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">{course.difficulty}</span>
                    <p className="mt-3 text-sm text-gray-600 line-clamp-3">{course.description}</p>
                  </div>
                  <div className="mt-6 flex justify-between items-center">
                     <a href={`/dashboard/manage-courses/${course.documentId}`} className="text-blue-600 hover:underline text-sm font-medium">Manage Lessons</a>
                     <button onClick={() => handleDeleteCourse(course.documentId)} className="text-red-600 hover:underline text-sm font-medium">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
