'use client';

import { useAuth } from '@/context/AuthContext';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/api';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export default function AdminOverview() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState({ users: 0, courses: 0, enrollments: 0 });
  const [roleDistribution, setRoleDistribution] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock transaction data for the Bar Chart
  const transactionData = [
    { name: 'Jan', revenue: 4000 },
    { name: 'Feb', revenue: 3000 },
    { name: 'Mar', revenue: 2000 },
    { name: 'Apr', revenue: 2780 },
    { name: 'May', revenue: 1890 },
    { name: 'Jun', revenue: 2390 },
    { name: 'Jul', revenue: 3490 },
  ];

  useEffect(() => {
    if (token) {
      fetchAnalytics();
    }
  }, [token]);

  const fetchAnalytics = async () => {
    try {
      const [usersRes, coursesRes, enrollmentsRes] = await Promise.all([
        fetchAPI('/users?populate=role', { headers: { Authorization: `Bearer ${token}` } }),
        fetchAPI('/courses', { headers: { Authorization: `Bearer ${token}` } }),
        fetchAPI('/enrollments', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const users = usersRes || [];
      const courses = coursesRes.data || [];
      const enrollments = enrollmentsRes.data || [];

      setStats({
        users: users.length,
        courses: courses.length,
        enrollments: enrollments.length
      });

      // Calculate role distribution
      const rolesCount: Record<string, number> = {};
      users.forEach((u: any) => {
        const role = u.role?.name || 'No Role';
        rolesCount[role] = (rolesCount[role] || 0) + 1;
      });

      setRoleDistribution(Object.keys(rolesCount).map(key => ({ name: key, value: rolesCount[key] })));

    } catch (err) {
      console.error('Failed to fetch analytics', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in" style={{ paddingBottom: '3rem' }}>
      {/* Welcome Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-gray-100 dark:border-slate-800 shadow-sm animate-slide-up" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '16rem', height: '16rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '9999px', filter: 'blur(48px)', transform: 'translate(30%, -50%)' }}></div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '16rem', height: '16rem', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '9999px', filter: 'blur(48px)', transform: 'translate(-30%, 30%)' }}></div>

        <div style={{ position: 'relative', zIndex: 10 }}>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Workspace 👋
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400" style={{ maxWidth: '42rem' }}>
            Welcome back, <span className="font-bold text-gray-700 dark:text-gray-300">{user?.username}</span>.
            Here is the overall analytics of the LMS website.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-between hover-lift animate-slide-up" style={{ animationDelay: '100ms' }}>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Users</p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{stats.users}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600">
                👥
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-between hover-lift animate-slide-up" style={{ animationDelay: '200ms' }}>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Courses</p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{stats.courses}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-purple-50 dark:bg-purple-900/20 text-purple-600">
                📚
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-between hover-lift animate-slide-up" style={{ animationDelay: '300ms' }}>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Enrollments</p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{stats.enrollments}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-green-50 dark:bg-green-900/20 text-green-600">
                ✅
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* User Roles Pie Chart */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm animate-slide-up" style={{ animationDelay: '400ms' }}>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">User Role Distribution</h3>
              <div style={{ height: '300px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={roleDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {roleDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {roleDistribution.map((role, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                    {role.name}: <span className="font-bold">{role.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Transaction Analytics */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm animate-slide-up" style={{ animationDelay: '500ms' }}>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Transaction Revenue (Mocked)</h3>
              <div style={{ height: '300px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={transactionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <Tooltip
                      cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
