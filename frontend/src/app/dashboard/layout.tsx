'use client';

import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-100 font-sans text-gray-900">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md flex flex-col hidden md:flex">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-blue-600">LMS</h1>
            <p className="text-sm text-gray-500 mt-1">Hello, {user?.username}</p>
            <p className="text-xs font-semibold text-blue-500 mt-1 uppercase tracking-wider">{user?.roleType}</p>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <Link href="/dashboard" className="block px-4 py-2 text-sm font-medium text-gray-700 rounded hover:bg-blue-50 hover:text-blue-600">
              Overview
            </Link>
            
            {/* Student Links */}
            {(user?.roleType === 'Student' || !user?.roleType) && (
              <>
                <Link href="/dashboard/courses" className="block px-4 py-2 text-sm font-medium text-gray-700 rounded hover:bg-blue-50 hover:text-blue-600">
                  Browse Courses
                </Link>
                <Link href="/dashboard/my-courses" className="block px-4 py-2 text-sm font-medium text-gray-700 rounded hover:bg-blue-50 hover:text-blue-600">
                  My Courses
                </Link>
              </>
            )}

            {/* Instructor / Content Manager Links */}
            {(user?.roleType === 'Instructor' || user?.roleType === 'Content Manager' || user?.roleType === 'Admin') && (
              <>
                <Link href="/dashboard/manage-courses" className="block px-4 py-2 text-sm font-medium text-gray-700 rounded hover:bg-blue-50 hover:text-blue-600">
                  Manage Courses
                </Link>
                <Link href="/dashboard/blogs" className="block px-4 py-2 text-sm font-medium text-gray-700 rounded hover:bg-blue-50 hover:text-blue-600">
                  Manage Blogs
                </Link>
              </>
            )}

            {/* Admin Links */}
            {user?.roleType === 'Admin' && (
              <Link href="/dashboard/admin/users" className="block px-4 py-2 text-sm font-medium text-gray-700 rounded hover:bg-blue-50 hover:text-blue-600">
                User Management
              </Link>
            )}
          </nav>
          <div className="p-4 border-t">
            <button
              onClick={logout}
              className="w-full px-4 py-2 text-sm font-medium text-left text-red-600 rounded hover:bg-red-50"
            >
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {/* Mobile Header */}
          <header className="md:hidden bg-white shadow-sm flex items-center justify-between p-4">
             <h1 className="text-xl font-bold text-blue-600">LMS</h1>
             <button onClick={logout} className="text-sm text-red-600 font-medium">Sign Out</button>
          </header>
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
