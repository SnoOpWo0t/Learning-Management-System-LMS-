'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/api';
import Link from 'next/link';

export default function InstructorOverview() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    myCourses: 0,
    totalStudents: 0,
    totalLessons: 0,
  });
  const [myCoursesList, setMyCoursesList] = useState<any[]>([]);

  useEffect(() => {
    if (token && user) {
      fetchInstructorData();
    }
  }, [token, user]);

  const fetchInstructorData = async () => {
    try {
      setLoading(true);
      const [coursesRes, enrollmentsRes] = await Promise.all([
        fetchAPI(`/courses?filters[instructor][id][$eq]=${user?.id}&populate=lessons`, { headers: { Authorization: `Bearer ${token}` } }),
        fetchAPI(`/enrollments?populate=course`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const courses = coursesRes.data || [];
      const allEnrollments = enrollmentsRes.data || [];
      
      const myCourseIds = new Set(courses.map((c: any) => c.id || c.documentId));
      const myEnrollments = allEnrollments.filter((e: any) => {
        const cId = e.course?.id || e.course?.documentId;
        return myCourseIds.has(cId);
      });

      let totalLessons = 0;
      courses.forEach((c: any) => {
        totalLessons += (c.lessons?.length || 0);
      });

      setStats({
        myCourses: courses.length,
        totalStudents: myEnrollments.length,
        totalLessons,
      });

      setMyCoursesList(courses);
    } catch (err) {
      console.error('Failed to fetch instructor dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 sm:p-10 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            👨‍🏫 Instructor Studio
          </div>
          <h2 className="text-3xl sm:text-4xl font-black">Welcome, {user?.username}!</h2>
          <p className="text-indigo-100 text-base sm:text-lg mt-1 font-medium">Manage your courses, track student performance, and create engaging lessons.</p>
        </div>
        <Link
          href="/dashboard/manage-courses"
          className="px-6 py-3.5 bg-white text-indigo-600 font-bold rounded-2xl shadow-lg hover:bg-indigo-50 transition-all hover:scale-105 shrink-0 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
          Manage My Courses
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm">
              <span className="text-sm font-bold text-gray-500 dark:text-gray-400">My Assigned Courses</span>
              <h3 className="text-3xl font-black text-gray-900 dark:text-white mt-2">{stats.myCourses}</h3>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm">
              <span className="text-sm font-bold text-gray-500 dark:text-gray-400">Total Enrolled Students</span>
              <h3 className="text-3xl font-black text-gray-900 dark:text-white mt-2">{stats.totalStudents}</h3>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm">
              <span className="text-sm font-bold text-gray-500 dark:text-gray-400">Curriculum Lessons</span>
              <h3 className="text-3xl font-black text-gray-900 dark:text-white mt-2">{stats.totalLessons}</h3>
            </div>
          </div>

          {/* Courses List */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-slate-800 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">My Courses</h3>
            {myCoursesList.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                You haven't created any courses yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myCoursesList.map((course) => (
                  <div key={course.documentId} className="p-5 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 flex justify-between items-center gap-4">
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">{course.title}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{course.lessons?.length || 0} Lessons • {course.difficulty}</p>
                    </div>
                    <Link
                      href={`/dashboard/manage-courses/${course.documentId}`}
                      className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl text-xs hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                    >
                      Manage
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
