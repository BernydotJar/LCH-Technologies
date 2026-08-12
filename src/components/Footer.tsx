import React from 'react';

export const Footer = () => {
  return (
    <footer className="bg-primary text-white border-t border-white/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-1">
            <a
              href="#inicio"
              aria-label="LCH Technologies — Inicio"
              className="mb-6 inline-flex items-center rounded-md bg-white px-2 py-1.5"
            >
              <img
                src={`${import.meta.env.BASE_URL}assets/brand/lch-technologies-logo.svg`}
                alt="LCH Technologies"
                className="h-10 w-auto"
              />
            </a>
            <p className="text-neutral-400 text-sm">
              Operational Transformation Accelerators
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-6">Soluciones</h4>
            <ul className="space-y-4 text-sm text-neutral-400">
              <li><a href="#soluciones" className="hover:text-white transition-colors">Inteligencia Artificial</a></li>
              <li><a href="#soluciones" className="hover:text-white transition-colors">Automatización</a></li>
              <li><a href="#soluciones" className="hover:text-white transition-colors">Software Empresarial</a></li>
              <li><a href="#soluciones" className="hover:text-white transition-colors">Cloud Solutions</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6">Productos</h4>
            <ul className="space-y-4 text-sm text-neutral-400">
              <li><a href="#productos" className="hover:text-white transition-colors">LCH Evidence AI</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6">Compañía</h4>
            <ul className="space-y-4 text-sm text-neutral-400">
              <li><a href="#nosotros" className="hover:text-white transition-colors">Enfoque</a></li>
              <li><a href="#contacto" className="hover:text-white transition-colors">Contacto</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-neutral-500">
          <p>&copy; {new Date().getFullYear()} LCH Technologies. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-neutral-300 transition-colors">[Política de Privacidad]</a>
            <a href="#" className="hover:text-neutral-300 transition-colors">[Términos de Servicio]</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
