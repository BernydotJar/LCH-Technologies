
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getCategories, commonBusinessChallenges } from '@/data/service-catalog';
import { ArrowRight } from 'lucide-react';
import Breadcrumbs from '@/components/shared/Breadcrumbs';

export const metadata = {
  title: 'Explore Our Solutions - LCH Technologies',
  description: 'Discover a comprehensive range of technology services designed to empower your business, from AI and ML to CORE engineering and RPA.',
};

export default function SolutionsPage() {
  const categories = getCategories();

  return (
    <>
      <Breadcrumbs items={[{ href: '/', label: 'Home' }, { href: '/solutions', label: 'Solutions' }]} />
      
      {/* Hero Section */}
      <section 
        className="relative w-full py-20 md:py-32 rounded-xl shadow-lg overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-accent/30 text-primary-foreground mb-16"
        data-ai-hint="technology innovation"
      >
        {/* Placeholder for video/animation - using a static image for now */}
        <Image 
          src="https://picsum.photos/1600/900?random=hero" 
          alt="Abstract technology background" 
          layout="fill" 
          objectFit="cover" 
          className="absolute inset-0 z-0 opacity-30"
          priority
        />
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Empowering Your Future with Intelligent Solutions
          </h1>
          <p className="text-lg md:text-2xl mb-10 max-w-3xl mx-auto">
            At LCH Technologies, we craft innovative solutions that drive growth, efficiency, and transformation. Explore our expertise across various technology domains.
          </p>
          <Button size="lg" asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="#service-categories">Explore Our Expertise <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </div>
      </section>

      {/* Problem-Oriented Teaser Section */}
      <section className="py-12 md:py-16 mb-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-semibold text-center mb-10 text-foreground">
            How Can We Accelerate Your Growth?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {commonBusinessChallenges.map((challenge) => (
              <Card key={challenge.title} className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <challenge.icon className="h-8 w-8 text-primary" />
                    <CardTitle className="text-xl text-primary">{challenge.title}</CardTitle>
                  </div>
                  <CardDescription>{challenge.description}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                  <Button variant="link" asChild className="p-0 text-accent-foreground hover:text-primary">
                    <Link href={challenge.link}>Learn More <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categorized Service Showcase */}
      <section id="service-categories" className="py-12 md:py-16 bg-secondary rounded-lg">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-semibold text-center mb-10 text-foreground">
            Our Service Categories
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <Link key={category.slug} href={`/solutions/${category.slug}`} passHref>
                <Card className="h-full flex flex-col cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1">
                  <CardHeader className="items-center text-center">
                    {category.icon && <category.icon className="h-12 w-12 text-primary mb-4" />}
                    <CardTitle className="text-2xl text-primary">{category.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow text-center">
                    <p className="text-muted-foreground mb-4">{category.description}</p>
                  </CardContent>
                  <CardContent className="text-center mt-auto">
                     <Button variant="outline" className="text-primary border-primary hover:bg-primary hover:text-primary-foreground">
                        Explore {category.name} <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
