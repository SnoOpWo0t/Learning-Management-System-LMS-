import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-black text-blue-600 tracking-tight">LMS<span className="text-gray-800">.</span></Link>
          <div className="flex gap-4">
            <Link href="/blog" className="text-gray-600 font-medium hover:text-blue-600 mt-2 mr-4">Blog</Link>
            <Link href="/login" className="text-gray-600 font-medium hover:text-blue-600 mt-2">Login</Link>
            <Link href="/register" className="px-4 py-2 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors">Get Started</Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight mb-6 leading-tight">
            The Future of <span className="text-blue-600">Learning</span> is Here.
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            A modern, robust, and beautiful Learning Management System designed to empower students and instructors worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="px-8 py-4 bg-blue-600 text-white rounded-full font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
              Start Learning Now
            </Link>
            <Link href="/dashboard" className="px-8 py-4 bg-white text-gray-800 border border-gray-200 rounded-full font-bold text-lg hover:bg-gray-50 transition-colors shadow-sm">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </main>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 border rounded-2xl bg-gray-50 text-center hover:shadow-md transition-all">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">🎓</div>
              <h3 className="text-xl font-bold mb-3">Expert Instructors</h3>
              <p className="text-gray-600">Learn from industry professionals who are passionate about teaching and sharing knowledge.</p>
            </div>
            <div className="p-8 border rounded-2xl bg-gray-50 text-center hover:shadow-md transition-all">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">📈</div>
              <h3 className="text-xl font-bold mb-3">Track Progress</h3>
              <p className="text-gray-600">Monitor your learning journey with intuitive progress tracking and interactive quizzes.</p>
            </div>
            <div className="p-8 border rounded-2xl bg-gray-50 text-center hover:shadow-md transition-all">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">✍️</div>
              <h3 className="text-xl font-bold mb-3">Engaging Content</h3>
              <p className="text-gray-600">Read the latest articles from our community in our fully featured blog system.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-12 text-center">
        <p className="font-semibold">&copy; 2026 LMS Platform. Built by Senior Engineer.</p>
      </footer>
    </div>
  );
}
