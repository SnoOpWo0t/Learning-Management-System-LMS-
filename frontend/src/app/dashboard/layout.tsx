'use client';

import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { useState } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const isActive = (path: string) => pathname === path;
  
  const linkBaseClass = "px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 border border-transparent whitespace-nowrap";
  const getLinkClass = (path: string) => 
    isActive(path) 
      ? `${linkBaseClass} bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800/50 shadow-sm` 
      : `${linkBaseClass} text-gray-600 dark:text-gray-300 hover:bg-gray-50/80 dark:hover:bg-slate-800/80 hover:text-gray-900 dark:hover:text-white`;

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-gray-50/30 dark:bg-slate-950/30">
        
        {/* Top Navbar */}
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm border-b border-gray-200/50 dark:border-slate-800/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              
              {/* Logo & Navigation */}
              <div className="flex items-center gap-8">
                <Link href="/" className="text-2xl font-black text-blue-600 tracking-tight">LMS<span className="text-gray-800 dark:text-gray-200">.</span></Link>
                
                <nav className="flex items-center gap-2 overflow-x-auto">
                  <Link href="/dashboard" className={getLinkClass('/dashboard')}>
                    Overview
                  </Link>
                  
                  {/* Student Links */}
                  {(user?.roleType === 'Student' || !user?.roleType) && (
                    <>
                      <Link href="/dashboard/courses" className={getLinkClass('/dashboard/courses')}>Browse Courses</Link>
                      <Link href="/dashboard/my-courses" className={getLinkClass('/dashboard/my-courses')}>My Courses</Link>
                    </>
                  )}

                  {/* Instructor / Content Manager Links */}
                  {(user?.roleType === 'Instructor' || user?.roleType === 'Content Manager' || user?.roleType === 'Admin') && (
                    <>
                      <Link href="/dashboard/manage-courses" className={getLinkClass('/dashboard/manage-courses')}>Manage Courses</Link>
                      <Link href="/dashboard/blogs" className={getLinkClass('/dashboard/blogs')}>Manage Blogs</Link>
                    </>
                  )}

                  {/* Admin Links */}
                  {user?.roleType === 'Admin' && (
                    <Link href="/dashboard/admin/users" className={getLinkClass('/dashboard/admin/users')}>User Management</Link>
                  )}
                </nav>
              </div>

              {/* User Actions */}
              <div className="flex items-center gap-4">
                <ThemeToggle />
                
                <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-slate-700">
                  <Link href="/dashboard/profile" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold shadow-sm text-sm overflow-hidden">
                      {user?.avatar?.url ? (
                        <img src={`http://127.0.0.1:1337${user.avatar.url}`} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        user?.username?.[0]?.toUpperCase() || 'U'
                      )}
                    </div>
                    <div className="hidden sm:block text-left" style={{ display: 'none' }}>
                       {/* Hiding detailed user info on navbar to keep it clean, but you could show it on wider screens */}
                    </div>
                  </Link>
                  
                  <button
                    onClick={logout}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Sign Out"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </header>
        
        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8">
          {children}
        </main>

      </div>
    </ProtectedRoute>
  );
}
