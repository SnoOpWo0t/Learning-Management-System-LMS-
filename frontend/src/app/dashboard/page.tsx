'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { fetchAPI } from '@/lib/api';

import AdminOverview from './AdminOverview';

function StudentOverview() {
  const { user, token } = useAuth();
  
  const [statsData, setStatsData] = useState({
    activeCourses: 0,
    completedLessons: 0,
    certificates: 0,
    averageScore: 0
  });
  
  const [activities, setActivities] = useState<any[]>([]);
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (user && token) {
      fetchDashboardData();
    }
  }, [user, token]);

  const fetchDashboardData = async () => {
    try {
      setLoadingStats(true);
      // Fetch Enrollments
      const enrollRes = await fetchAPI(`/enrollments?filters[student][id][$eq]=${user?.id}&populate=course`, { headers: { Authorization: `Bearer ${token}` } });
      const enrollments = enrollRes.data || [];
      
      // Fetch Lesson Progresses
      const progressRes = await fetchAPI(`/lesson-progresses?filters[student][id][$eq]=${user?.id}&filters[completed][$eq]=true&populate=lesson`, { headers: { Authorization: `Bearer ${token}` } });
      const progresses = progressRes.data || [];
      
      // Fetch Quiz Results
      const quizRes = await fetchAPI(`/quiz-results?filters[student][id][$eq]=${user?.id}&populate=quiz`, { headers: { Authorization: `Bearer ${token}` } });
      const quizResults = quizRes.data || [];

      // Calculate Stats
      let totalScore = 0;
      quizResults.forEach((q: any) => {
        totalScore += (q.score / Math.max(q.totalQuestions, 1)) * 100;
      });
      const avgScore = quizResults.length > 0 ? Math.round(totalScore / quizResults.length) : 0;

      setStatsData({
        activeCourses: enrollments.length,
        completedLessons: progresses.length,
        certificates: quizResults.length,
        averageScore: avgScore
      });

      // Build Recent Activity Feed
      const feed: any[] = [];
      enrollments.forEach((e: any) => {
        feed.push({
          id: `e-${e.documentId}`,
          title: `Enrolled in "${e.course?.title || 'a course'}"`,
          date: new Date(e.createdAt),
          type: 'course'
        });
      });
      
      progresses.forEach((p: any) => {
        feed.push({
          id: `p-${p.documentId}`,
          title: `Completed lesson "${p.lesson?.title || 'Unknown'}"`,
          date: new Date(p.updatedAt),
          type: 'lesson'
        });
      });
      
      quizResults.forEach((q: any) => {
        feed.push({
          id: `q-${q.documentId}`,
          title: `Scored ${q.score}/${q.totalQuestions} on "${q.quiz?.title || 'Assessment'}"`,
          date: new Date(q.createdAt),
          type: 'quiz'
        });
      });

      // Sort by date descending
      feed.sort((a, b) => b.date.getTime() - a.date.getTime());
      setActivities(feed);

    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const Icons = {
    Book: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>,
    Check: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Trophy: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" /></svg>,
    Chart: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>,
    Rocket: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.45c.019-.104.039-.208.06-.311m-2.7-2.7a2.25 2.25 0 00-1.213-.679m1.213.678c.16.273.35.53.56.772m-.56-.771l-.54-1.5m.54 1.5l1.5.54m-.54-1.5a2.25 2.25 0 01.679-1.213m-1.213.678c.273-.16.53-.35.772-.56m.54 1.5c.16-.273.35-.53.56-.772m-1.332-.772l1.5-.54m-1.5.54l.54 1.5m-1.5-.54a2.25 2.25 0 01-.679 1.213m1.213-.678c-.273.16-.53.35-.772.56M12 12v.01" /></svg>
  };

  const stats = [
    { label: 'Active Courses', value: statsData.activeCourses, icon: Icons.Book, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-100 dark:border-blue-800' },
    { label: 'Completed Lessons', value: statsData.completedLessons, icon: Icons.Check, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-100 dark:border-green-800' },
    { label: 'Assessments Finished', value: statsData.certificates, icon: Icons.Trophy, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-100 dark:border-yellow-800' },
    { label: 'Average Score', value: `${statsData.averageScore}%`, icon: Icons.Chart, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-100 dark:border-purple-800' },
  ];

  const displayedActivities = showAllActivity ? activities : activities.slice(0, 3);

  const getActivityStyle = (type: string) => {
    switch(type) {
      case 'course': return { icon: Icons.Rocket, color: 'text-green-500 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' };
      case 'quiz': return { icon: Icons.Check, color: 'text-purple-500 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' };
      default: return { icon: Icons.Book, color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' };
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-fade-in">
      
      {/* Welcome Banner */}
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 p-8 sm:p-10 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1 space-y-2">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">{user?.username || 'User'}</span>!
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
          <div key={i} style={{ animationDelay: `${i * 100}ms` }} className={`animate-slide-up opacity-0 hover-lift bg-white dark:bg-slate-900 rounded-2xl p-6 border ${stat.border} shadow-sm transition-shadow`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {loadingStats ? <div className="h-9 w-16 bg-gray-200 dark:bg-slate-800 animate-pulse rounded-lg"></div> : stat.value}
                </h3>
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
          
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center group hover-lift transition-colors overflow-hidden">
            <div className="w-full md:w-64 aspect-video bg-gray-100 dark:bg-slate-800 rounded-2xl overflow-hidden shrink-0 relative">
               <img src="https://picsum.photos/seed/advanced-react/400/300" alt="Course" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
               <div className="absolute inset-0 bg-black/10"></div>
            </div>
            
            <div className="flex-1 min-w-0 w-full">
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
            
            <div className="w-full md:w-auto mt-4 md:mt-0 shrink-0">
              <Link href="/dashboard/my-courses" className="w-full md:w-auto inline-flex items-center justify-center px-6 py-3 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 text-gray-900 dark:text-white font-medium rounded-xl transition-colors">
                Resume
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-5">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activity</h3>
          
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm min-h-[300px] flex flex-col">
            <div className="space-y-6 flex-1 max-h-[400px] overflow-y-auto pr-2">
              {loadingStats ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-4 animate-pulse">
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-800 flex-none"></div>
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded w-1/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : displayedActivities.length > 0 ? (
                displayedActivities.map((activity, i) => {
                  const style = getActivityStyle(activity.type);
                  return (
                    <div key={activity.id} style={{ animationDelay: `${(i + 4) * 100}ms` }} className="flex gap-4 animate-slide-up opacity-0">
                      <div className={`w-10 h-10 rounded-full flex flex-none items-center justify-center text-lg ${style.bg} ${style.color}`}>
                        {style.icon}
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white leading-snug mb-1">
                          {activity.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                          {activity.date.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 py-10 animate-fade-in">
                  <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center mb-3">
                    {Icons.Book}
                  </div>
                  <p className="text-sm font-medium">No recent activity yet.</p>
                  <p className="text-xs mt-1 text-center max-w-[200px]">Enroll in a course to see your progress here.</p>
                </div>
              )}
            </div>
            
            {activities.length > 3 && (
              <button 
                onClick={() => setShowAllActivity(!showAllActivity)}
                className="mt-6 w-full py-3 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                {showAllActivity ? 'Show less' : 'View all activity'}
              </button>
            )}
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
