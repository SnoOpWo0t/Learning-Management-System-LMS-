'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchAPI } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function EnrollButton({ courseId }: { courseId: string }) {
  const { user, token, loading: authLoading } = useAuth();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [checking, setChecking] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (token && user) {
      checkEnrollment();
    } else if (!authLoading) {
      setChecking(false);
    }
  }, [token, user, authLoading, courseId]);

  const checkEnrollment = async () => {
    try {
      setChecking(true);
      const res = await fetchAPI(`/enrollments?filters[student][id][$eq]=${user?.id}&filters[course][documentId][$eq]=${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.length > 0) {
        setIsEnrolled(true);
      }
    } catch (err) {
      console.error('Error checking enrollment status:', err);
    } finally {
      setChecking(false);
    }
  };

  const handleEnroll = async () => {
    if (!token || !user) {
      router.push('/login');
      return;
    }

    try {
      setEnrolling(true);
      await fetchAPI('/enrollments', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          data: {
            student: user.documentId || user.id,
            course: courseId
          }
        })
      });
      setIsEnrolled(true);
      router.push(`/dashboard/courses/${courseId}/learn`);
    } catch (err: any) {
      console.error('Enrollment error:', err);
      alert(err.message || 'Failed to enroll in course. You might already be enrolled.');
      router.push(`/dashboard/courses/${courseId}/learn`);
    } finally {
      setEnrolling(false);
    }
  };

  if (authLoading || checking) {
    return (
      <div className="w-full py-4 bg-gray-100 dark:bg-slate-800 animate-pulse rounded-xl flex items-center justify-center text-gray-400 font-bold">
        Checking status...
      </div>
    );
  }

  // Case 1: Already Enrolled
  if (user && isEnrolled) {
    return (
      <Link 
        href={`/dashboard/courses/${courseId}/learn`}
        className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:-translate-y-1 flex items-center justify-center gap-2"
      >
        <span>Continue Learning</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </Link>
    );
  }

  // Case 2: Logged in, not yet enrolled
  if (user && !isEnrolled) {
    return (
      <button 
        onClick={handleEnroll}
        disabled={enrolling}
        className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {enrolling ? 'Enrolling...' : 'Enroll Now (Free)'}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    );
  }

  // Case 3: Logged out
  return (
    <Link 
      href="/login" 
      className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-1 flex items-center justify-center gap-2"
    >
      Sign in to Enroll
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    </Link>
  );
}
