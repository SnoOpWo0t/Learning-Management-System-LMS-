'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchAPI } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function UserManagementPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [previewUser, setPreviewUser] = useState<any | null>(null);
  const [deleteUser, setDeleteUser] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (token) {
      fetchUsersAndRoles();
    }
  }, [token]);

  const fetchUsersAndRoles = async () => {
    try {
      const [usersRes, rolesRes] = await Promise.all([
        fetchAPI('/users?populate=role', { headers: { Authorization: `Bearer ${token}` } }),
        fetchAPI('/users-permissions/roles', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setUsers(usersRes || []);
      setRoles(rolesRes.roles || []);
    } catch (err) {
      console.error('Failed to fetch users or roles', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, roleId: number) => {
    setUpdating(userId);
    try {
      await fetchAPI(`/users/${userId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role: roleId })
      });
      // Update local state
      setUsers(users.map(u => {
        if (u.id === userId) {
          const newRole = roles.find(r => r.id === roleId);
          return { ...u, role: newRole };
        }
        return u;
      }));
    } catch (err) {
      alert('Failed to update user role');
    } finally {
      setUpdating(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUser) return;
    setIsDeleting(true);
    try {
      await fetchAPI(`/users/${deleteUser.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.filter(u => u.id !== deleteUser.id));
      setDeleteUser(null);
    } catch (err) {
      alert('Failed to delete user. Ensure they do not have dependent records or you have proper permissions.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <div className="space-y-8 pb-8">
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">User Management</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Manage user accounts and role-based permissions.</p>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-200/50 dark:border-slate-800/50 overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200/50 dark:border-slate-800/50 bg-gray-50/50 dark:bg-slate-800/50">
                    <th className="px-6 py-4 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800/50">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shadow-inner">
                            {u.username[0].toUpperCase()}
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-white">{u.username}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-full border ${
                          u.role?.name === 'Admin' ? 'bg-red-50 border-red-100 text-red-600 dark:bg-red-900/30 dark:border-red-800/50 dark:text-red-400' :
                          u.role?.name === 'Content Manager' ? 'bg-purple-50 border-purple-100 text-purple-600 dark:bg-purple-900/30 dark:border-purple-800/50 dark:text-purple-400' :
                          u.role?.name === 'Instructor' ? 'bg-blue-50 border-blue-100 text-blue-600 dark:bg-blue-900/30 dark:border-blue-800/50 dark:text-blue-400' :
                          'bg-gray-100 border-gray-200 text-gray-600 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-300'
                        }`}>
                          {u.role?.name || 'No Role'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <select 
                          className="text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white disabled:opacity-50"
                          value={u.role?.id || ''}
                          onChange={(e) => handleRoleChange(u.id, parseInt(e.target.value))}
                          disabled={updating === u.id}
                        >
                          {roles.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                          ))}
                        </select>
                        <div className="flex justify-end gap-2 mt-2">
                          <button onClick={() => setPreviewUser(u)} className="px-3 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                            Preview
                          </button>
                          <button onClick={() => setDeleteUser(u)} className="px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
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

        {/* Preview Modal */}
        {previewUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl w-full max-w-lg border border-gray-100 dark:border-slate-800 p-8 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mt-10 -mr-10 pointer-events-none"></div>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg">
                  {previewUser.username[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white">{previewUser.username}</h3>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">{previewUser.email}</p>
                </div>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between py-3 border-b border-gray-100 dark:border-slate-800">
                  <span className="text-gray-500 dark:text-gray-400 font-medium">Role</span>
                  <span className="font-bold text-gray-900 dark:text-white">{previewUser.role?.name || 'No Role'}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100 dark:border-slate-800">
                  <span className="text-gray-500 dark:text-gray-400 font-medium">Joined Date</span>
                  <span className="font-bold text-gray-900 dark:text-white">{new Date(previewUser.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100 dark:border-slate-800">
                  <span className="text-gray-500 dark:text-gray-400 font-medium">Status</span>
                  <span className="font-bold text-green-600 dark:text-green-400">Active</span>
                </div>
              </div>

              <div className="flex justify-end">
                <button onClick={() => setPreviewUser(null)} className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-900 dark:text-white font-semibold rounded-xl transition-colors">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl w-full max-w-sm border border-gray-100 dark:border-slate-800 p-8 text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                ⚠️
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete User?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
                Are you sure you want to delete <span className="font-bold text-gray-900 dark:text-white">{deleteUser.username}</span>? This action cannot be undone.
              </p>
              
              <div className="flex gap-3 justify-center">
                <button 
                  onClick={() => setDeleteUser(null)} 
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-900 dark:text-white font-semibold rounded-xl transition-colors flex-1"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteUser} 
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors flex-1 shadow-sm disabled:opacity-50"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
