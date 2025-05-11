
import { getServiceBySlugs, Service, ServiceFeature, ServiceUseCase } from '@/data/service-catalog';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ExternalLink, Briefcase, Zap, Users, Download } from 'lucide-react';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import type { Metadata } from 'next';
import Link from 'next/link';

type Props = {
  params: { categorySlug: string; serviceSlug: string };
};

export async function generateStaticParams() {
  const services = getServices(); // Assuming getServices fetches all services or is an alias for the services array
  return services.map((service) => ({
    categorySlug: service.categorySlug,
    serviceSlug: service.serviceSlug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = getServiceBySlugs(params.categorySlug, params.serviceSlug);
  if (!service) {
    return {
      title: 'Service Not Found',
    };
  }
  return {
    title: `${service.serviceName} - LCH Solution`,
    description: service.shortDescription,
  };
}

function MediaPlaceholder({ media }: { media: Service['mediaPlaceholder'] }) {
  if (!media) return null;

  const basePlaceholderClasses = "w-full aspect-video rounded-lg bg-muted flex items-center justify-center text-muted-foreground shadow-inner overflow-hidden";

  return (
    <div className="my-8">
      {media.type === 'video' && media.src?.includes('youtube.com/embed') && (
        <div className="aspect-video">
          <iframe
            width="100%"
            height="100%"
            src={media.src}
            title={media.caption || "Service Video"}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="rounded-lg shadow-lg"
          ></iframe>
        </div>
      )}
      {(media.type === 'diagram' || media.type === 'gif') && media.src && (
         <Image 
            src={media.src} 
            alt={media.caption || 'Service Media'} 
            width={800} 
            height={450} 
            className="rounded-lg shadow-lg object-cover"
            data-ai-hint={media.type === 'diagram' ? 'flowchart infographic' : 'animated process'}
          />
      )}
      {media.type === 'gallery' && media.galleryImages && media.galleryImages.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {media.galleryImages.map((imgSrc, idx) => (
            <Image 
              key={idx} 
              src={imgSrc} 
              alt={`${media.caption} - Image ${idx + 1}`} 
              width={400} 
              height={300} 
              className="rounded-lg shadow-lg object-cover aspect-video" 
              data-ai-hint="product screenshot"
            />
          ))}
        </div>
      )}
      {media.caption && <p className="text-sm text-muted-foreground mt-2 text-center">{media.caption}</p>}
       {media.type === 'video' && !media.src?.includes('youtube.com/embed') && (
         <div className={basePlaceholderClasses} data-ai-hint="video play button">
          <span>Video Placeholder: {media.caption || 'Explainer Video'}</span>
        </div>
      )}
    </div>
  );
}


export default function ServiceDetailPage({ params }: Props) {
  const service = getServiceBySlugs(params.categorySlug, params.serviceSlug);

  if (!service) {
    return <div className="container mx-auto py-12 px-4 text-center">Service not found.</div>;
  }
  
  const breadcrumbItems = [
    { href: '/', label: 'Home' },
    { href: '/solutions', label: 'Solutions' },
    { href: `/solutions/${service.categorySlug}`, label: service.category },
    { href: `/solutions/${service.categorySlug}/${service.serviceSlug}`, label: service.serviceName },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <Breadcrumbs items={breadcrumbItems} />

      {/* Header */}
      <header className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">{service.serviceName}</h1>
        <p className="text-xl text-primary font-medium">{service.tagline}</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-10">
          {/* Overview Section */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground">What It Is</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{service.overview}</p>
            </CardContent>
          </Card>

          {/* Prime Media Integration Area */}
          {service.mediaPlaceholder && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-foreground">Visual Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <MediaPlaceholder media={service.mediaPlaceholder} />
              </CardContent>
            </Card>
          )}
          
          {/* Key Features Section */}
          {service.features && service.features.length > 0 && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-foreground">Key Features / What&apos;s Included</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-6">
                  {service.features.map((feature: ServiceFeature, index: number) => (
                    <div key={index} className="flex items-start space-x-3">
                      {feature.icon ? <feature.icon className="h-6 w-6 text-primary mt-1 shrink-0" /> : <Zap className="h-6 w-6 text-primary mt-1 shrink-0" />}
                      <div>
                        <h4 className="font-semibold text-foreground">{feature.name}</h4>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Use Cases / Applications Section */}
          {service.useCases && service.useCases.length > 0 && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-foreground">Applications & Use Cases</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {service.useCases.map((useCase: ServiceUseCase, index: number) => (
                  <div key={index} className="flex flex-col sm:flex-row items-start gap-4 p-4 border rounded-lg bg-secondary/50">
                    {useCase.image && (
                      <Image 
                        src={useCase.image} 
                        alt={useCase.title} 
                        width={150} 
                        height={100} 
                        className="rounded-md object-cover sm:w-1/4" 
                        data-ai-hint="industry example"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground mb-1">{useCase.title}</h4>
                      <p className="text-sm text-muted-foreground">{useCase.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <aside className="lg:col-span-1 space-y-8 sticky top-24 self-start">
          {/* Key Benefits Section */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-foreground">Key Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {service.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Related Products/Technologies Section */}
          {service.relatedProducts && service.relatedProducts.length > 0 && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-foreground">Related Technologies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {service.relatedProducts.map((product, index) => (
                    <span key={index} className="px-3 py-1 text-xs bg-accent text-accent-foreground rounded-full shadow-sm">
                      {product}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contextual Call to Action */}
          <Card className="shadow-xl bg-gradient-to-br from-primary to-accent text-primary-foreground p-6 text-center">
            <CardTitle className="text-2xl mb-3">Ready to Get Started?</CardTitle>
            <p className="mb-6 text-sm">Let&apos;s discuss how {service.serviceName} can help your business.</p>
            <Button size="lg" variant="secondary" asChild className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90">
              <Link href={`/contact?service_interest=${service.serviceSlug}`}>
                Request Consultation <ExternalLink className="ml-2 h-5 w-5" />
              </Link>
            </Button>
             <Button size="sm" variant="link" asChild className="mt-4 text-primary-foreground/80 hover:text-primary-foreground">
              <Link href={`/solutions/${service.categorySlug}/${service.serviceSlug}/service-brief.pdf`} target="_blank" download>
                <Download className="mr-2 h-4 w-4" /> Download Service Brief (PDF)
              </Link>
            </Button>
          </Card>
        </aside>
      </div>
    </div>
  );
}

// Helper function to get all services, replace with actual data fetching if needed
const getServices = (): Service[] => {
  // In a real app, this would fetch from your data source
  // For now, importing directly from service-catalog
  // This is a simplified version of what might be in a real data fetching layer
  const { services } = require('@/data/service-catalog'); 
  return services;
};
