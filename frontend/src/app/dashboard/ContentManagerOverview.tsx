'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/api';
import Link from 'next/link';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];
const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: '#10b981',
  Intermediate: '#f59e0b',
  Advanced: '#ef4444'
};

export default function ContentManagerOverview() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalBlogs: 0,
    publishedBlogs: 0,
    draftBlogs: 0,
    totalLessons: 0,
    totalQuizzes: 0,
  });

  const [recentBlogs, setRecentBlogs] = useState<any[]>([]);
  const [recentCourses, setRecentCourses] = useState<any[]>([]);
  const [difficultyData, setDifficultyData] = useState<any[]>([]);
  const [contentMixData, setContentMixData] = useState<any[]>([]);

  useEffect(() => {
    if (token) {
      fetchContentAnalytics();
    }
  }, [token]);

  const fetchContentAnalytics = async () => {
    try {
      setLoading(true);
      const [coursesRes, blogsRes, lessonsRes, quizzesRes] = await Promise.all([
        fetchAPI('/courses?populate[0]=instructor&populate[1]=lessons', { headers: { Authorization: `Bearer ${token}` } }),
        fetchAPI('/blog-posts?populate=author&sort=createdAt:desc', { headers: { Authorization: `Bearer ${token}` } }),
        fetchAPI('/lessons', { headers: { Authorization: `Bearer ${token}` } }),
        fetchAPI('/quizzes', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const courses = coursesRes.data || [];
      const blogs = blogsRes.data || [];
      const lessons = lessonsRes.data || [];
      const quizzes = quizzesRes.data || [];

      const published = blogs.filter((b: any) => Boolean(b.publishedAt || b.status === 'Published')).length;
      const drafts = blogs.filter((b: any) => !Boolean(b.publishedAt || b.status === 'Published')).length;

      // Difficulty distribution
      const diffCount: Record<string, number> = { Beginner: 0, Intermediate: 0, Advanced: 0 };
      courses.forEach((c: any) => {
        const d = c.difficulty || 'Beginner';
        diffCount[d] = (diffCount[d] || 0) + 1;
      });

      setDifficultyData([
        { name: 'Beginner', count: diffCount['Beginner'] || 0, fill: '#10b981' },
        { name: 'Intermediate', count: diffCount['Intermediate'] || 0, fill: '#f59e0b' },
        { name: 'Advanced', count: diffCount['Advanced'] || 0, fill: '#ef4444' },
      ]);

      setContentMixData([
        { name: 'Courses', value: courses.length },
        { name: 'Lessons', value: lessons.length },
        { name: 'Articles', value: blogs.length },
        { name: 'Quizzes', value: quizzes.length },
      ]);

      setStats({
        totalCourses: courses.length,
        totalBlogs: blogs.length,
        publishedBlogs: published,
        draftBlogs: drafts,
        totalLessons: lessons.length,
        totalQuizzes: quizzes.length,
      });

      setRecentBlogs(blogs.slice(0, 5));
      setRecentCourses(courses.slice(0, 5));

    } catch (err) {
      console.error('Failed to fetch content manager analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-3xl p-8 sm:p-10 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-blue-100">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Editorial & Publishing Hub
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Welcome back, {user?.username}! ✍️
            </h2>
            <p className="text-blue-100 text-base sm:text-lg max-w-2xl font-medium leading-relaxed">
              Orchestrate the curriculum, publish insightful blog posts, and ensure learning materials meet top educational standards.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/dashboard/manage-courses"
              className="px-5 py-3 bg-white text-blue-600 font-bold rounded-2xl shadow-lg hover:bg-blue-50 transition-all hover:scale-105 flex items-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
              Manage Courses
            </Link>
            <Link
              href="/dashboard/blogs"
              className="px-5 py-3 bg-blue-700/80 hover:bg-blue-700 text-white font-bold rounded-2xl border border-white/20 transition-all hover:scale-105 flex items-center gap-2 text-sm backdrop-blur-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
              Write Article
            </Link>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Key Content Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Courses Metric */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-gray-500 dark:text-gray-400">Total Courses</span>
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl font-bold">
                  📚
                </div>
              </div>
              <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{stats.totalCourses}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1 font-medium">
                Active in course catalog
              </p>
            </div>

            {/* Lessons Metric */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-gray-500 dark:text-gray-400">Curriculum Lessons</span>
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xl font-bold">
                  🎬
                </div>
              </div>
              <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{stats.totalLessons}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1 font-medium">
                Structured learning modules
              </p>
            </div>

            {/* Blog Articles Metric */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-gray-500 dark:text-gray-400">Blog Articles</span>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl font-bold">
                  📰
                </div>
              </div>
              <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{stats.totalBlogs}</h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1 font-bold">
                {stats.publishedBlogs} Published • {stats.draftBlogs} Drafts
              </p>
            </div>

            {/* Assessment Quizzes */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-gray-500 dark:text-gray-400">Quizzes & Tests</span>
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl font-bold">
                  🎯
                </div>
              </div>
              <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{stats.totalQuizzes}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1 font-medium">
                Active student assessments
              </p>
            </div>
          </div>

          {/* Visual Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Content Mix Chart */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-slate-800 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Content Mix Distribution</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium">Ratio of courses, lessons, articles, and quizzes.</p>
              
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={contentMixData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {contentMixData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', background: '#1e293b', color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-slate-800">
                {contentMixData.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}></span>
                    <span className="font-medium">{item.name}:</span>
                    <span className="font-bold text-gray-900 dark:text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Difficulty Breakdown */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-slate-800 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Courses by Skill Level</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium">Distribution of beginner, intermediate, and advanced courses.</p>
              
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={difficultyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <Tooltip
                      cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', background: '#1e293b', color: '#fff' }}
                    />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      {difficultyData.map((entry, index) => (
                        <Cell key={`cell-bar-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex justify-around gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-slate-800 text-sm">
                {difficultyData.map((d, i) => (
                  <span key={i} className="font-bold" style={{ color: d.fill }}>
                    {d.name}: {d.count}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Content Feeds */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Blog Posts */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Articles</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Latest publications & drafts</p>
                  </div>
                  <Link href="/dashboard/blogs" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">
                    View All →
                  </Link>
                </div>

                {recentBlogs.length === 0 ? (
                  <div className="py-12 text-center text-gray-400">No blog posts found.</div>
                ) : (
                  <div className="space-y-3">
                    {recentBlogs.map((blog) => (
                      <div
                        key={blog.documentId || blog.id}
                        className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50/70 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800/80 hover:border-blue-200 dark:hover:border-blue-900/50 transition-all"
                      >
                        <div className="flex-1 min-w-0 mr-3">
                          <p className="font-bold text-gray-900 dark:text-white text-sm truncate">
                            {blog.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            by {blog.author?.username || 'Unknown'} • {new Date(blog.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full shrink-0 border ${
                          blog.status === 'Published'
                            ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50'
                            : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50'
                        }`}>
                          {blog.status || 'Draft'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-800">
                <Link
                  href="/dashboard/blogs"
                  className="w-full py-3 bg-gray-50 hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-gray-900 dark:text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  Manage All Blog Posts
                </Link>
              </div>
            </div>

            {/* Recent Courses */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Active Courses</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Curriculum catalog overview</p>
                  </div>
                  <Link href="/dashboard/manage-courses" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">
                    View All →
                  </Link>
                </div>

                {recentCourses.length === 0 ? (
                  <div className="py-12 text-center text-gray-400">No courses found.</div>
                ) : (
                  <div className="space-y-3">
                    {recentCourses.map((course) => (
                      <div
                        key={course.documentId || course.id}
                        className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50/70 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800/80 hover:border-blue-200 dark:hover:border-blue-900/50 transition-all"
                      >
                        <div className="flex-1 min-w-0 mr-3">
                          <p className="font-bold text-gray-900 dark:text-white text-sm truncate">
                            {course.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Instructor: {course.instructor?.username || 'Unknown'} • {course.lessons?.length || 0} Lessons
                          </p>
                        </div>
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full shrink-0 border ${
                          course.difficulty === 'Beginner' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/50' :
                          course.difficulty === 'Intermediate' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50' :
                          'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50'
                        }`}>
                          {course.difficulty}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-800">
                <Link
                  href="/dashboard/manage-courses"
                  className="w-full py-3 bg-gray-50 hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-gray-900 dark:text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  Manage Courses & Curriculum
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
