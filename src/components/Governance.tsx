import React from 'react';
import { motion } from 'motion/react';
import { Shield, Database, Lock, GitMerge } from 'lucide-react';

export const Governance = () => {
  return (
    <section className="bg-neutral-100 py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center max-w-3xl mx-auto mb-24">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6 tracking-tight">Arquitectura de Confianza</h2>
          <p className="text-lg text-secondary leading-relaxed">
            La transformación digital no consiste únicamente en implementar IA. Consiste en construir sistemas donde la información, los procesos y la automatización operen bajo control estricto y trazabilidad absoluta.
          </p>
        </div>

        {/* Node Architecture Diagram */}
        <div className="relative max-w-4xl mx-auto">

          {/* Abstract Connection Lines */}
          <div className="absolute inset-0 pointer-events-none hidden md:block">
            <svg className="w-full h-full" viewBox="0 0 800 400" preserveAspectRatio="none">
              <path d="M 400 50 L 200 200 L 400 350 L 600 200 Z" fill="none" stroke="#E0E0E0" strokeWidth="1" strokeDasharray="4 4" />
              <path d="M 400 50 L 400 350" fill="none" stroke="#E0E0E0" strokeWidth="1" />
              <path d="M 200 200 L 600 200" fill="none" stroke="#E0E0E0" strokeWidth="1" />
            </svg>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 relative z-10">

            {/* Left Node */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="md:col-start-1 md:row-start-1 md:translate-y-32 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-white border border-neutral-200 rounded-sm shadow-sm flex items-center justify-center mb-4 transform rotate-45">
                <Database size={24} className="text-primary transform -rotate-45" strokeWidth={1.5} />
              </div>
              <h3 className="font-bold text-primary mb-2">Datos Gobernados</h3>
              <p className="text-sm text-secondary px-4">Orígenes verificables y permisos estructurados.</p>
            </motion.div>

            {/* Top Node */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="md:col-start-2 md:row-start-1 flex flex-col items-center text-center relative z-20"
            >
              <div className="w-20 h-20 bg-primary rounded-sm shadow-lg flex items-center justify-center mb-4 transform rotate-45">
                <Shield size={32} className="text-white transform -rotate-45" strokeWidth={1.5} />
              </div>
              <h3 className="font-bold text-primary mb-2">Núcleo de Control</h3>
              <p className="text-sm text-secondary px-4">Supervisión humana, auditoría y políticas de acceso corporativas.</p>
            </motion.div>

            {/* Right Node */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="md:col-start-3 md:row-start-1 md:translate-y-32 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-white border border-neutral-200 rounded-sm shadow-sm flex items-center justify-center mb-4 transform rotate-45">
                <GitMerge size={24} className="text-primary transform -rotate-45" strokeWidth={1.5} />
              </div>
              <h3 className="font-bold text-primary mb-2">Automatización Segura</h3>
              <p className="text-sm text-secondary px-4">Agentes con alcance limitado y trazabilidad operativa.</p>
            </motion.div>

            {/* Bottom Node */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="md:col-start-2 md:row-start-1 md:translate-y-64 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-accent rounded-sm shadow-md flex items-center justify-center mb-4 transform rotate-45">
                <Lock size={24} className="text-white transform -rotate-45" strokeWidth={1.5} />
              </div>
              <h3 className="font-bold text-primary mb-2">Evidencia</h3>
              <p className="text-sm text-secondary px-4">Cada resultado respaldado por fuentes exactas.</p>
            </motion.div>

          </div>

          {/* Spacer for bottom node in desktop */}
          <div className="hidden md:block h-64"></div>
        </div>

      </div>
    </section>
  );
};
