
import { getBlogPostBySlug, getBlogPosts, BlogPostContent } from '@/data/blog-posts';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CalendarDays, UserCircle } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/shared/Breadcrumbs';

type Props = {
  params: { slug: string };
};

export async function generateStaticParams() {
  const posts = getBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getBlogPostBySlug(params.slug);
  if (!post) {
    return {
      title: 'Blog Post Not Found',
      description: 'The requested blog post could not be found.',
    };
  }
  return {
    title: `${post.title} - TechFront Blog`,
    description: post.excerpt,
  };
}

const renderContent = (content: BlogPostContent[]) => {
  return content.map((item, index) => {
    switch (item.type) {
      case 'heading':
        const Tag = item.level === 1 ? 'h1' : item.level === 2 ? 'h2' : item.level === 3 ? 'h3' : 'h4';
        return <Tag key={index} className={`text-${4-item.level+1}xl font-semibold my-6 text-foreground`}>{item.text}</Tag>;
      case 'paragraph':
        return <p key={index} className="my-4 leading-relaxed text-muted-foreground whitespace-pre-line">{item.text}</p>;
      case 'list':
        return (
          <ul key={index} className="list-disc list-inside my-4 pl-4 space-y-1 text-muted-foreground">
            {item.items.map((listItem, i) => <li key={i}>{listItem}</li>)}
          </ul>
        );
      default:
        return null;
    }
  });
};

export default function BlogPostPage({ params }: Props) {
  const post = getBlogPostBySlug(params.slug);

  if (!post) {
    return <div className="container mx-auto py-12 px-4 text-center">Blog post not found.</div>;
  }

  const breadcrumbItems = [
    { href: '/', label: 'Home' },
    { href: '/blog', label: 'Blog' },
    { href: `/blog/${post.slug}`, label: post.title },
  ];

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Breadcrumbs items={breadcrumbItems} />

      <article className="prose dark:prose-invert lg:prose-xl max-w-none">
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{post.title}</h1>
          <div className="flex items-center space-x-4 text-muted-foreground text-sm">
            <div className="flex items-center">
              <CalendarDays className="mr-2 h-4 w-4" />
              <span>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center">
              <UserCircle className="mr-2 h-4 w-4" />
              <span>By {post.author}</span>
            </div>
          </div>
        </header>

        {post.image && (
          <div className="relative w-full h-72 md:h-96 mb-8 rounded-lg overflow-hidden shadow-lg">
            <Image
              src={post.image}
              alt={post.title}
              layout="fill"
              objectFit="cover"
              priority
              data-ai-hint="article header"
            />
          </div>
        )}

        <div className="prose-p:text-muted-foreground prose-headings:text-foreground prose-strong:text-foreground">
          {renderContent(post.content)}
        </div>
        

        {post.sources && post.sources.length > 0 && (
          <section className="mt-12 pt-8 border-t border-border">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Sources</h2>
            <ul className="list-disc list-inside space-y-2 text-sm">
              {post.sources.map((source, index) => (
                <li key={index} className="text-muted-foreground">
                  {source.url ? (
                    <Link href={source.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {source.text}
                    </Link>
                  ) : (
                    source.text
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </div>
  );
}
