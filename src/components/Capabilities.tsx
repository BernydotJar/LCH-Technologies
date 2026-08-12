import React from 'react';
import { motion } from 'motion/react';
import { BrainCircuit, Settings, Code2, Cloud } from 'lucide-react';

const capabilities = [
  {
    id: '01',
    title: 'Inteligencia Artificial',
    description: 'Aplicamos IA sobre conocimiento, documentos, datos y procesos reales de la organización. Implementamos modelos estructurados que garantizan trazabilidad y evidencia en cada respuesta, eliminando la opacidad.',
    icon: <BrainCircuit size={48} strokeWidth={1} />,
    color: 'bg-primary text-white',
    accent: 'text-accent'
  },
  {
    id: '02',
    title: 'Automatización',
    description: 'Diseñamos automatizaciones y agentes operativos para reducir trabajo manual, conectar sistemas y aumentar consistencia. Operaciones continuas con supervisión humana estructurada.',
    icon: <Settings size={48} strokeWidth={1} />,
    color: 'bg-neutral-100 text-primary',
    accent: 'text-primary'
  },
  {
    id: '03',
    title: 'Software Empresarial',
    description: 'Construimos plataformas y aplicaciones alineadas con procesos críticos, integraciones y necesidades específicas del negocio. Arquitectura robusta, escalable y mantenible.',
    icon: <Code2 size={48} strokeWidth={1} />,
    color: 'bg-white text-primary',
    accent: 'text-accent'
  },
  {
    id: '04',
    title: 'Cloud Solutions',
    description: 'Diseñamos arquitecturas cloud escalables, seguras y observables para modernizar aplicaciones y operaciones. Infraestructura preparada para el futuro.',
    icon: <Cloud size={48} strokeWidth={1} />,
    color: 'bg-secondary text-white',
    accent: 'text-neutral-300'
  }
];

export const Capabilities = () => {
  return (
    <section id="soluciones" className="bg-white">
      {/* Editorial Introduction */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="max-w-3xl">
          <h2 className="text-accent font-semibold tracking-widest uppercase text-xs sm:text-sm mb-6">Nuestras Capacidades</h2>
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary leading-tight mb-8">
            Construimos tecnología orientada a resultados operacionales.
          </h3>
          <p className="text-lg md:text-xl text-secondary leading-relaxed">
            Integramos sistemas complejos para crear ventajas competitivas medibles, pasando de la experimentación tecnológica a la implementación gobernada.
          </p>
        </div>
      </div>

      {/* Editorial Chapters */}
      <div className="border-t border-neutral-200">
        {capabilities.map((cap, index) => (
          <div key={cap.id} className={`${cap.color} border-b border-neutral-200/20`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
                {/* ID & Icon */}
                <div className="lg:col-span-3 flex flex-col gap-6">
                  <span className={`text-sm font-mono tracking-widest ${cap.accent}`}>{cap.id} / 04</span>
                  <div className={cap.accent}>{cap.icon}</div>
                </div>

                {/* Content */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="lg:col-span-8 lg:col-start-5"
                >
                  <h4 className="text-4xl sm:text-5xl font-bold mb-8 tracking-tight">{cap.title}</h4>
                  <p className="text-xl leading-relaxed max-w-2xl opacity-90">{cap.description}</p>
                </motion.div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
