'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';

export default function CoursePlayerClient({ courseId, courseTitle, lessons, quiz }: { courseId: string, courseTitle: string, lessons: any[], quiz: any }) {
  const { token, user } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [enrollment, setEnrollment] = useState<any>(null);
  
  const [activeTab, setActiveTab] = useState<string>(lessons.length > 0 ? 'lesson-0' : 'quiz');
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>({});
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [contentTab, setContentTab] = useState<'overview' | 'notes'>('overview');
  const [lessonNotes, setLessonNotes] = useState<Record<string, string>>({});
  
  const [quizResult, setQuizResult] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);
  
  // Rating System States
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [existingRating, setExistingRating] = useState<any>(null);

  useEffect(() => {
    if (token && user) {
      checkAccessAndFetchProgress();
      const savedNotes = localStorage.getItem(`lms_notes_${user.id}_${courseId}`);
      if (savedNotes) {
        try {
          setLessonNotes(JSON.parse(savedNotes));
        } catch (e) {
          console.error('Failed to parse notes');
        }
      }
    }
  }, [token, user]);

  const checkAccessAndFetchProgress = async () => {
    try {
      setLoading(true);
      const enrollRes = await fetchAPI(`/enrollments?filters[student][id][$eq]=${user?.id}&filters[course][documentId][$eq]=${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!enrollRes.data || enrollRes.data.length === 0) {
        router.push(`/courses/${courseId}`);
        return;
      }
      setEnrollment(enrollRes.data[0]);

      const fullProgressRes = await fetchAPI(`/lesson-progresses?filters[student][id][$eq]=${user?.id}&populate=lesson`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const completed: Record<string, boolean> = {};
      if (fullProgressRes.data) {
        fullProgressRes.data.forEach((p: any) => {
          if (p.lesson) {
            completed[p.lesson.documentId] = p.completed;
          }
        });
      }
      setCompletedLessons(completed);

      if (quiz) {
        const qRes = await fetchAPI(`/quiz-results?filters[student][id][$eq]=${user?.id}&filters[quiz][documentId][$eq]=${quiz.documentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (qRes.data && qRes.data.length > 0) {
          setQuizResult(qRes.data[0]);
        }
      }

      // Fetch rating
      const ratingRes = await fetchAPI(`/course-ratings?filters[student][id][$eq]=${user?.id}&filters[course][documentId][$eq]=${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (ratingRes.data && ratingRes.data.length > 0) {
        setExistingRating(ratingRes.data[0]);
        setRatingValue(ratingRes.data[0].rating);
        setReviewText(ratingRes.data[0].review || '');
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const submitRating = async () => {
    if (!ratingValue) return alert("Please select a rating.");
    try {
      setIsSubmittingRating(true);
      if (existingRating) {
        await fetchAPI(`/course-ratings/${existingRating.documentId}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({ data: { rating: ratingValue, review: reviewText } })
        });
      } else {
        const res = await fetchAPI('/course-ratings', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({ data: { rating: ratingValue, review: reviewText, course: courseId, student: user?.id } })
        });
        setExistingRating(res.data);
      }
      setShowRatingModal(false);
      triggerConfetti(); // Celebration for rating!
    } catch (err) {
      console.error(err);
      alert('Failed to save rating.');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handleSaveNote = (lessonDocId: string, text: string) => {
    const updated = { ...lessonNotes, [lessonDocId]: text };
    setLessonNotes(updated);
    if (user?.id) {
      localStorage.setItem(`lms_notes_${user.id}_${courseId}`, JSON.stringify(updated));
    }
  };

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  const markLessonComplete = async (lessonDocId: string) => {
    if (!token) return;
    try {
      setMarkingComplete(true);
      await fetchAPI('/lesson-progresses', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          data: {
            lesson: lessonDocId,
            student: user?.id,
            completed: true
          }
        })
      });
      
      setCompletedLessons(prev => ({ ...prev, [lessonDocId]: true }));
      
      const currentIndex = lessons.findIndex(l => l.documentId === lessonDocId);
      if (currentIndex === lessons.length - 1 && !quiz) {
        triggerConfetti();
      }
      
    } catch (err) {
      console.error('Failed to mark complete', err);
      alert('Failed to mark lesson as complete.');
    } finally {
      setMarkingComplete(false);
    }
  };

  const navigateTo = (direction: 'next' | 'prev') => {
    const currentIndex = activeTab.startsWith('lesson-') ? parseInt(activeTab.replace('lesson-', '')) : lessons.length;
    if (direction === 'next') {
      if (currentIndex < lessons.length - 1) {
        setActiveTab(`lesson-${currentIndex + 1}`);
      } else if (quiz) {
        setActiveTab('quiz');
      }
    } else {
      if (activeTab === 'quiz') {
        setActiveTab(`lesson-${lessons.length - 1}`);
      } else if (currentIndex > 0) {
        setActiveTab(`lesson-${currentIndex - 1}`);
      }
    }
  };

  const handleQuizSubmit = async () => {
    if (!token || !quiz) return;
    if (Object.keys(answers).length < (quiz.questions?.length || 0)) {
      alert("Please answer all questions before submitting.");
      return;
    }
    try {
      setSubmittingQuiz(true);
      const res = await fetchAPI(`/quizzes/${quiz.documentId}/submit`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ answers })
      });
      if (res.data) {
        setQuizResult({
          score: res.data.score,
          totalQuestions: res.data.totalQuestions
        });
        triggerConfetti();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to submit quiz.');
    } finally {
      setSubmittingQuiz(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center py-20">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const activeLessonIndex = activeTab.startsWith('lesson-') ? parseInt(activeTab.replace('lesson-', '')) : -1;
  const activeLesson = activeLessonIndex >= 0 ? lessons[activeLessonIndex] : null;

  const renderVideoPlayer = (url: string) => {
    if (!url) return null;
    let youtubeId = null;
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    if (ytMatch && ytMatch[1]) {
      youtubeId = ytMatch[1];
    }
    if (youtubeId) {
      return (
        <iframe 
          className="absolute inset-0 w-full h-full rounded-b-none md:rounded-b-2xl"
          src={`https://www.youtube.com/embed/${youtubeId}?rel=0&showinfo=0`} 
          title="YouTube video player" 
          frameBorder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen
        ></iframe>
      );
    }
    let vimeoId = null;
    const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
    if (vimeoMatch && vimeoMatch[1]) {
      vimeoId = vimeoMatch[1];
      return (
        <iframe 
          className="absolute inset-0 w-full h-full rounded-b-none md:rounded-b-2xl"
          src={`https://player.vimeo.com/video/${vimeoId}`} 
          title="Vimeo video player" 
          frameBorder="0" 
          allow="autoplay; fullscreen; picture-in-picture" 
          allowFullScreen
        ></iframe>
      );
    }
    return (
      <video className="absolute inset-0 w-full h-full object-cover rounded-b-none md:rounded-b-2xl bg-black" controls>
        <source src={url} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    );
  };

  return (
    <div 
      className="flex flex-col md:flex-row w-full max-w-7xl mx-auto bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xl" 
      style={{ height: 'calc(100vh - 120px)', minHeight: '600px' }}
    >
      {/* Sidebar Navigation */}
      <div className={`${isSidebarOpen ? 'w-full md:w-80 border-r' : 'w-0 border-r-0'} border-gray-200 dark:border-slate-800 flex-shrink-0 flex flex-col bg-gray-50 dark:bg-slate-950 transition-all duration-300 overflow-hidden`}>
        <div className="p-6 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-[#0A0A0A] flex-shrink-0 w-80">
          <h2 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-2 leading-tight">{courseTitle}</h2>
          <div className="mt-4 bg-gray-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
             <div 
               className="bg-gradient-to-r from-blue-600 to-purple-600 h-full rounded-full transition-all duration-1000 ease-out" 
               style={{ width: `${Math.round((Object.keys(completedLessons).length / (lessons.length || 1)) * 100)}%` }}
             />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-bold uppercase tracking-wider">{Object.keys(completedLessons).length} of {lessons.length} lessons completed</p>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 w-80">
          <div className="px-5 mb-3 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Modules</div>
          <div className="space-y-1 px-3">
            {lessons.map((lesson, idx) => {
              const isCompleted = completedLessons[lesson.documentId];
              const isActive = activeTab === `lesson-${idx}`;
              
              return (
                <button 
                  key={lesson.documentId}
                  onClick={() => setActiveTab(`lesson-${idx}`)}
                  className={`w-full text-left px-4 py-3.5 rounded-xl flex items-start gap-3 transition-all duration-200 ${
                    isActive 
                      ? 'bg-white dark:bg-slate-800 shadow-sm border border-gray-200 dark:border-slate-700 transform scale-[1.02]' 
                      : 'hover:bg-gray-100 dark:hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    isCompleted 
                      ? 'bg-blue-500 border-blue-500 text-white' 
                      : isActive 
                        ? 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30' 
                        : 'border-gray-300 dark:border-slate-600'
                  }`}>
                    {isCompleted && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <div className="flex-1">
                    <span className={`text-sm font-semibold leading-snug line-clamp-2 ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                      {idx + 1}. {lesson.title}
                    </span>
                  </div>
                </button>
              );
            })}
            
            {quiz && (
              <div className="pt-4 mt-4 border-t border-gray-200 dark:border-slate-800 px-3 pb-8">
                <button 
                  onClick={() => setActiveTab('quiz')}
                  className={`w-full text-left px-4 py-4 rounded-2xl flex items-center gap-3 transition-all duration-300 ${
                    activeTab === 'quiz'
                      ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30 scale-[1.02]' 
                      : 'hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-800'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    activeTab === 'quiz' ? 'bg-white/20' : 'bg-purple-100 dark:bg-purple-900/50 text-purple-600'
                  }`}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  </div>
                  <div className="flex-1">
                    <span className={`text-sm font-bold block ${activeTab === 'quiz' ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                      Final Assessment
                    </span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#0A0A0A] relative">
        
        {/* Top Toolbar */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-[#0A0A0A] flex-shrink-0 z-20">
           <div className="flex items-center gap-4">
             <button 
               onClick={() => setIsSidebarOpen(!isSidebarOpen)}
               className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 transition-colors hidden md:flex items-center gap-2 font-medium text-sm"
               title={isSidebarOpen ? "Theater Mode" : "Show Modules"}
             >
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 {isSidebarOpen ? (
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                 ) : (
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                 )}
               </svg>
               {isSidebarOpen ? 'Theater Mode' : 'Show Modules'}
             </button>
             
             {/* Mobile toggle */}
             <button 
               onClick={() => setIsSidebarOpen(!isSidebarOpen)}
               className="md:hidden p-2 text-gray-500"
             >
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
             </button>
             <h2 className="font-bold text-gray-900 dark:text-white truncate md:hidden max-w-[200px]">{courseTitle}</h2>
           </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab.startsWith('lesson-') && activeLesson ? (
            <div className="flex flex-col w-full pb-12">
              {/* Video Player */}
              <div className="w-full bg-black relative shadow-lg z-10 aspect-video md:rounded-b-2xl overflow-hidden">
                {activeLesson.videoUrl ? (
                  renderVideoPlayer(activeLesson.videoUrl)
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-gray-900">
                    <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    <span className="text-gray-400 font-medium tracking-wide">No video available for this lesson.</span>
                  </div>
                )}
              </div>
              
              <div className="max-w-4xl mx-auto w-full px-6 pt-10">
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-8 tracking-tight">{activeLesson.title}</h1>
                
                {/* Content Tabs */}
                <div className="flex border-b border-gray-200 dark:border-slate-800 mb-8">
                  <button 
                    onClick={() => setContentTab('overview')}
                    className={`px-6 py-4 text-sm font-bold uppercase tracking-widest border-b-2 transition-colors ${contentTab === 'overview' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                  >
                    Overview
                  </button>
                  <button 
                    onClick={() => setContentTab('notes')}
                    className={`px-6 py-4 text-sm font-bold uppercase tracking-widest border-b-2 transition-colors ${contentTab === 'notes' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                  >
                    My Notes
                  </button>
                </div>

                {contentTab === 'overview' ? (
                  <div className="prose prose-lg dark:prose-invert prose-blue max-w-none text-gray-700 dark:text-gray-300">
                    {activeLesson.content || 'No text content provided for this lesson.'}
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-slate-800">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      Personal Notes
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">These notes are saved automatically to your browser.</p>
                    <textarea 
                      className="w-full h-64 p-4 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#0A0A0A] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      placeholder="Type your notes here..."
                      value={lessonNotes[activeLesson.documentId] || ''}
                      onChange={(e) => handleSaveNote(activeLesson.documentId, e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'quiz' && quiz ? (
            <div className="p-6 md:p-12 max-w-3xl mx-auto w-full pb-20">
              <div className="text-center mb-10">
                <div className="inline-block p-4 bg-purple-100 dark:bg-purple-900/30 rounded-3xl text-purple-600 dark:text-purple-400 mb-4 shadow-inner ring-1 ring-purple-200 dark:ring-purple-800">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
                <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2">{quiz.title}</h1>
                {quiz.description && <p className="text-gray-500 dark:text-gray-400">{quiz.description}</p>}
              </div>

              {quizResult ? (
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-10 shadow-2xl border border-gray-100 dark:border-slate-800 text-center relative overflow-hidden">
                  <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mb-4">Final Score</p>
                  <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-purple-500 to-blue-600 mb-8">
                    {quizResult.score} <span className="text-4xl text-gray-300 dark:text-slate-700">/ {quizResult.totalQuestions}</span>
                  </div>
                  <div className="mt-8">
                     <button onClick={() => router.push('/dashboard')} className="px-8 py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
                       Return to Dashboard
                     </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {quiz.questions?.map((q: any, index: number) => (
                    <div key={q.id || index} className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-slate-800">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-sm mr-3">{index + 1}</span> 
                        {q.text}
                      </h3>
                      <div className="space-y-3">
                        {q.options?.map((opt: string, optIdx: number) => (
                          <label key={optIdx} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            answers[q.id] === opt 
                              ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 shadow-sm' 
                              : 'border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50'
                          }`}>
                            <input 
                              type="radio" 
                              name={`question-${q.id}`} 
                              value={opt}
                              checked={answers[q.id] === opt}
                              onChange={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                              className="w-5 h-5 text-purple-600 bg-white border-gray-300"
                            />
                            <span className={`text-base font-medium ${answers[q.id] === opt ? 'text-purple-900 dark:text-purple-100' : 'text-gray-700 dark:text-gray-300'}`}>
                              {opt}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-end pt-6">
                    <button
                      onClick={handleQuizSubmit}
                      disabled={submittingQuiz}
                      className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-blue-700 hover:shadow-lg disabled:opacity-50"
                    >
                      {submittingQuiz ? 'Submitting...' : 'Submit Assessment'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-500 py-32">
              <svg className="w-16 h-16 text-gray-300 dark:text-slate-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              <p className="text-lg">Select a module to begin your learning journey.</p>
            </div>
          )}
        </div>

        {/* Bottom Bar Navigation */}
        <div className="h-20 border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-[#0A0A0A] flex items-center justify-between px-6 flex-shrink-0 z-20">
          <button 
            onClick={() => navigateTo('prev')}
            disabled={activeLessonIndex === 0}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Previous
          </button>

          <div className="flex items-center gap-4">
            {activeLesson && !completedLessons[activeLesson.documentId] && !activeTab.includes('quiz') ? (
              <button
                onClick={() => markLessonComplete(activeLesson.documentId)}
                disabled={markingComplete}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {markingComplete ? 'Marking...' : 'Mark Complete'}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
              </button>
            ) : activeLesson && completedLessons[activeLesson.documentId] && !activeTab.includes('quiz') ? (
              <div className="hidden sm:flex px-6 py-2.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg font-bold text-sm border border-green-200 dark:border-green-800/50 items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                Completed
              </div>
            ) : null}

            <button 
              onClick={() => navigateTo('next')}
              disabled={activeLessonIndex === lessons.length - 1 && !quiz}
              className="flex items-center gap-2 px-4 py-2 text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>

      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowRatingModal(false)}
              className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-gray-50 dark:bg-slate-800 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Rate this Course</h2>
              <p className="text-gray-500 dark:text-gray-400">Share your experience to help others.</p>
            </div>
            
            <div className="flex justify-center gap-2 mb-8">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRatingValue(star)}
                  className="focus:outline-none transform hover:scale-110 transition-transform"
                >
                  <svg 
                    className={`w-12 h-12 ${star <= ratingValue ? 'fill-current text-yellow-400' : 'text-gray-200 dark:text-slate-700'}`} 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>

            <div className="mb-8">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Write a Review (Optional)</label>
              <textarea 
                rows={4}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="What did you like about this course?"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white resize-none"
              />
            </div>

            <button 
              onClick={submitRating}
              disabled={isSubmittingRating || ratingValue === 0}
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {isSubmittingRating ? 'Saving...' : existingRating ? 'Update Review' : 'Submit Review'}
            </button>
          </div>
        </div>
      )}

      {/* Floating Rate Button for Completed Course */}
      {Math.round((Object.keys(completedLessons).length / (lessons.length || 1)) * 100) === 100 && (
        <button
          onClick={() => setShowRatingModal(true)}
          className="fixed bottom-6 right-6 z-50 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-black rounded-full shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
          {existingRating ? 'Edit Review' : 'Rate Course'}
        </button>
      )}
    </div>
  );
}
