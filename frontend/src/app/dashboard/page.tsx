'use client';

import { useAuth } from '@/context/AuthContext';

export default function DashboardOverview() {
  const { user } = useAuth();

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Overview</h2>
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="text-xl font-semibold mb-2">Welcome back, {user?.username}!</h3>
        <p className="text-gray-600">
          You are logged in as <span className="font-semibold text-blue-600">{user?.roleType || 'Student'}</span>.
          Use the sidebar to navigate to your accessible areas.
        </p>
      </div>
    </div>
  );
}
