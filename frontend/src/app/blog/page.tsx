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
          <p className="text-center text-gray-500">No articles published yet. Check back soon!</p>
        ) : (
          <div className="space-y-8">
            {blogs.map((blog: any) => (
              <article key={blog.documentId} className="bg-white p-8 rounded-2xl shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold">
                    <Link href={`/blog/${blog.documentId}`} className="hover:text-blue-600">
                      {blog.title}
                    </Link>
                  </h2>
                  <span className="text-sm text-gray-400">
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="prose text-gray-600 line-clamp-3 mb-4">
                  {blog.body}
                </div>
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center text-sm font-medium text-gray-600">
                    <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                       {blog.author?.username?.[0]?.toUpperCase() || 'A'}
                    </span>
                    {blog.author?.username || 'Admin'}
                  </div>
                  <Link href={`/blog/${blog.documentId}`} className="text-blue-600 font-semibold hover:underline">
                    Read More &rarr;
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
