import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

const steps = [
  { id: '01', name: 'Entender', desc: 'Análisis profundo de procesos, datos y desafíos operativos actuales.' },
  { id: '02', name: 'Diseñar', desc: 'Arquitectura de solución alineada a objetivos de negocio y seguridad.' },
  { id: '03', name: 'Construir', desc: 'Ingeniería disciplinada orientada a calidad, gobierno y mantenibilidad.' },
  { id: '04', name: 'Integrar', desc: 'Conexión segura con los sistemas core y flujos de trabajo de la empresa.' },
  { id: '05', name: 'Operar', desc: 'Despliegue controlado, capacitación y monitoreo de rendimiento real.' },
  { id: '06', name: 'Mejorar', desc: 'Iteración continua basada en datos operativos y feedback de usuarios.' }
];

export const Process = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  return (
    <section id="nosotros" className="bg-white py-32" ref={containerRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="max-w-3xl mb-24">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6 tracking-tight">Metodología de Ingeniería</h2>
          <p className="text-lg text-secondary leading-relaxed">
            Un marco de trabajo diseñado para asegurar que cada línea de código y cada modelo de IA respondan a una necesidad empresarial real, controlada y medible.
          </p>
        </div>

        <div className="relative">
          {/* Progress Line */}
          <div className="absolute left-[27px] top-0 bottom-0 w-px bg-neutral-200 md:left-1/2 md:-ml-px"></div>

          <motion.div
            className="absolute left-[27px] top-0 bottom-0 w-px bg-accent md:left-1/2 md:-ml-px origin-top"
            style={{ scaleY: scrollYProgress }}
          ></motion.div>

          <div className="space-y-16 md:space-y-24">
            {steps.map((step, index) => {
              const isEven = index % 2 === 0;
              return (
                <div key={index} className="relative flex items-center md:justify-center">

                  {/* Timeline Node */}
                  <div className="absolute left-0 md:left-1/2 w-14 h-14 bg-white border border-neutral-200 rounded-sm flex items-center justify-center transform md:-translate-x-1/2 z-10 shadow-sm rotate-45">
                    <span className="font-mono text-sm font-bold text-primary transform -rotate-45">{step.id}</span>
                  </div>

                  {/* Content */}
                  <motion.div
                    initial={{ opacity: 0, x: isEven ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className={`w-full pl-24 md:w-1/2 md:px-16 ${isEven ? 'md:pr-16 md:pl-0 md:text-right md:ml-0 md:mr-auto' : 'md:pl-16 md:pr-0 md:ml-auto md:mr-0'}`}
                  >
                    <h3 className="text-2xl font-bold text-primary mb-3">{step.name}</h3>
                    <p className="text-secondary leading-relaxed">{step.desc}</p>
                  </motion.div>

                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
