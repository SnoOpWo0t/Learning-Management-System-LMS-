'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchAPI } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function StudentProgressionPage() {
  const { token } = useAuth();
  const params = useParams();
  const courseId = params.id as string;
  
  const [course, setCourse] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [lessonProgresses, setLessonProgresses] = useState<any[]>([]);
  const [quizResults, setQuizResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Fetch the specific course to get its title and total lessons
      const courseRes = await fetchAPI(`/courses/${courseId}?populate=lessons`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const fetchedCourse = courseRes.data;
      setCourse(fetchedCourse);

      // Fetch all enrollments for this course, populated with student data
      const enrollmentsRes = await fetchAPI(`/enrollments?filters[course][documentId][$eq]=${courseId}&populate=student`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEnrollments(enrollmentsRes.data || []);

      // Fetch lesson progress for this course
      const progressRes = await fetchAPI(`/lesson-progresses?filters[lesson][course][documentId][$eq]=${courseId}&populate=student`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLessonProgresses(progressRes.data || []);

      // Fetch quiz results for this course
      const quizRes = await fetchAPI(`/quiz-results?filters[quiz][course][documentId][$eq]=${courseId}&populate=student`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuizResults(quizRes.data || []);

    } catch (err) {
      console.error(err);
      alert('Failed to load progression data. You might not have permission.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && courseId) fetchData();
  }, [token, courseId]);

  // Aggregate Data for UI
  const totalLessons = course?.lessons?.length || 0;

  const getStudentProgress = (studentDocumentId: string) => {
    // Count how many lessons this student completed
    const completed = lessonProgresses.filter(
      p => p.student?.documentId === studentDocumentId && p.completed
    ).length;
    
    const percentage = totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;
    
    // Find highest quiz score for this student
    const studentQuizzes = quizResults.filter(q => q.student?.documentId === studentDocumentId);
    let topScore = null;
    if (studentQuizzes.length > 0) {
      topScore = Math.max(...studentQuizzes.map(q => q.score));
    }

    return { completed, percentage, topScore };
  };

  return (
    <ProtectedRoute allowedRoles={['Admin', 'Content Manager', 'Instructor']}>
      <div className="space-y-8 pb-8 max-w-6xl mx-auto">
        
        <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
          <Link href="/dashboard/manage-courses" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1 font-medium text-sm">
            ← Back to Courses
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : !course ? (
          <div className="p-12 text-center bg-white/80 dark:bg-slate-900/80 rounded-3xl">
            <h3 className="text-xl font-bold">Course not found or access denied.</h3>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-gray-200/50 dark:border-slate-800/50">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-900/60 rounded-full flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                    Student Progression
                  </span>
                </div>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{course.title}</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Tracking {enrollments.length} enrolled students across {totalLessons} lessons.</p>
              </div>
            </div>
            
            {enrollments.length === 0 ? (
              <div className="bg-white/50 dark:bg-slate-900/50 border border-dashed border-gray-300 dark:border-slate-700 rounded-3xl p-12 text-center">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No students enrolled yet</p>
                <p className="text-gray-500 dark:text-gray-400">Once students enroll in this course, their progress will appear here in real-time.</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800/80">
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lesson Progress</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Quiz Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800/80">
                      {enrollments.map((enrollment) => {
                        const student = enrollment.student;
                        if (!student) return null; // Edge case if student was deleted
                        
                        const progress = getStudentProgress(student.documentId);
                        
                        return (
                          <tr key={enrollment.documentId} className="hover:bg-gray-50/30 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                {student.avatarUrl ? (
                                  <img src={student.avatarUrl} alt={student.username} className="w-10 h-10 rounded-full object-cover bg-gray-100" />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-lg">
                                    {student.username?.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <div>
                                  <div className="font-semibold text-gray-900 dark:text-white">{student.username}</div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">{student.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex flex-col gap-1.5">
                                <div className="flex justify-between items-end text-sm">
                                  <span className="font-semibold text-gray-700 dark:text-gray-300">{progress.percentage}% Completed</span>
                                  <span className="text-gray-400 text-xs">{progress.completed} / {totalLessons} lessons</span>
                                </div>
                                <div className="w-full h-2.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-1000 ${progress.percentage === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                    style={{ width: `${progress.percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5 text-right">
                              {progress.topScore === null ? (
                                <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 text-xs font-semibold rounded-lg">
                                  Not Taken
                                </span>
                              ) : (
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg ${
                                  progress.topScore >= 80 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50' : 
                                  progress.topScore >= 50 ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50' :
                                  'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800/50'
                                }`}>
                                  {progress.topScore}%
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
