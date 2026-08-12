import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';

export const Contact = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    empresa: '',
    cargo: '',
    interes: '',
    mensaje: '',
    consentimiento: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const { submitDemoRequest } = await import('../integrations/demoRequests');
      await submitDemoRequest(formData);
      setStatus('success');
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        empresa: '',
        cargo: '',
        interes: '',
        mensaje: '',
        consentimiento: false
      });
    } catch (error) {
      console.error("Error submitting form", error);
      setStatus('error');
    }
  };

  return (
    <section id="contacto" className="bg-primary border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row min-h-[80vh]">

        {/* Emotional CTA & Brand Moment */}
        <div className="lg:w-1/2 py-24 lg:py-32 lg:pr-16 flex flex-col justify-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-8 tracking-tight leading-[1.1]">
            Transformemos <br /> cómo opera tu <br className="hidden lg:block"/> organización.
          </h2>
          <p className="text-xl text-neutral-300 leading-relaxed max-w-lg mb-12">
            Conversemos sobre el proceso, sistema o desafío que quieres transformar. Descubre cómo la ingeniería estructurada puede resolver complejidad operacional.
          </p>

          <div className="space-y-6 text-neutral-400">
            <div className="flex items-start gap-4">
              <div className="mt-1 bg-white/5 p-1 rounded-sm text-white border border-white/10">
                <Check size={16} />
              </div>
              <span>Evaluación técnica de factibilidad.</span>
            </div>
            <div className="flex items-start gap-4">
              <div className="mt-1 bg-white/5 p-1 rounded-sm text-white border border-white/10">
                <Check size={16} />
              </div>
              <span>Demostración de capacidades reales.</span>
            </div>
            <div className="flex items-start gap-4">
              <div className="mt-1 bg-white/5 p-1 rounded-sm text-white border border-white/10">
                <Check size={16} />
              </div>
              <span>Diseño de arquitectura conceptual.</span>
            </div>
          </div>
        </div>

        {/* Form Complexity Separated */}
        <div className="lg:w-1/2 bg-white flex flex-col justify-center p-8 sm:p-12 lg:p-16 border-l border-neutral-200">

          {status === 'success' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-6 border border-success/20">
                <Check size={32} />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-3">Solicitud recibida</h3>
              <p className="text-secondary mb-8">Gracias por su interés. Nuestro equipo analizará su solicitud y se pondrá en contacto a la brevedad.</p>
              <button
                onClick={() => setStatus('idle')}
                className="text-accent font-semibold hover:text-primary transition-colors text-sm uppercase tracking-wider"
              >
                Enviar nueva solicitud
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 max-w-lg mx-auto w-full">
              <h3 className="text-2xl font-bold text-primary mb-6">Agenda una demostración</h3>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label htmlFor="nombre" className="sr-only">Nombre</label>
                  <input required type="text" id="nombre" name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleChange} className="w-full px-4 py-3 bg-neutral-100/50 border border-neutral-200 text-primary placeholder-neutral-400 focus:bg-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all rounded-sm text-sm" />
                </div>
                <div>
                  <label htmlFor="apellido" className="sr-only">Apellido</label>
                  <input required type="text" id="apellido" name="apellido" placeholder="Apellido" value={formData.apellido} onChange={handleChange} className="w-full px-4 py-3 bg-neutral-100/50 border border-neutral-200 text-primary placeholder-neutral-400 focus:bg-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all rounded-sm text-sm" />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="sr-only">Correo corporativo</label>
                <input required type="email" id="email" name="email" placeholder="Correo corporativo" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 bg-neutral-100/50 border border-neutral-200 text-primary placeholder-neutral-400 focus:bg-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all rounded-sm text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label htmlFor="empresa" className="sr-only">Empresa</label>
                  <input required type="text" id="empresa" name="empresa" placeholder="Empresa" value={formData.empresa} onChange={handleChange} className="w-full px-4 py-3 bg-neutral-100/50 border border-neutral-200 text-primary placeholder-neutral-400 focus:bg-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all rounded-sm text-sm" />
                </div>
                <div>
                  <label htmlFor="cargo" className="sr-only">Cargo</label>
                  <input required type="text" id="cargo" name="cargo" placeholder="Cargo" value={formData.cargo} onChange={handleChange} className="w-full px-4 py-3 bg-neutral-100/50 border border-neutral-200 text-primary placeholder-neutral-400 focus:bg-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all rounded-sm text-sm" />
                </div>
              </div>

              <div>
                <label htmlFor="interes" className="sr-only">Área de interés</label>
                <select required id="interes" name="interes" value={formData.interes} onChange={handleChange} className={`w-full px-4 py-3 bg-neutral-100/50 border border-neutral-200 focus:bg-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all rounded-sm text-sm appearance-none ${formData.interes === '' ? 'text-neutral-400' : 'text-primary'}`}>
                  <option value="" disabled>Área de interés principal</option>
                  <option value="Inteligencia Artificial" className="text-primary">Inteligencia Artificial</option>
                  <option value="Automatización" className="text-primary">Automatización</option>
                  <option value="Software Empresarial" className="text-primary">Software Empresarial</option>
                  <option value="Cloud" className="text-primary">Cloud</option>
                  <option value="LCH Evidence AI" className="text-primary">LCH Evidence AI</option>
                  <option value="Otro" className="text-primary">Otro</option>
                </select>
              </div>

              <div>
                <label htmlFor="mensaje" className="sr-only">Mensaje (opcional)</label>
                <textarea id="mensaje" name="mensaje" rows={3} placeholder="Describa brevemente su desafío operativo (opcional)" value={formData.mensaje} onChange={handleChange} className="w-full px-4 py-3 bg-neutral-100/50 border border-neutral-200 text-primary placeholder-neutral-400 focus:bg-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all rounded-sm text-sm resize-none"></textarea>
              </div>

              <div className="flex items-start pt-2">
                <input required type="checkbox" id="consentimiento" name="consentimiento" checked={formData.consentimiento} onChange={handleChange} className="mt-1 h-4 w-4 text-accent border-neutral-300 rounded-sm focus:ring-accent cursor-pointer" />
                <label htmlFor="consentimiento" className="ml-3 block text-xs text-secondary leading-relaxed cursor-pointer">
                  Comprendo y acepto que LCH Technologies procese mis datos para dar respuesta a esta solicitud de acuerdo con los protocolos de privacidad.
                </label>
              </div>

              {status === 'error' && (
                <div className="p-3 bg-error/10 border border-error/20 text-error rounded-sm text-sm font-medium">
                  Error de conexión. Por favor, verifique su red e intente nuevamente.
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-primary text-white px-8 py-4 rounded-sm font-semibold hover:bg-accent transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-4 text-sm tracking-wide"
              >
                {status === 'loading' ? 'Procesando solicitud...' : 'Solicitar contacto'}
              </button>
            </form>
          )}

        </div>
      </div>
    </section>
  );
};
