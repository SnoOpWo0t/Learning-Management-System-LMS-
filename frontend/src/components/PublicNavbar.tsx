'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useEffect, useState } from 'react';

export default function PublicNavbar() {
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="bg-white/50 dark:bg-[#0A0A0A]/50 backdrop-blur-2xl shadow-sm sticky top-0 z-50 border-b border-gray-200/50 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-black text-blue-600 tracking-tight">
          LMS<span className="text-gray-800 dark:text-gray-200">.</span>
        </Link>
        <div className="flex gap-3 md:gap-4 items-center">
          <ThemeToggle />
          <Link href="/blog" className="hidden sm:block text-gray-600 dark:text-gray-300 font-medium hover:text-blue-600 dark:hover:text-blue-400 mr-2 transition-colors">
            Blog
          </Link>

          {/* Authentication State */}
          {!mounted || loading ? (
            <div className="w-20 h-10 animate-pulse bg-gray-200 dark:bg-slate-800 rounded-full"></div>
          ) : user ? (
            <Link 
              href="/dashboard" 
              className="group px-5 py-2.5 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-semibold rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-all duration-300 flex items-center gap-2 shadow-sm border border-blue-100 dark:border-blue-800/50 hover:shadow-md hover:-translate-y-0.5"
            >
              Dashboard
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-inner group-hover:scale-110 transition-transform duration-300">
                {user.username?.[0]?.toUpperCase() || 'U'}
              </div>
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-gray-600 dark:text-gray-300 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 hover:drop-shadow-sm">
                Login
              </Link>
              <Link href="/register" className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-1 ml-1">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
