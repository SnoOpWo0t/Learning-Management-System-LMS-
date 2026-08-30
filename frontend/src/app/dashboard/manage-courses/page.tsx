'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchAPI } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

export default function ManageCoursesPage() {
  const { token, user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<any | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'Beginner',
  });
  const [saving, setSaving] = useState(false);

  const fetchCourses = async () => {
    try {
      let query = '?populate=instructor';
      // Backend automatically enforces Instructors seeing only their courses via the find override.
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

  const openCreateModal = () => {
    setFormData({ title: '', description: '', difficulty: 'Beginner' });
    setEditingCourse(null);
    setIsModalOpen(true);
  };

  const openEditModal = (course: any) => {
    setFormData({ 
      title: course.title, 
      description: course.description, 
      difficulty: course.difficulty || 'Beginner' 
    });
    setEditingCourse(course);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingCourse) {
        await fetchAPI(`/courses/${editingCourse.documentId}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({ data: formData })
        });
      } else {
        await fetchAPI(`/courses`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({ data: { ...formData, instructor: user?.id } })
        });
      }
      setIsModalOpen(false);
      fetchCourses();
    } catch (err: any) {
      alert(`Failed to save course: ${err.message || err}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCourse) return;
    setSaving(true);
    try {
      await fetchAPI(`/courses/${deletingCourse.documentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeletingCourse(null);
      fetchCourses();
    } catch (err: any) {
      alert(`Failed to delete course: ${err?.message || err}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['Admin', 'Content Manager', 'Instructor']}>
      <div className="space-y-8 pb-12 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl p-8 rounded-[2rem] shadow-sm border border-gray-200/50 dark:border-slate-800/50">
          <div>
            <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Manage Courses</h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 mt-2 font-medium">Create, edit, and orchestrate educational content.</p>
          </div>
          <button onClick={openCreateModal} className="px-6 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
            Create Course
          </button>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-32">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : courses.length === 0 ? (
            <div className="p-16 text-center bg-white/40 dark:bg-slate-900/40 rounded-[2rem] border border-dashed border-gray-300 dark:border-slate-700">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-4xl mb-6 mx-auto">📚</div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No courses found</p>
              <p className="text-lg text-gray-500 dark:text-gray-400">You haven't created any courses yet. Click "Create Course" to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {courses.map((course) => (
                <div key={course.documentId} className="group bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-slate-800/80 hover:shadow-xl hover:border-blue-100 dark:hover:border-blue-900/50 transition-all flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative overflow-hidden">
                  
                  {/* Left Side: Image & Text */}
                  <div className="flex items-start sm:items-center gap-6 flex-1">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gray-100 dark:bg-slate-800 overflow-hidden shrink-0 shadow-sm border border-gray-200/50 dark:border-slate-700/50">
                      <img src={`https://picsum.photos/seed/${course.documentId}/200/200`} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span className={`inline-flex items-center px-3 py-1 text-xs font-black rounded-full border ${
                          course.difficulty === 'Beginner' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/50' :
                          course.difficulty === 'Intermediate' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50' :
                          'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50'
                        }`}>
                          {course.difficulty}
                        </span>
                        <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                          {course.instructor?.username || 'Unknown'}
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-tight mb-2 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{course.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 max-w-3xl leading-relaxed">{course.description}</p>
                    </div>
                  </div>

                  {/* Right Side: Actions Grid */}
                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <div className="flex bg-gray-50 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-gray-100 dark:border-slate-800">
                      <Link href={`/dashboard/manage-courses/${course.documentId}/students`} className="px-4 py-2.5 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-xl transition-all flex items-center gap-2 font-bold text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                        <span className="hidden sm:inline">Progress</span>
                      </Link>
                      <Link href={`/dashboard/manage-courses/${course.documentId}`} className="px-4 py-2.5 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-xl transition-all flex items-center gap-2 font-bold text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                        <span className="hidden sm:inline">Lessons & Quiz</span>
                      </Link>
                    </div>
                    
                    <div className="flex bg-gray-50 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-gray-100 dark:border-slate-800">
                      <button onClick={() => openEditModal(course)} className="p-2.5 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all shadow-sm opacity-60 hover:opacity-100" title="Edit Course">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                      </button>
                      <button onClick={() => setDeletingCourse(course)} className="p-2.5 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all shadow-sm opacity-60 hover:opacity-100" title="Delete Course">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  </div>
                  
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg border border-gray-100 dark:border-slate-800 overflow-hidden relative transform transition-all scale-100 opacity-100">
              
              <div className="px-8 py-6 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/30 flex justify-between items-center">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                  {editingCourse ? 'Edit Course' : 'Create New Course'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
              
              <form onSubmit={handleSave} className="p-8 space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Course Title</label>
                  <input 
                    type="text" required placeholder="E.g., Introduction to React"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium"
                    value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                  <textarea 
                    required rows={4} placeholder="What will students learn?"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                    value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Difficulty Level</label>
                  <div className="relative">
                    <select 
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none font-medium"
                      value={formData.difficulty} onChange={e => setFormData({...formData, difficulty: e.target.value})}
                    >
                      <option value="Beginner">Beginner (100 Level)</option>
                      <option value="Intermediate">Intermediate (200 Level)</option>
                      <option value="Advanced">Advanced (300 Level)</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-6 border-t border-gray-100 dark:border-slate-800 mt-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors" disabled={saving}>
                    Cancel
                  </button>
                  <button type="submit" className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 hover:shadow-lg transition-all disabled:opacity-50" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Course'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {deletingCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-sm border border-gray-100 dark:border-slate-800 p-10 text-center transform transition-all scale-100 opacity-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
              <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">Delete Course?</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">You are about to permanently delete <span className="font-bold text-gray-900 dark:text-white">"{deletingCourse.title}"</span>. This action cannot be undone.</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setDeletingCourse(null)} className="flex-1 px-6 py-3.5 bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors" disabled={saving}>Cancel</button>
                <button onClick={handleDelete} className="flex-1 px-6 py-3.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/20 transition-all disabled:opacity-50" disabled={saving}>{saving ? 'Deleting...' : 'Delete Permanently'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
