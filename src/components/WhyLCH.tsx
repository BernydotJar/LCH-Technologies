import React from 'react';
import { Check } from 'lucide-react';

const reasons = [
  "Enfoque empresarial.",
  "IA conectada con procesos reales.",
  "Automatización e integración end-to-end.",
  "Gobierno y trazabilidad por diseño.",
  "Ingeniería orientada a operación.",
  "Arquitectura preparada para evolucionar."
];

export const WhyLCH = () => {
  return (
    <section className="py-24 bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Por qué elegir LCH Technologies</h2>
            <p className="text-lg text-neutral-300 mb-8 max-w-xl leading-relaxed">
              No somos simplemente proveedores de software. Somos arquitectos de operaciones tecnológicas enfocados en crear valor sustancial para su organización, minimizando riesgos y asegurando control.
            </p>
          </div>
          <div className="bg-[#11103A] p-8 md:p-12 rounded-sm border border-white/10">
            <ul className="space-y-6">
              {reasons.map((reason, idx) => (
                <li key={idx} className="flex items-start gap-4">
                  <div className="mt-1 bg-accent/20 p-1 rounded-sm text-accent">
                    <Check size={18} />
                  </div>
                  <span className="text-lg font-medium text-neutral-100">{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
