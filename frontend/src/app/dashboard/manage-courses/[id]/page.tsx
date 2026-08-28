'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchAPI } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export default function CourseLessonsPage() {
  const { token, user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any | null>(null);
  const [deletingLesson, setDeletingLesson] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    videoUrl: '',
    order: 1
  });

  const fetchCourseData = async () => {
    try {
      const res = await fetchAPI(`/courses/${courseId}?populate=lessons`);
      setCourse(res.data);
      const sortedLessons = (res.data.lessons || []).sort((a: any, b: any) => a.order - b.order);
      setLessons(sortedLessons);
    } catch (err) {
      console.error(err);
      alert('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && courseId) {
      fetchCourseData();
    }
  }, [token, courseId]);

  const openCreateModal = () => {
    const nextOrder = lessons.length > 0 ? Math.max(...lessons.map(l => l.order)) + 1 : 1;
    setFormData({ title: '', content: '', videoUrl: '', order: nextOrder });
    setEditingLesson(null);
    setIsModalOpen(true);
  };

  const openEditModal = (lesson: any) => {
    setFormData({ 
      title: lesson.title, 
      content: lesson.content || '', 
      videoUrl: lesson.videoUrl || '', 
      order: lesson.order 
    });
    setEditingLesson(lesson);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payloadData = { ...formData, course: courseId };
      
      if (editingLesson) {
        await fetchAPI(`/lessons/${editingLesson.documentId}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({ data: payloadData })
        });
      } else {
        await fetchAPI(`/lessons`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({ data: payloadData })
        });
      }
      setIsModalOpen(false);
      fetchCourseData();
    } catch (err: any) {
      alert(`Failed to save lesson: ${err.message || err}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingLesson) return;
    setSaving(true);
    try {
      await fetchAPI(`/lessons/${deletingLesson.documentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeletingLesson(null);
      fetchCourseData();
    } catch (err: any) {
      alert(`Failed to delete lesson: ${err.message || err}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['Admin', 'Content Manager', 'Instructor']}>
      <div className="space-y-8 pb-8 max-w-5xl mx-auto">
        
        <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
          <Link href="/dashboard/manage-courses" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1 font-medium text-sm">
            ← Back to Courses
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : !course ? (
          <div className="p-12 text-center bg-white/80 dark:bg-slate-900/80 rounded-3xl">
            <h3 className="text-xl font-bold">Course not found</h3>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-gray-200/50 dark:border-slate-800/50">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 text-xs font-bold text-indigo-800 dark:text-indigo-200 bg-indigo-100 dark:bg-indigo-900/60 rounded-full">
                    {course.difficulty}
                  </span>
                </div>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{course.title}</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2 line-clamp-2 max-w-2xl">{course.description}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Link href={`/dashboard/manage-courses/${courseId}/quiz`} className="px-6 py-3 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-semibold rounded-2xl hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  Manage Quiz
                </Link>
                <button onClick={openCreateModal} className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-2xl hover:bg-blue-700 shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                  Add Lesson
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white px-2">Course Lessons</h3>
              
              {lessons.length === 0 ? (
                <div className="bg-white/50 dark:bg-slate-900/50 border border-dashed border-gray-300 dark:border-slate-700 rounded-3xl p-12 text-center">
                  <div className="w-16 h-16 bg-blue-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">No lessons yet</p>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">Add your first lesson to start building this course.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {lessons.map((lesson) => (
                    <div key={lesson.documentId} className="group bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-800 hover:shadow-md transition-all flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center font-black text-xl text-gray-400 dark:text-slate-500 shrink-0">
                        {lesson.order}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white truncate">{lesson.title}</h4>
                        <div className="flex gap-4 mt-2">
                          {lesson.videoUrl && (
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                              Video
                            </span>
                          )}
                          {lesson.content && (
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                              Text Article
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(lesson)} className="p-2.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        </button>
                        <button onClick={() => setDeletingLesson(lesson)} className="p-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Modal for Create/Edit */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl border border-gray-100 dark:border-slate-800 p-8 overflow-hidden relative max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {editingLesson ? 'Edit Lesson' : 'Add Lesson'}
              </h3>
              
              <form onSubmit={handleSave} className="space-y-5">
                <div className="flex gap-4">
                  <div className="w-24">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Order</label>
                    <input 
                      type="number" required min="1"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      value={formData.order} onChange={e => setFormData({...formData, order: parseInt(e.target.value) || 1})}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Lesson Title</label>
                    <input 
                      type="text" required placeholder="e.g. Introduction to React"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Video URL (Optional)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                    </div>
                    <input 
                      type="url" placeholder="https://youtube.com/..."
                      className="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      value={formData.videoUrl} onChange={e => setFormData({...formData, videoUrl: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Text Content</label>
                  <textarea 
                    rows={8} placeholder="Write your lesson content here..."
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                    value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})}
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 dark:border-slate-800 mt-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors" disabled={saving}>
                    Cancel
                  </button>
                  <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Lesson'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {deletingLesson && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm border border-gray-100 dark:border-slate-800 p-8 text-center relative overflow-hidden">
              <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Delete Lesson?</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8">This will permanently remove <span className="font-bold text-gray-700 dark:text-gray-300">{deletingLesson.title}</span>. This action cannot be undone.</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setDeletingLesson(null)} className="flex-1 px-5 py-3 bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors" disabled={saving}>Keep It</button>
                <button onClick={handleDelete} className="flex-1 px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 shadow-sm shadow-red-600/20" disabled={saving}>{saving ? 'Deleting...' : 'Delete'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
