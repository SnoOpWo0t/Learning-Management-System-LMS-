'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

import AdminOverview from './AdminOverview';

function StudentOverview() {
  const { user } = useAuth();

  const stats = [
    { label: 'Active Courses', value: '3', icon: '📚', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-100 dark:border-blue-800' },
    { label: 'Completed Lessons', value: '12', icon: '✅', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-100 dark:border-green-800' },
    { label: 'Certificates Earned', value: '1', icon: '🏆', color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-100 dark:border-yellow-800' },
    { label: 'Average Score', value: '92%', icon: '📈', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-100 dark:border-purple-800' },
  ];

  const recentActivity = [
    { title: 'Completed "Introduction to React Hooks"', time: '2 hours ago', type: 'lesson', icon: '📘', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { title: 'Enrolled in "Advanced State Management"', time: '1 day ago', type: 'course', icon: '🚀', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
    { title: 'Scored 95% on "JavaScript Fundamentals Quiz"', time: '3 days ago', type: 'quiz', icon: '✅', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      
      {/* Welcome Banner */}
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 p-8 sm:p-10 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1 space-y-2">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">{user?.username || 'User'}</span>! 👋
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed">
              You are logged in as a <span className="font-semibold text-gray-700 dark:text-gray-300">{user?.roleType || 'Student'}</span>. 
              Ready to crush your goals today?
            </p>
          </div>
          <div className="flex items-center gap-4 shrink-0">
             <Link href="/dashboard/courses" className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-sm">
                Browse Catalog
             </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className={`bg-white dark:bg-slate-900 rounded-2xl p-6 border ${stat.border} shadow-sm hover:shadow-md transition-shadow`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${stat.bg} ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Continue Learning */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Continue Learning</h3>
            <Link href="/dashboard/my-courses" className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline">View all</Link>
          </div>
          
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-6 items-start sm:items-center group hover:border-blue-200 dark:hover:border-blue-800/50 transition-colors">
            <div className="w-full sm:w-48 aspect-video bg-gray-100 dark:bg-slate-800 rounded-2xl overflow-hidden shrink-0 relative">
               <img src="https://picsum.photos/seed/advanced-react/400/300" alt="Course" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
               <div className="absolute inset-0 bg-black/10"></div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center px-2.5 py-1 mb-3 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold tracking-wide uppercase">
                Web Development
              </div>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 truncate">Advanced State Management in React</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 line-clamp-2 leading-relaxed">
                Master Redux, Zustand, and React Context to build scalable applications with predictable state updates.
              </p>
              
              <div className="flex items-center gap-4">
                <div className="flex-1 h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[65%] rounded-full"></div>
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">65%</span>
              </div>
            </div>
            
            <div className="w-full sm:w-auto mt-4 sm:mt-0">
              <Link href="/dashboard/my-courses" className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 text-gray-900 dark:text-white font-medium rounded-xl transition-colors">
                Resume
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-5">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activity</h3>
          
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm h-[calc(100%-2.75rem)]">
            <div className="space-y-6">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex gap-4">
                  <div className={`w-10 h-10 rounded-full flex flex-none items-center justify-center text-lg ${activity.bg} ${activity.color}`}>
                    {activity.icon}
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white leading-snug mb-1">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="mt-8 w-full py-3 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors">
              View all activity
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex justify-center p-20"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (user?.roleType === 'Admin') {
    return <AdminOverview />;
  }

  return <StudentOverview />;
}
