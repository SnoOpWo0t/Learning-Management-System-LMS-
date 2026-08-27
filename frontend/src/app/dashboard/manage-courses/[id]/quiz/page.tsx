'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchAPI } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useParams, useRouter } from 'next/navigation';

export default function ManageQuizPage() {
  const { token } = useAuth();
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  
  const [course, setCourse] = useState<any>(null);
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // New Question Form
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');

  const fetchQuizData = async () => {
    try {
      const res = await fetchAPI(`/courses/${courseId}?populate=quiz.questions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourse(res.data);
      setQuiz(res.data?.quiz);
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
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quiz) return;
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
    }
  };

  const handleDeleteQuestion = async (qId: string) => {
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
      <div className="space-y-6">
        {loading ? (
          <div className="loader">Loading...</div>
        ) : !course ? (
          <p className="text-red-500">Course not found.</p>
        ) : (
          <>
            <h2 className="text-3xl font-bold">Manage Quiz for: {course.title}</h2>
            
            {!quiz ? (
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <p className="text-gray-600 mb-4">This course does not have a quiz yet.</p>
                <button onClick={handleCreateQuiz} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Initialize Quiz
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Add Question Form */}
                <div className="bg-white p-6 rounded-xl shadow-sm border h-fit">
                  <h3 className="text-xl font-semibold mb-4">Add Question</h3>
                  <form onSubmit={handleAddQuestion} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Question Text</label>
                      <textarea required value={questionText} onChange={e => setQuestionText(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md" rows={2}></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Options</label>
                      {options.map((opt, i) => (
                        <input key={i} required type="text" placeholder={`Option ${i+1}`} value={opt} onChange={e => {
                          const newOpts = [...options];
                          newOpts[i] = e.target.value;
                          setOptions(newOpts);
                        }} className="mt-1 block w-full px-3 py-2 border rounded-md mb-2" />
                      ))}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Correct Answer (Must match exactly one option)</label>
                      <input required type="text" value={correctAnswer} onChange={e => setCorrectAnswer(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md" />
                    </div>
                    <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 w-full">
                      Add Question
                    </button>
                  </form>
                </div>

                {/* Questions List */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Questions ({quiz.questions?.length || 0})</h3>
                  {(!quiz.questions || quiz.questions.length === 0) ? (
                    <p className="text-gray-500">No questions added yet.</p>
                  ) : (
                    quiz.questions.map((q: any, idx: number) => (
                      <div key={q.documentId} className="bg-white p-4 rounded-xl shadow-sm border">
                        <div className="flex justify-between">
                          <span className="font-semibold">{idx + 1}. {q.text}</span>
                          <button onClick={() => handleDeleteQuestion(q.documentId)} className="text-red-600 text-sm hover:underline">Remove</button>
                        </div>
                        <ul className="mt-2 list-disc list-inside text-sm text-gray-600">
                          {q.options.map((opt: string, i: number) => (
                            <li key={i}>{opt}</li>
                          ))}
                        </ul>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
