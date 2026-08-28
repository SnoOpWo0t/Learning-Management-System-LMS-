'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchAPI } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export default function ManageQuizPage() {
  const { token } = useAuth();
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  
  const [course, setCourse] = useState<any>(null);
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // New Question Form
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');

  const fetchQuizData = async () => {
    try {
      const [courseRes, quizRes] = await Promise.all([
        fetchAPI(`/courses/${courseId}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetchAPI(`/quizzes?filters[course][documentId][$eq]=${courseId}&populate=questions`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setCourse(courseRes.data);
      setQuiz(quizRes.data?.[0] || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && courseId) fetchQuizData();
  }, [token, courseId]);

  const handleCreateQuiz = async () => {
    setSaving(true);
    try {
      await fetchAPI('/quizzes', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          data: {
            title: `${course?.title || 'Course'} Quiz`,
            course: courseId
          }
        })
      });
      fetchQuizData();
    } catch (err) {
      alert('Failed to create quiz skeleton');
    } finally {
      setSaving(false);
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quiz) return;
    setSaving(true);
    try {
      await fetchAPI('/questions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          data: {
            text: questionText,
            options: options.filter(o => o.trim() !== ''),
            correctAnswer: correctAnswer,
            quiz: quiz.documentId
          }
        })
      });
      setQuestionText('');
      setOptions(['', '', '', '']);
      setCorrectAnswer('');
      fetchQuizData();
    } catch (err) {
      alert('Failed to add question');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuestion = async (qId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      await fetchAPI(`/questions/${qId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchQuizData();
    } catch (err) {
      alert('Failed to delete question');
    }
  };

  return (
    <ProtectedRoute allowedRoles={['Admin', 'Content Manager', 'Instructor']}>
      <div className="space-y-8 pb-8 max-w-5xl mx-auto">
        
        <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
          <Link href={`/dashboard/manage-courses/${courseId}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1 font-medium text-sm">
            ← Back to Lessons
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : !course ? (
          <div className="p-12 text-center bg-white/80 dark:bg-slate-900/80 rounded-3xl">
            <h3 className="text-xl font-bold">Course not found</h3>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-gray-200/50 dark:border-slate-800/50">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 text-xs font-bold text-purple-800 dark:text-purple-200 bg-purple-100 dark:bg-purple-900/60 rounded-full flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Quiz Management
                  </span>
                </div>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{course.title}</h2>
              </div>
            </div>
            
            {!quiz ? (
              <div className="bg-white/50 dark:bg-slate-900/50 border border-dashed border-gray-300 dark:border-slate-700 rounded-3xl p-12 text-center">
                <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white mb-4">This course doesn't have a quiz yet.</p>
                <button onClick={handleCreateQuiz} disabled={saving} className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-2xl hover:bg-purple-700 shadow-sm hover:shadow-md transition-all disabled:opacity-50 inline-flex items-center gap-2">
                  {saving ? 'Initializing...' : 'Initialize Quiz'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Questions List (Left/Main Column) */}
                <div className="lg:col-span-7 space-y-4 order-2 lg:order-1">
                  <div className="flex items-center justify-between px-2 mb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Questions</h3>
                    <span className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 py-1 px-3 rounded-lg text-sm font-bold">
                      Total: {quiz.questions?.length || 0}
                    </span>
                  </div>
                  
                  {(!quiz.questions || quiz.questions.length === 0) ? (
                    <div className="bg-white/50 dark:bg-slate-900/50 border border-dashed border-gray-300 dark:border-slate-700 rounded-3xl p-10 text-center">
                      <p className="text-gray-500 dark:text-gray-400">No questions added yet. Use the form to add your first question.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {quiz.questions.map((q: any, idx: number) => (
                        <div key={q.documentId} className="group bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-800 hover:shadow-md transition-all">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex gap-3 items-start">
                              <span className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white text-lg leading-snug">{q.text}</h4>
                                
                                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {q.options.map((opt: string, i: number) => {
                                    const isCorrect = opt === q.correctAnswer;
                                    return (
                                      <div key={i} className={`px-3 py-2 rounded-lg border text-sm flex items-center gap-2 ${isCorrect ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 font-medium' : 'bg-gray-50 dark:bg-slate-800 border-gray-100 dark:border-slate-700 text-gray-600 dark:text-gray-300'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${isCorrect ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                        {opt}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                            <button onClick={() => handleDeleteQuestion(q.documentId)} className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 rounded-xl transition-colors opacity-0 group-hover:opacity-100 shrink-0">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Add Question Form (Right/Side Column) */}
                <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 sticky top-8 order-1 lg:order-2">
                  <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    New Question
                  </h3>
                  <form onSubmit={handleAddQuestion} className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Question Text</label>
                      <textarea 
                        required placeholder="What is..."
                        value={questionText} onChange={e => setQuestionText(e.target.value)} 
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none" 
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex justify-between items-end">
                        Multiple Choice Options
                      </label>
                      <div className="space-y-2.5">
                        {options.map((opt, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="w-6 text-center text-xs font-bold text-gray-400">{String.fromCharCode(65 + i)}</span>
                            <input 
                              required type="text" placeholder={`Option ${i+1}`} 
                              value={opt} onChange={e => {
                                const newOpts = [...options];
                                newOpts[i] = e.target.value;
                                setOptions(newOpts);
                              }} 
                              className="flex-1 px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm" 
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Correct Answer</label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Copy & paste one of the options above exactly as written.</p>
                      <input 
                        required type="text" placeholder="Paste correct option here"
                        value={correctAnswer} onChange={e => setCorrectAnswer(e.target.value)} 
                        className="w-full px-4 py-2.5 bg-green-50/50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/50 rounded-xl dark:text-white focus:ring-2 focus:ring-green-500 outline-none transition-all" 
                      />
                    </div>
                    
                    <button type="submit" disabled={saving} className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-sm hover:shadow-md transition-all disabled:opacity-50 mt-4">
                      {saving ? 'Adding...' : 'Add Question'}
                    </button>
                  </form>
                </div>
                
              </div>
            )}
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
