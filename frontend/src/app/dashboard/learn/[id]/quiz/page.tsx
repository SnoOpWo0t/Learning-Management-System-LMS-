'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchAPI } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TakeQuizPage() {
  const { token } = useAuth();
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  
  const [course, setCourse] = useState<any>(null);
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
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
    if (token && courseId) fetchQuiz();
  }, [token, courseId]);

  const handleOptionChange = (questionId: string, optionValue: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionValue
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;
    
    // Check if all questions are answered
    const allAnswered = quiz.questions.every((q: any) => answers[q.documentId]);
    if (!allAnswered) {
      if (!confirm('You have unanswered questions. Are you sure you want to submit?')) return;
    }

    setSubmitting(true);
    try {
      const res = await fetchAPI('/quiz-results', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          data: {
            quiz: quiz.documentId,
            answers: answers
          }
        })
      });
      setResult(res.data);
    } catch (err) {
      alert('Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center mt-20"><div className="loader"></div></div>;

  if (!course || !quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <ProtectedRoute allowedRoles={['Student']}>
        <div className="bg-white p-8 rounded-xl shadow-sm border text-center max-w-2xl mx-auto mt-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Quiz Available</h2>
          <p className="text-gray-600 mb-6">There is no quiz available for this course yet.</p>
          <Link href={`/dashboard/learn/${courseId}`} className="text-blue-600 hover:underline">
            &larr; Back to Course
          </Link>
        </div>
      </ProtectedRoute>
    );
  }

  if (result) {
    return (
      <ProtectedRoute allowedRoles={['Student']}>
        <div className="bg-white p-8 rounded-xl shadow-sm border text-center max-w-2xl mx-auto mt-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Quiz Completed!</h2>
          <div className="w-48 h-48 rounded-full border-8 mx-auto flex items-center justify-center mb-8 border-purple-500 text-purple-600">
             <div className="text-center">
               <span className="text-5xl font-black">{result.attributes.score}%</span>
               <div className="text-sm font-semibold mt-1 text-gray-500 uppercase tracking-widest">Score</div>
             </div>
          </div>
          <p className="text-lg text-gray-700 mb-8">
            You got {result.attributes.correctAnswers} out of {result.attributes.totalQuestions} questions correct.
          </p>
          <Link href={`/dashboard/learn/${courseId}`} className="px-6 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700">
            Back to Course
          </Link>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['Student']}>
      <div className="max-w-3xl mx-auto pb-20">
        <div className="mb-8">
          <Link href={`/dashboard/learn/${courseId}`} className="text-blue-600 hover:underline text-sm font-medium mb-4 inline-block">
            &larr; Back to Course
          </Link>
          <h2 className="text-3xl font-bold">{quiz.title}</h2>
          <p className="text-gray-600 mt-2">Answer the following questions to test your knowledge.</p>
        </div>
        
        <div className="space-y-8">
          {quiz.questions.map((q: any, index: number) => (
            <div key={q.documentId} className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="font-semibold text-lg mb-4">
                <span className="text-gray-400 mr-2">{index + 1}.</span> {q.text}
              </h3>
              <div className="space-y-3">
                {q.options.map((opt: string, i: number) => (
                  <label key={i} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input 
                      type="radio" 
                      name={`question_${q.documentId}`} 
                      value={opt}
                      checked={answers[q.documentId] === opt}
                      onChange={() => handleOptionChange(q.documentId, opt)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-gray-700">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-end">
           <button 
             onClick={handleSubmitQuiz} 
             disabled={submitting}
             className="px-8 py-3 bg-purple-600 text-white rounded-full font-bold shadow-md hover:bg-purple-700 disabled:opacity-50 transition-colors"
           >
             {submitting ? 'Submitting...' : 'Submit Quiz'}
           </button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
