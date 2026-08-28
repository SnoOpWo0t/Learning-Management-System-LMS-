import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#0f0a14] dark:bg-black pt-20 pb-10 text-white mt-auto w-full">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          {/* Branding Column */}
          <div className="flex flex-col lg:pr-12">
            <span className="text-3xl font-black tracking-widest mb-6 uppercase">LMS<span className="text-blue-500">.</span></span>
            <p className="text-slate-300 text-sm leading-relaxed mb-6 font-medium">
              Premium educational content designed to elevate your career and skills.
            </p>
            <p className="text-white font-bold text-sm">
              Join our community @LMSPlatform
            </p>
          </div>
          
          {/* Link Column 1 */}
          <div className="flex flex-col">
            <h4 className="font-bold text-white mb-6">Platform</h4>
            <div className="flex flex-col gap-4 text-sm text-slate-300">
              <Link href="#" className="hover:text-blue-400 hover:translate-x-1 transition-all duration-300">All Courses</Link>
              <Link href="#" className="hover:text-blue-400 hover:translate-x-1 transition-all duration-300">Career Paths</Link>
              <Link href="#" className="hover:text-blue-400 hover:translate-x-1 transition-all duration-300">Instructors</Link>
              <Link href="#" className="hover:text-blue-400 hover:translate-x-1 transition-all duration-300">Pricing</Link>
            </div>
          </div>
          
          {/* Link Column 2 */}
          <div className="flex flex-col">
            <h4 className="font-bold text-white mb-6">Quick Links</h4>
            <div className="flex flex-col gap-4 text-sm text-slate-300">
              <Link href="/dashboard" className="hover:text-blue-400 hover:translate-x-1 transition-all duration-300">Dashboard</Link>
              <Link href="/login" className="hover:text-blue-400 hover:translate-x-1 transition-all duration-300">Student Login</Link>
              <Link href="/register" className="hover:text-blue-400 hover:translate-x-1 transition-all duration-300">Register</Link>
              <Link href="#" className="hover:text-blue-400 hover:translate-x-1 transition-all duration-300">Help Center</Link>
            </div>
          </div>
          
          {/* Link Column 3 */}
          <div className="flex flex-col">
            <h4 className="font-bold text-white mb-6">Stay In Touch</h4>
            <div className="flex flex-col gap-4 text-sm text-slate-300">
              <Link href="#" className="hover:text-blue-400 hover:translate-x-1 transition-all duration-300">Twitter</Link>
              <Link href="#" className="hover:text-blue-400 hover:translate-x-1 transition-all duration-300">LinkedIn</Link>
              <Link href="#" className="hover:text-blue-400 hover:translate-x-1 transition-all duration-300">YouTube</Link>
              <Link href="#" className="hover:text-blue-400 hover:translate-x-1 transition-all duration-300">GitHub</Link>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col-reverse md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <p>&copy; 2026 LMS Platform. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
