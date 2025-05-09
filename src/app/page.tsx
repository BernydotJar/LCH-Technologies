import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Lightbulb, Briefcase, MessageSquare, BarChart3 } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center space-y-16 md:space-y-24">
      {/* Hero Section */}
      <section className="w-full text-center py-16 md:py-24 rounded-xl shadow-lg bg-gradient-to-br from-primary via-primary/90 to-accent/30 text-primary-foreground">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Innovate. Transform. Succeed.
          </h1>
          <p className="text-lg md:text-2xl mb-10 max-w-3xl mx-auto">
            TechFront empowers your business with cutting-edge technology solutions designed for growth and efficiency.
          </p>
          <div className="space-x-4">
            <Button size="lg" asChild className="bg-accent text-accent-foreground hover:bg-accent/90 transition-all duration-300 transform hover:scale-105 shadow-md">
              <Link href="/solutions">Discover Our Solutions <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary transition-all duration-300 transform hover:scale-105 shadow-md">
              <Link href="/contact">Request a Demo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Placeholder: About Us Section */}
      <section id="about" className="w-full py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-foreground">About TechFront</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            We are a passionate team of innovators and problem-solvers dedicated to delivering impactful technology solutions. Our mission is to drive your success through strategic application of the latest advancements.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="mx-auto bg-primary/10 text-primary rounded-full p-3 w-fit mb-2">
                  <Lightbulb size={32} />
                </div>
                <CardTitle>Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">To empower businesses with transformative technology that fuels growth and innovation.</p>
              </CardContent>
            </Card>
            <Card className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="mx-auto bg-primary/10 text-primary rounded-full p-3 w-fit mb-2">
                  <Briefcase size={32} />
                </div>
                <CardTitle>Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">To be the leading partner for businesses seeking to navigate the complexities of the digital age.</p>
              </CardContent>
            </Card>
            <Card className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="mx-auto bg-primary/10 text-primary rounded-full p-3 w-fit mb-2">
                  <BarChart3 size={32} />
                </div>
                <CardTitle>Our Values</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Innovation, Integrity, Collaboration, and Customer Centricity guide everything we do.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Placeholder: Solutions/Services Section */}
      <section id="solutions" className="w-full py-12 md:py-16 bg-secondary rounded-lg">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold mb-10 text-foreground">Our Expertise</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {['Custom Software Development', 'Cloud Solutions', 'AI & Machine Learning', 'Data Analytics', 'Cybersecurity', 'IT Consulting'].map((service) => (
              <Card key={service} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-primary">{service}</CardTitle>
                  <CardDescription>Brief description of {service.toLowerCase()} and its benefits.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="link" asChild className="text-accent-foreground hover:text-primary">
                    <Link href={`/solutions/${service.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')}`}>Learn More <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Placeholder: Call to Action / Contact Section Preview */}
      <section id="contact-preview" className="w-full py-12 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <Card className="max-w-2xl mx-auto p-6 md:p-10 shadow-xl bg-gradient-to-r from-accent/80 to-primary/80 text-primary-foreground">
            <h2 className="text-3xl md:text-4xl font-semibold mb-6">Ready to Elevate Your Business?</h2>
            <p className="text-lg mb-8">
              Let's discuss how TechFront can tailor solutions to meet your unique challenges and goals.
            </p>
            <Button size="lg" variant="secondary" asChild className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 transition-all duration-300 transform hover:scale-105 shadow-md">
              <Link href="/contact">Get In Touch <MessageSquare className="ml-2 h-5 w-5" /></Link>
            </Button>
          </Card>
        </div>
      </section>
    </div>
  );
}
