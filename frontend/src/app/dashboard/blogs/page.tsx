'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchAPI } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function ManageBlogsPage() {
  const { token, user } = useAuth();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<any | null>(null);
  const [deletingBlog, setDeletingBlog] = useState<any | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    status: 'Draft',
  });
  const [saving, setSaving] = useState(false);

  const fetchBlogs = async () => {
    try {
      const res = await fetchAPI(`/blog-posts?populate=author`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBlogs(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchBlogs();
    }
  }, [token]);

  const openCreateModal = () => {
    setFormData({ title: '', content: '', status: 'Draft' });
    setEditingBlog(null);
    setIsModalOpen(true);
  };

  const openEditModal = (blog: any) => {
    setFormData({ 
      title: blog.title, 
      content: blog.content, 
      status: blog.status || 'Draft' 
    });
    setEditingBlog(blog);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingBlog) {
        await fetchAPI(`/blog-posts/${editingBlog.documentId}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({ data: formData })
        });
      } else {
        // Optional: populate author if we had user context in this scope
        await fetchAPI(`/blog-posts`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({ data: { ...formData, author: user?.id } })
        });
      }
      setIsModalOpen(false);
      fetchBlogs();
    } catch (err: any) {
      alert(`Failed to save blog post: ${err.message || err}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingBlog) return;
    setSaving(true);
    try {
      await fetchAPI(`/blog-posts/${deletingBlog.documentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeletingBlog(null);
      fetchBlogs();
    } catch (err) {
      alert('Failed to delete blog post');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['Admin', 'Content Manager']}>
      <div className="space-y-8 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Manage Blogs</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Write, edit, and publish articles.</p>
          </div>
          <button onClick={openCreateModal} className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
            Write Post
          </button>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-200/50 dark:border-slate-800/50 overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : blogs.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-blue-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-3xl mb-4 mx-auto">✍️</div>
              <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">No blog posts found</p>
              <p className="text-gray-500 dark:text-gray-400">Get started by writing your first article.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200/50 dark:border-slate-800/50 bg-gray-50/50 dark:bg-slate-800/50">
                    <th className="px-6 py-4 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Author</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800/50">
                  {blogs.map((blog) => (
                    <tr key={blog.documentId} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900 dark:text-white line-clamp-1 max-w-md">{blog.title}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-full border ${
                          blog.status === 'Published' ? 'bg-green-50 border-green-100 text-green-600 dark:bg-green-900/30 dark:border-green-800/50 dark:text-green-400' :
                          'bg-yellow-50 border-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:border-yellow-800/50 dark:text-yellow-400'
                        }`}>
                          {blog.status || 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {blog.author?.username || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openEditModal(blog)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                            Edit
                          </button>
                          <button onClick={() => setDeletingBlog(blog)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl w-full max-w-lg border border-gray-100 dark:border-slate-800 p-8 overflow-hidden relative">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {editingBlog ? 'Edit Blog Post' : 'Write New Post'}
              </h3>
              
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                  <input 
                    type="text" required 
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl dark:text-white"
                    value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content</label>
                  <textarea 
                    required rows={5}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl dark:text-white"
                    value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select 
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl dark:text-white"
                    value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                  </select>
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors" disabled={saving}>
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Post'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {deletingBlog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl w-full max-w-sm border border-gray-100 dark:border-slate-800 p-8 text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">⚠️</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Blog Post?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Are you sure you want to delete <span className="font-bold">{deletingBlog.title}</span>? This action cannot be undone.</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setDeletingBlog(null)} className="flex-1 px-5 py-2.5 bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white font-semibold rounded-xl" disabled={saving}>Cancel</button>
                <button onClick={handleDelete} className="flex-1 px-5 py-2.5 bg-red-600 text-white font-semibold rounded-xl disabled:opacity-50" disabled={saving}>{saving ? 'Deleting...' : 'Delete'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
