import React, { useState, useEffect } from 'react';
import { Search, ShieldCheck, Layers, FileText, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const EvidenceAI = () => {
  const [step, setStep] = useState(0);

  // Auto-advance the demonstration steps when in view
  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev < 3 ? prev + 1 : 0));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="productos" className="bg-primary text-white py-32 overflow-hidden border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-center">

          <div className="lg:col-span-5">
            <span className="text-accent font-semibold tracking-widest uppercase text-xs mb-6 block">
              Producto Destacado
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 tracking-tight">
              LCH Evidence AI
            </h2>
            <h3 className="text-2xl font-medium text-neutral-300 mb-8 leading-tight">
              Encuentra respuestas confiables. <br /> No solo información.
            </h3>
            <p className="text-lg text-neutral-400 leading-relaxed mb-10 max-w-lg">
              Las organizaciones generan miles de documentos, políticas y procedimientos. El verdadero reto es extraer la información correcta cuando se necesita, con total certeza de su origen. LCH Evidence AI permite consultar el conocimiento corporativo respaldado por evidencia y trazabilidad.
            </p>

            <ul className="space-y-4 mb-10">
              {['Evidencia verificable', 'IA empresarial', 'Trazabilidad total'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-neutral-300">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                  {item}
                </li>
              ))}
            </ul>

            <a
              href="#contacto"
              className="inline-flex items-center gap-2 text-white hover:text-accent font-medium tracking-wide transition-colors duration-300 group"
            >
              <span className="border-b border-white/30 group-hover:border-accent transition-colors pb-1">Implementar Evidence AI</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          <div className="lg:col-span-6 lg:col-start-7 relative">
            {/* Architectural Background */}
            <div className="absolute inset-0 border border-white/10 rounded-sm transform translate-x-4 translate-y-4"></div>

            <div className="bg-[#11103A] p-6 sm:p-10 rounded-sm border border-white/10 shadow-2xl relative z-10 overflow-hidden min-h-[450px] flex flex-col">

              <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-4">
                <Search size={16} className="text-accent" />
                <span className="text-xs text-neutral-400 font-mono tracking-widest uppercase">evidence-ai-query-engine</span>
              </div>

              <div className="flex-1 flex flex-col gap-6 relative">

                {/* Step 1: Question */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: step >= 0 ? 1 : 0, y: step >= 0 ? 0 : 10 }}
                  className="flex gap-4"
                >
                  <div className="w-8 h-8 rounded-sm bg-white/5 flex-shrink-0 flex items-center justify-center text-xs text-neutral-400 border border-white/10">U</div>
                  <div className="bg-white/5 border border-white/10 p-4 rounded-sm text-sm text-neutral-200">
                    ¿Cuál es el protocolo de seguridad para acceso a servidores de producción?
                  </div>
                </motion.div>

                {/* Step 2: Processing (Nodes) */}
                <AnimatePresence>
                  {step === 1 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex gap-2 pl-12 py-2"
                    >
                      <div className="w-2 h-2 bg-accent/40 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-accent/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Step 3: Answer & Evidence */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: step >= 2 ? 1 : 0, y: step >= 2 ? 0 : 10 }}
                  className="flex gap-4"
                >
                  <div className="w-8 h-8 rounded-sm bg-white flex-shrink-0 flex items-center justify-center shadow-lg overflow-hidden" aria-hidden="true">
                    <img src="/assets/brand/lch-isotipo.svg" alt="" className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="bg-accent/10 border border-accent/20 p-4 rounded-sm text-sm text-white leading-relaxed">
                      El protocolo estipula autenticación MFA obligatoria y conexión exclusiva mediante VPN corporativa. Las bitácoras de acceso deben retenerse por un mínimo de 90 días.
                    </div>

                    {/* Step 4: Traceability */}
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: step >= 3 ? 1 : 0, height: step >= 3 ? 'auto' : 0 }}
                      className="bg-black/40 p-3 rounded-sm text-xs text-neutral-400 flex items-start gap-3 border border-white/5"
                    >
                      <FileText size={14} className="text-accent mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-mono text-neutral-300 mb-1">Fuente Verificada</div>
                        <div>Politica_Seguridad_Infra_2026.pdf (Pág. 14, Sec. 4.2)</div>
                        <div className="flex items-center gap-1 mt-2 text-success/80">
                          <ShieldCheck size={12} /> Nivel de Confianza: 98%
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
