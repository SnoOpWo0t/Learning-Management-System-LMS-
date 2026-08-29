import { fetchAPI } from '@/lib/api';
import Link from 'next/link';
import PublicNavbar from '@/components/PublicNavbar';

export const revalidate = 60; // ISR for blogs

export default async function PublicBlogPage() {
  let blogs = [];
  try {
    // Fetch only published blogs
    const res = await fetchAPI('/blog-posts?filters[status][$eq]=Published&populate=author');
    blogs = res.data || [];
  } catch (err) {
    console.error('Failed to fetch blogs');
  }

  return (
    <div className="min-h-screen bg-transparent">
      <PublicNavbar />

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center">Our Blog</h1>
        
        {blogs.length === 0 ? (
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-16 rounded-3xl border border-gray-200/50 dark:border-slate-800/50 text-center animate-slide-up shadow-sm">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Articles Yet</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">Check back soon! Our authors are crafting some amazing content.</p>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            {blogs.map((blog: any, index: number) => (
              <article key={blog.documentId} style={{ animationDelay: `${index * 100}ms` }} className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 hover-lift animate-slide-up opacity-0">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    <Link href={`/blog/${blog.documentId}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                      {blog.title}
                    </Link>
                  </h2>
                  <span className="text-sm font-medium text-gray-400 dark:text-gray-500">
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="prose dark:prose-invert text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                  {blog.body}
                </div>
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100 dark:border-slate-800">
                  <div className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-300">
                    <span className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mr-3 font-bold">
                       {blog.author?.username?.[0]?.toUpperCase() || 'A'}
                    </span>
                    {blog.author?.username || 'Admin'}
                  </div>
                  <Link href={`/blog/${blog.documentId}`} className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1">
                    Read More <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
