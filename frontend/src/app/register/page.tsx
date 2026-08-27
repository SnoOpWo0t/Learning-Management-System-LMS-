'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { fetchAPI } from '@/lib/api';
import Link from 'next/link';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await fetchAPI('/auth/local/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
      });
      login(data.jwt, data.user);
      router.push('/dashboard');
    } catch (err) {
      setError('Registration failed. Username or email may be taken.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg border relative overflow-hidden transition-all">
        {/* Decorative Blur */}
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-green-500 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-blue-500 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>

        <div className="text-center relative z-10">
          <Link href="/" className="inline-block mb-4 text-3xl font-black text-blue-600 tracking-tight hover:text-blue-700 transition-colors">
            LMS<span className="text-gray-800">.</span>
          </Link>
          <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
          <p className="text-sm text-gray-500 mt-2">Join the future of e-learning today.</p>
        </div>
        
        {error && (
          <div className="p-4 text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl relative z-10">
            {error}
          </div>
        )}
        
        <form className="space-y-4 relative z-10" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 rounded-xl"
              placeholder="johndoe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 rounded-xl"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 rounded-xl"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 mt-6 text-white bg-blue-600 rounded-xl font-bold hover:bg-blue-700 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <div className="flex justify-center"><div className="loader !w-5 !h-5 !border-2"></div></div> : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 relative z-10">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
