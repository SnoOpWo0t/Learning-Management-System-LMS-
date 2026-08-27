import { fetchAPI } from '@/lib/api';
import Link from 'next/link';

export const revalidate = 60; // ISR

export default async function PublicBlogDetailsPage({ params }: { params: { id: string } }) {
  let blog = null;
  try {
    const res = await fetchAPI(`/blog-posts/${params.id}?populate=author`);
    if (res.data?.status === 'Published') {
      blog = res.data;
    }
  } catch (err) {
    console.error('Failed to fetch blog');
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Post Not Found</h1>
          <p className="text-gray-500 mb-6">The article you are looking for does not exist or has not been published yet.</p>
          <Link href="/blog" className="text-blue-600 hover:underline">&larr; Back to Blog</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/blog" className="text-sm font-medium text-gray-500 hover:text-gray-900">&larr; Back to Blog</Link>
          <Link href="/" className="text-xl font-black text-blue-600 tracking-tight">LMS<span className="text-gray-800">.</span></Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-16">
        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-6">{blog.title}</h1>
          <div className="flex items-center justify-center gap-4 text-gray-500 font-medium">
            <span className="flex items-center">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-2 text-sm">
                 {blog.author?.username?.[0]?.toUpperCase() || 'A'}
              </span>
              {blog.author?.username || 'Admin'}
            </span>
            <span>&bull;</span>
            <time>{new Date(blog.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</time>
          </div>
        </div>

        <article className="prose prose-lg prose-blue max-w-none text-gray-800 leading-relaxed whitespace-pre-wrap">
          {blog.body}
        </article>
      </main>
    </div>
  );
}
