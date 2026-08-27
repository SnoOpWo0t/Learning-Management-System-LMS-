'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchAPI } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useParams } from 'next/navigation';

export default function LearnCoursePage() {
  const { token, user } = useAuth();
  const params = useParams();
  const courseId = params.id as string;
  
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [progresses, setProgresses] = useState<any[]>([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCourseData = async () => {
    try {
      const res = await fetchAPI(`/courses/${courseId}?populate=lessons,quiz`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourse(res.data);
      const sortedLessons = (res.data?.lessons || []).sort((a: any, b: any) => a.order - b.order);
      setLessons(sortedLessons);

      if (sortedLessons.length > 0) {
        // Fetch progress for these lessons
        const progRes = await fetchAPI(`/lesson-progresses?filters[student][id][$eq]=${user?.id}&populate=lesson`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProgresses(progRes.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && courseId && user) fetchCourseData();
  }, [token, courseId, user]);

  const handleMarkComplete = async (lessonId: string) => {
    try {
      await fetchAPI('/lesson-progresses', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          data: {
            student: user?.id,
            lesson: lessonId,
            completed: true
          }
        })
      });
      fetchCourseData(); // Refresh progress
    } catch (err) {
      console.error('Failed to mark complete');
    }
  };

  const isCompleted = (lessonId: string) => {
    return progresses.some(p => p.lesson?.documentId === lessonId && p.completed);
  };

  const progressPercentage = lessons.length > 0 ? Math.round((progresses.length / lessons.length) * 100) : 0;

  if (loading) return <div className="flex justify-center mt-20"><div className="loader"></div></div>;
  if (!course) return <p className="text-red-500 p-8">Course not found.</p>;

  const currentLesson = lessons[currentLessonIndex];

  return (
    <ProtectedRoute allowedRoles={['Student']}>
      <div className="flex flex-col md:flex-row gap-6 h-full min-h-[80vh]">
        
        {/* Sidebar / Table of Contents */}
        <div className="w-full md:w-1/3 bg-white p-6 rounded-xl shadow-sm border flex flex-col">
          <h2 className="text-2xl font-bold mb-2">{course.title}</h2>
          
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Course Progress</span>
              <span>{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-green-600 h-2.5 rounded-full transition-all" style={{ width: `${progressPercentage}%` }}></div>
            </div>
          </div>

          <h3 className="font-semibold text-gray-700 mb-3 uppercase text-sm tracking-wider">Lessons</h3>
          <ul className="space-y-2 flex-1 overflow-y-auto pr-2">
            {lessons.map((lesson, idx) => (
              <li key={lesson.documentId}>
                <button
                  onClick={() => setCurrentLessonIndex(idx)}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between transition-colors ${
                    idx === currentLessonIndex ? 'bg-blue-50 border-blue-200 border text-blue-700' : 'hover:bg-gray-50 border border-transparent text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400 font-mono">{idx + 1}</span>
                    <span className="font-medium">{lesson.title}</span>
                  </div>
                  {isCompleted(lesson.documentId) && (
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </li>
            ))}
          </ul>
          
          {course.quiz && (
            <div className="mt-6 pt-6 border-t">
              <a href={`/dashboard/learn/${courseId}/quiz`} className="block text-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-bold shadow-sm transition-colors">
                Take Course Quiz
              </a>
            </div>
          )}
        </div>

        {/* Lesson Content Area */}
        <div className="w-full md:w-2/3 bg-white p-8 rounded-xl shadow-sm border overflow-y-auto">
          {lessons.length === 0 ? (
            <p className="text-gray-500 text-center mt-10">No lessons available for this course yet.</p>
          ) : (
            currentLesson && (
              <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">{currentLesson.title}</h1>
                <div className="prose max-w-none mb-10 whitespace-pre-wrap">
                  {currentLesson.content}
                </div>
                
                <div className="border-t pt-6 flex justify-between items-center mt-10">
                  <button
                    disabled={currentLessonIndex === 0}
                    onClick={() => setCurrentLessonIndex(currentLessonIndex - 1)}
                    className="px-4 py-2 text-blue-600 hover:underline disabled:text-gray-400 disabled:no-underline"
                  >
                    ← Previous
                  </button>

                  {!isCompleted(currentLesson.documentId) ? (
                    <button
                      onClick={() => handleMarkComplete(currentLesson.documentId)}
                      className="px-6 py-2 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 shadow-sm"
                    >
                      Mark Complete
                    </button>
                  ) : (
                    <span className="flex items-center gap-2 text-green-600 font-semibold">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                         <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Completed
                    </span>
                  )}

                  <button
                    disabled={currentLessonIndex === lessons.length - 1}
                    onClick={() => setCurrentLessonIndex(currentLessonIndex + 1)}
                    className="px-4 py-2 text-blue-600 hover:underline disabled:text-gray-400 disabled:no-underline"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
