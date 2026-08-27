'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchAPI } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

export default function ManageBlogPage() {
  const { token, user } = useAuth();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Blog Form
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState('Draft');

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
    if (token) fetchBlogs();
  }, [token]);

  const handleCreateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchAPI('/blog-posts', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          data: {
            title,
            body,
            status,
            author: user?.id,
          }
        })
      });
      setTitle('');
      setBody('');
      setStatus('Draft');
      fetchBlogs();
    } catch (err) {
      alert('Failed to create blog post');
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    try {
      await fetchAPI(`/blog-posts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBlogs();
    } catch (err) {
      alert('Failed to delete blog post');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Published' ? 'Draft' : 'Published';
    try {
      await fetchAPI(`/blog-posts/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          data: { status: newStatus }
        })
      });
      fetchBlogs();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <ProtectedRoute allowedRoles={['Admin', 'Content Manager']}>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold">Manage Blog Posts</h2>
          <p className="text-gray-600 mt-2">Create, edit, and publish articles.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Create Blog Form */}
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border h-fit">
            <h3 className="text-xl font-semibold mb-4">New Article</h3>
            <form onSubmit={handleCreateBlog} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Content</label>
                <textarea required value={body} onChange={e => setBody(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md" rows={10}></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Initial Status</label>
                <select value={status} onChange={e => setStatus(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md">
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                </select>
              </div>
              <button type="submit" className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-semibold">
                Create Article
              </button>
            </form>
          </div>

          {/* Blogs List */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="loader">Loading...</div>
            ) : blogs.length === 0 ? (
              <p className="text-gray-500">No blog posts found.</p>
            ) : (
              blogs.map(blog => (
                <div key={blog.documentId} className="bg-white p-6 rounded-xl shadow-sm border flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-bold">{blog.title}</h4>
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${blog.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {blog.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{blog.body}</p>
                    <div className="text-xs text-gray-400 mt-3">
                      By {blog.author?.username || 'Unknown'} &bull; {new Date(blog.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-col justify-end gap-2 shrink-0">
                     <button onClick={() => handleToggleStatus(blog.documentId, blog.status)} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded border font-medium">
                       {blog.status === 'Published' ? 'Unpublish' : 'Publish'}
                     </button>
                     <button onClick={() => handleDeleteBlog(blog.documentId)} className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 text-sm rounded border border-red-100 font-medium">
                       Delete
                     </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
