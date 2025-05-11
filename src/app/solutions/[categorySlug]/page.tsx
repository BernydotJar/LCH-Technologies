
import Link from 'next/link';
import Image from 'next/image';
import { getCategories, getCategoryBySlug, Service } from '@/data/service-catalog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle } from 'lucide-react';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import type { Metadata } from 'next';

type Props = {
  params: { categorySlug: string };
};

export async function generateStaticParams() {
  const categories = getCategories();
  return categories.map((category) => ({
    categorySlug: category.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = getCategoryBySlug(params.categorySlug);
  if (!category) {
    return {
      title: 'Category Not Found',
      description: 'The requested service category could not be found.',
    };
  }
  return {
    title: `${category.name} - LCH Solutions`,
    description: category.description,
  };
}


export default function ServiceCategoryPage({ params }: Props) {
  const category = getCategoryBySlug(params.categorySlug);

  if (!category) {
    return <div className="container mx-auto py-12 px-4 text-center">Category not found.</div>;
  }

  const breadcrumbItems = [
    { href: '/', label: 'Home' },
    { href: '/solutions', label: 'Solutions' },
    { href: `/solutions/${category.slug}`, label: category.name },
  ];

  return (
    <>
      <Breadcrumbs items={breadcrumbItems} />
      {/* Category Header */}
      <section className="relative py-20 md:py-28 rounded-xl shadow-lg overflow-hidden bg-gradient-to-br from-primary via-primary/80 to-accent/40 text-primary-foreground mb-12">
        {category.bannerImage && (
          <Image
            src={category.bannerImage}
            alt={`${category.name} services banner`}
            layout="fill"
            objectFit="cover"
            className="absolute inset-0 z-0 opacity-20"
            data-ai-hint={category.dataAiHint || "technology service"}
          />
        )}
        <div className="relative z-10 container mx-auto px-4 text-center">
          {category.icon && <category.icon className="h-16 w-16 text-accent mx-auto mb-4" />}
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{category.name}</h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto">{category.description}</p>
        </div>
      </section>

      {/* Sub-Category / Service Listing */}
      <section className="container mx-auto py-8 px-4">
        <h2 className="text-3xl font-semibold mb-8 text-center text-foreground">
          Services in {category.name}
        </h2>
        {category.services.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {category.services.map((service: Service) => {
              const benefitsToShow = category.slug === 'power-platform' ? service.benefits : service.benefits.slice(0,2);
              const showMoreIndicator = category.slug !== 'power-platform' && service.benefits.length > 2;
              const ServiceIcon = service.serviceIcon;

              return (
                <Card key={service.id} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-1">
                      {ServiceIcon && <ServiceIcon className="h-7 w-7 text-primary shrink-0" />}
                      <CardTitle className="text-xl text-primary">{service.serviceName}</CardTitle>
                    </div>
                    <CardDescription className="text-sm leading-relaxed min-h-[60px]"> 
                      {service.shortDescription}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <h4 className="font-semibold mb-2 text-sm text-foreground">Key Benefits:</h4>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      {benefitsToShow.map((benefit, idx) => (
                        <li key={idx} className="flex items-start">
                          <CheckCircle className="h-3.5 w-3.5 text-green-500 mr-2 mt-0.5 shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                       {showMoreIndicator && <li className="text-xs text-muted-foreground/80">...and more</li>}
                    </ul>
                  </CardContent>
                  <CardContent className="mt-auto pt-4"> {/* Added pt-4 for spacing */}
                    <Button asChild variant="default" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Link href={`/solutions/${category.slug}/${service.serviceSlug}`}>
                        Learn More <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">No specific services listed for this category yet. Please check back soon or contact us for more information.</p>
        )}
      </section>
    </>
  );
}
