'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchAPI } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useParams } from 'next/navigation';

export default function ManageCourseDetailsPage() {
  const { token } = useAuth();
  const params = useParams();
  const courseId = params.id as string;
  
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Lesson Form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [order, setOrder] = useState<number>(1);

  const fetchCourseData = async () => {
    try {
      const res = await fetchAPI(`/courses/${courseId}?populate=lessons`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourse(res.data);
      setLessons(res.data?.lessons || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && courseId) fetchCourseData();
  }, [token, courseId]);

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchAPI('/lessons', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          data: {
            title,
            content,
            order: Number(order),
            course: courseId,
          }
        })
      });
      setTitle('');
      setContent('');
      setOrder(order + 1);
      fetchCourseData();
    } catch (err) {
      alert('Failed to create lesson');
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;
    try {
      await fetchAPI(`/lessons/${lessonId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCourseData();
    } catch (err) {
      alert('Failed to delete lesson');
    }
  };

  return (
    <ProtectedRoute allowedRoles={['Admin', 'Content Manager', 'Instructor']}>
      <div className="space-y-6">
        {loading ? (
          <div className="loader">Loading...</div>
        ) : !course ? (
          <p className="text-red-500">Course not found.</p>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">Manage Course: {course.title}</h2>
              <a href={`/dashboard/manage-courses/${courseId}/quiz`} className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 font-medium">
                Manage Quiz
              </a>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Create Lesson Form */}
              <div className="bg-white p-6 rounded-xl shadow-sm border h-fit">
                <h3 className="text-xl font-semibold mb-4">Add New Lesson</h3>
                <form onSubmit={handleCreateLesson} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Lesson Title</label>
                    <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Order</label>
                    <input required type="number" value={order} onChange={e => setOrder(Number(e.target.value))} className="mt-1 block w-full px-3 py-2 border rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Content</label>
                    <textarea required value={content} onChange={e => setContent(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md" rows={5}></textarea>
                  </div>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Add Lesson
                  </button>
                </form>
              </div>

              {/* Lesson List */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Lessons ({lessons.length})</h3>
                {lessons.length === 0 ? (
                  <p className="text-gray-500">No lessons added yet.</p>
                ) : (
                  lessons.sort((a,b) => a.order - b.order).map(lesson => (
                    <div key={lesson.documentId} className="bg-white p-4 rounded-xl shadow-sm border flex justify-between items-center">
                      <div>
                        <span className="font-bold text-gray-500 mr-3">#{lesson.order}</span>
                        <span className="font-semibold">{lesson.title}</span>
                      </div>
                      <button onClick={() => handleDeleteLesson(lesson.documentId)} className="text-red-600 hover:underline text-sm font-medium">Delete</button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
