
'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Lightbulb, Briefcase, MessageSquare, BarChart3 } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import * as React from "react";

export default function Home() {
  const { language } = useLanguage();
  const autoplayPlugin = React.useRef(
    Autoplay({ delay: 7000, stopOnInteraction: true }) // Longer delay for readability
  );

  const translations = {
    en: {
      heroTitle: 'Innovate. Transform. Succeed.',
      heroSubtitles: [
        "At LCH, we partner with you to build your foundational intelligent automations.",
        "We help you train and mentor your developers into skilled automation leaders and scale your intelligent automations.",
        "Empowering you to independently drive future innovation.",
        "We're more than consultants; we're your dedicated mentors for lasting technological self-sufficiency.",
        "Our focused enablement model accelerates your journey to in-house automation mastery and tangible results."
      ],
      discoverButton: 'Discover Our Solutions',
      requestDemoButton: 'Request a Demo',
      aboutTitle: 'About LCH',
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
      ctaSubtitle: 'Let\'s discuss how LCH can tailor solutions to meet your unique challenges and goals.',
      getInTouch: 'Get In Touch',
    },
    es: {
      heroTitle: 'Innovar. Transformar. Tener éxito.',
      heroSubtitles: [
        "En LCH, nos asociamos contigo para construir tus automatizaciones inteligentes fundamentales.",
        "Te ayudamos a capacitar y guiar a tus desarrolladores para convertirlos en líderes de automatización cualificados y escalar tus automatizaciones inteligentes.",
        "Empoderándote para impulsar la innovación futura de forma independiente.",
        "Somos más que consultores; somos tus mentores dedicados para una autosuficiencia tecnológica duradera.",
        "Nuestro modelo de habilitación enfocado acelera tu viaje hacia el dominio interno de la automatización y resultados tangibles."
      ],
      discoverButton: 'Descubra nuestras soluciones',
      requestDemoButton: 'Solicite una demostración',
      aboutTitle: 'Sobre LCH',
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
      ctaSubtitle: 'Hablemos de cómo LCH puede adaptar soluciones para satisfacer sus desafíos y objetivos únicos.',
      getInTouch: 'Póngase en contacto',
    },
    it: {
      heroTitle: 'Innovare. Trasformare. Riuscire.',
      heroSubtitles: [
        "In LCH, collaboriamo con te per costruire le tue automazioni intelligenti fondamentali.",
        "Ti aiutiamo a formare e fare da mentore ai tuoi sviluppatori per trasformarli in leader esperti dell'automazione e scalare le tue automazioni intelligenti.",
        "Consentendoti di guidare autonomamente l'innovazione futura.",
        "Siamo più che consulenti; siamo i tuoi mentori dedicati per un'autosufficienza tecnologica duratura.",
        "Il nostro modello di abilitazione mirato accelera il tuo percorso verso la padronanza interna dell'automazione e risultati tangibili."
      ],
      discoverButton: 'Scopri le Nostre Soluzioni',
      requestDemoButton: 'Richiedi una Demo',
      aboutTitle: 'Informazioni su LCH',
      aboutSubtitle: "Siamo un team appassionato di innovatori e risolutori di problemi dedicati a fornire solutions tecnologiche d'impatto. La nostra missione è guidare il tuo successo attraverso l'applicazione strategica degli ultimi progressi.",
      missionTitle: 'La Nostra Missione',
      missionText: "Potenziare le aziende con tecnologia trasformativa che alimenta crescita e innovazione.",
      visionTitle: 'La Nostra Visione',
      visionText: "Essere il partner leader per le aziende che cercano di navigare le complessità dell'era digitale.",
      valuesTitle: 'I Nostri Valori',
      valuesText: "Innovazione, Integrità, Collaborazione e Centralità del Cliente guidano tutto ciò che facciamo.",
      expertiseTitle: 'La Nostra Competenza',
      customSoftware: 'Sviluppo Software Personalizzato',
      cloudSolutions: 'Soluzioni Cloud',
      aiMl: 'IA & Machine Learning',
      dataAnalytics: 'Analisi dei Dati',
      cybersecurity: 'Sicurezza Informatica',
      itConsulting: 'Consulenza IT',
      learnMore: 'Saperne di Più',
      ctaTitle: 'Pronto ad Elevare la Tua Attività?',
      ctaSubtitle: "Discutiamo di come LCH può personalizzare solutions per affrontare le tue sfide e obiettivi unici.",
      getInTouch: 'Mettiti in Contatto',
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  return (
    <div className="flex flex-col items-center space-y-16 md:space-y-24">
      {/* Hero Section */}
      <section className="relative w-full text-center py-16 md:py-24 rounded-xl shadow-lg bg-gradient-to-br from-primary via-primary/90 to-accent/30 text-primary-foreground hero-section-flash overflow-hidden">
        <div className="relative z-10 container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {t.heroTitle}
          </h1>
          <Carousel
            opts={{ loop: true }}
            plugins={[autoplayPlugin.current]}
            className="w-full max-w-3xl mx-auto mb-10 group"
            onMouseEnter={autoplayPlugin.current.stop}
            onMouseLeave={autoplayPlugin.current.reset}
          >
            <CarouselContent>
              {t.heroSubtitles.map((subtitle, index) => (
                <CarouselItem key={index}>
                  <p className="text-lg md:text-2xl text-center py-4 min-h-[120px] md:min-h-[100px] flex items-center justify-center px-6"
                     dangerouslySetInnerHTML={{ __html: subtitle }} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-0 md:left-2 top-1/2 -translate-y-1/2 z-10 bg-background/30 hover:bg-background/60 text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CarouselNext className="absolute right-0 md:right-2 top-1/2 -translate-y-1/2 z-10 bg-background/30 hover:bg-background/60 text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Carousel>
          <div className="space-x-4">
            <Button size="lg" asChild className="bg-accent text-accent-foreground hover:bg-accent/90 transition-all duration-300 transform hover:scale-105 shadow-md">
              <Link href="/solutions">{t.discoverButton} <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              asChild 
              className="bg-[#deb952] text-foreground border-[#deb952] hover:bg-[#c4962f] hover:text-foreground transition-all duration-300 transform hover:scale-105 shadow-md"
            >
              <Link href="/contact">{t.requestDemoButton}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="w-full py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-foreground">{t.aboutTitle}</h2>
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
          <h2 className="text-3xl md:text-4xl font-semibold mb-10 text-foreground">{t.expertiseTitle}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[t.customSoftware, t.cloudSolutions, t.aiMl, t.dataAnalytics, t.cybersecurity, t.itConsulting].map((service) => (
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
      </section>
      
      {/* Call to Action / Contact Section Preview */}
      <section id="contact-preview" className="w-full py-12 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <Card className="max-w-2xl mx-auto p-6 md:p-10 shadow-xl bg-gradient-to-r from-accent/80 to-primary/80 text-primary-foreground">
            <h2 className="text-3xl md:text-4xl font-semibold mb-6">{t.ctaTitle}</h2>
            <p className="text-lg mb-8">
              {t.ctaSubtitle}
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

