'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Lightbulb, Briefcase, MessageSquare, BarChart3 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function Home() {
  const [language, setLanguage] = useState('en');

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    // Add more languages here
  ];

  const translations = {
    en: {
      heroTitle: 'Innovate. Transform. Succeed.',
      heroSubtitle: 'TechFront empowers your business with cutting-edge technology solutions designed for growth and efficiency.',
      discoverButton: 'Discover Our Solutions',
      requestDemoButton: 'Request a Demo',
      aboutTitle: 'About TechFront',
      aboutSubtitle: 'We are a passionate team of innovators and problem-solvers dedicated to delivering impactful technology solutions. Our mission is to drive your success through strategic application of the latest advancements.',
      missionTitle: 'Our Mission',
      missionText: 'To empower businesses with transformative technology that fuels growth and innovation.',
      visionTitle: 'Our Vision',
      visionText: 'To be the leading partner for businesses seeking to navigate the complexities of the digital age.',
      valuesTitle: 'Our Values',
      valuesText: 'Innovation, Integrity, Collaboration, and Customer Centricity guide everything we do.',
      expertiseTitle: 'Our Expertise',
      customSoftware: 'Custom Software Development',
      cloudSolutions: 'Cloud Solutions',
      aiMl: 'AI & Machine Learning',
      dataAnalytics: 'Data Analytics',
      cybersecurity: 'Cybersecurity',
      itConsulting: 'IT Consulting',
      learnMore: 'Learn More',
      ctaTitle: 'Ready to Elevate Your Business?',
      ctaSubtitle: 'Let\'s discuss how TechFront can tailor solutions to meet your unique challenges and goals.',
      getInTouch: 'Get In Touch',
    },
    es: {
      heroTitle: 'Innovar. Transformar. Tener éxito.',
      heroSubtitle: 'TechFront impulsa su negocio con soluciones tecnológicas de vanguardia diseñadas para el crecimiento y la eficiencia.',
      discoverButton: 'Descubra nuestras soluciones',
      requestDemoButton: 'Solicite una demostración',
      aboutTitle: 'Sobre TechFront',
      aboutSubtitle: 'Somos un equipo apasionado de innovadores y solucionadores de problemas dedicados a ofrecer soluciones tecnológicas impactantes. Nuestra misión es impulsar su éxito a través de la aplicación estratégica de los últimos avances.',
      missionTitle: 'Nuestra misión',
      missionText: 'Empoderar a las empresas con tecnología transformadora que impulse el crecimiento y la innovación.',
      visionTitle: 'Nuestra visión',
      visionText: 'Ser el socio líder para las empresas que buscan navegar por las complejidades de la era digital.',
      valuesTitle: 'Nuestros valores',
      valuesText: 'La innovación, la integridad, la colaboración y la centralidad en el cliente guían todo lo que hacemos.',
      expertiseTitle: 'Nuestra experiencia',
      customSoftware: 'Desarrollo de software a medida',
      cloudSolutions: 'Soluciones en la nube',
      aiMl: 'IA y aprendizaje automático',
      dataAnalytics: 'Análisis de datos',
      cybersecurity: 'Ciberseguridad',
      itConsulting: 'Consultoría de TI',
      learnMore: 'Más información',
      ctaTitle: '¿Listo para elevar su negocio?',
      ctaSubtitle: 'Hablemos de cómo TechFront puede adaptar soluciones para satisfacer sus desafíos y objetivos únicos.',
      getInTouch: 'Póngase en contacto',
    }
  };

  const t = translations[language as keyof typeof translations];

  return (
    <div className="flex flex-col items-center space-y-16 md:space-y-24">
       {/* Language Selector */}
       <div className="container mx-auto px-4 text-right pt-4">
        <Select onValueChange={setLanguage} defaultValue={language}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Language" />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* Hero Section */}
      <section className="w-full text-center py-16 md:py-24 rounded-xl shadow-lg bg-gradient-to-br from-primary via-primary/90 to-accent/30 text-primary-foreground">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {t.heroTitle}
          </h1>
          <p className="text-lg md:text-2xl mb-10 max-w-3xl mx-auto">
            {t.heroSubtitle}
          </p>
          <div className="space-x-4">
            <Button size="lg" asChild className="bg-accent text-accent-foreground hover:bg-accent/90 transition-all duration-300 transform hover:scale-105 shadow-md">
              <Link href="/solutions">{t.discoverButton} <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary transition-all duration-300 transform hover:scale-105 shadow-md">
              <Link href="/contact">{t.requestDemoButton}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="w-full py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-foreground">About TechFront</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            {t.aboutSubtitle}
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle>{t.missionTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t.missionText}</p>
              </CardContent>
            </Card>
            <Card className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle>{t.visionTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t.visionText}</p>
              </CardContent>
            </Card>
            <Card className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle>{t.valuesTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t.valuesText}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Solutions/Services Section */}
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
                  <Button variant="link" asChild className="text-accent-foreground hover:text-primary" disabled>
                    <Link href={`/solutions/${service.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')}`}>{t.learnMore} <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>  {/* Added closing tag for services section */}
      
      {/* Call to Action / Contact Section Preview */}
      <section id="contact-preview" className="w-full py-12 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <Card className="max-w-2xl mx-auto p-6 md:p-10 shadow-xl bg-gradient-to-r from-accent/80 to-primary/80 text-primary-foreground">
            <h2 className="text-3xl md:text-4xl font-semibold mb-6">Ready to Elevate Your Business?</h2>
            <p className="text-lg mb-8">
              Let's discuss how TechFront can tailor solutions to meet your unique challenges and goals.
            </p>
            <Button size="lg" variant="secondary" asChild className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 transition-all duration-300 transform hover:scale-105 shadow-md">
              <Link href="/contact">{t.getInTouch} <MessageSquare className="ml-2 h-5 w-5" /></Link>
            </Button>
          </Card>
        </div>
      </section>
    </div>
  );
}
