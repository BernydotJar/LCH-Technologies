
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getBlogPosts, BlogPost } from '@/data/blog-posts';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Blog - TechFront Marketing',
  description: 'Explore insights, articles, and news from TechFront Marketing on technology, innovation, and business solutions.',
};

export default function BlogPage() {
  const posts = getBlogPosts();

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Our Insights</h1>
        <p className="mt-4 text-lg leading-7 text-muted-foreground">
          Stay updated with the latest trends, thoughts, and news from the TechFront team.
        </p>
      </div>

      {posts.length === 0 ? (
        <p className="text-center text-muted-foreground">No blog posts available yet. Check back soon!</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} passHref>
              <Card className="h-full flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer">
                {post.image && (
                  <div className="relative w-full h-48">
                    <Image
                      src={post.image}
                      alt={post.title}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-t-lg"
                      data-ai-hint="technology article"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl text-primary">{post.title}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} - {post.author}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground line-clamp-3">{post.excerpt}</p>
                </CardContent>
                <CardContent className="mt-auto pt-4">
                  <div className="flex items-center text-sm text-accent-foreground hover:text-primary">
                    Read More <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
