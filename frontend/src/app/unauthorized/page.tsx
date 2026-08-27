export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-gray-900">
      <h1 className="text-4xl font-bold text-red-600 mb-4">403 Forbidden</h1>
      <p className="text-lg">You do not have permission to access this page.</p>
      <a href="/dashboard" className="mt-6 text-blue-600 hover:underline">
        Return to Dashboard
      </a>
    </div>
  );
}
