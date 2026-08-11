import React, { useState, useEffect } from 'react';
import { ArrowRight, Play, Pause, ChevronDown, CheckCircle2, Zap } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { HeroSystemAnimation } from './HeroSystemAnimation';

export const Hero = () => {
  const prefersReducedMotion = useReducedMotion();
  const [isPlaying, setIsPlaying] = useState(!prefersReducedMotion);

  // Allow users to pause/play background motion for accessibility
  const togglePlay = () => setIsPlaying(!isPlaying);

  // Sync state if user changes OS preferences
  useEffect(() => {
    setIsPlaying(!prefersReducedMotion);
  }, [prefersReducedMotion]);

  return (
    <section id="inicio" className="relative w-full min-h-[85svh] sm:min-h-[90svh] lg:min-h-[94vh] flex flex-col justify-between bg-primary overflow-hidden selection:bg-accent selection:text-white">
      {/* Environmental Tonal Texture (Architectural Grid & Depth) */}
      <div className="absolute inset-0 z-0 bg-primary pointer-events-none">
        <div
          className={`absolute inset-0 opacity-15 transition-transform duration-[20000ms] ${isPlaying ? 'scale-105' : 'scale-100'}`}
          style={{
            backgroundImage: 'linear-gradient(60deg, #155E75 1px, transparent 1px), linear-gradient(120deg, #155E75 1px, transparent 1px)',
            backgroundSize: '100px 173.2px',
            backgroundPosition: 'center center'
          }}
        ></div>
        {/* Soft Depth Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/75 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/50 to-transparent"></div>
      </div>

      {/* Main Asymmetric Hero Content Container */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10 sm:pt-14 sm:pb-16 lg:py-16 flex-1 flex flex-col justify-center">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">

          {/* LEFT COLUMN: Dominant Typography & Concrete Value Proposition */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="lg:col-span-7 xl:col-span-6 flex flex-col items-start"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-accent/20 border border-accent/40 text-sky-200 text-xs font-mono font-semibold tracking-wider uppercase mb-5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Aceleradores de Transformación Operacional
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[64px] font-extrabold text-white leading-[1.08] tracking-tight mb-6">
              Convertimos operaciones manuales y fragmentadas en{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-200 via-teal-200 to-emerald-300">
                sistemas automatizados y trazables.
              </span>
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-neutral-200 max-w-xl leading-relaxed mb-8">
              Diseñamos software, automatizaciones e IA para procesos empresariales que hoy dependen de emails, hojas de cálculo, documentos y seguimiento manual.
            </p>

            {/* REAL PROOF ANCHOR / BEFORE-AFTER CALLOUT */}
            <div className="w-full max-w-xl p-3.5 sm:p-4 rounded-sm bg-[#080730]/90 border border-teal-500/30 mb-8 flex items-start gap-3 text-xs sm:text-sm text-neutral-200">
              <Zap size={18} className="text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white">Impacto medible típico:</span>{' '}
                Un flujo de aprobación documental de 5 días convertido en un proceso automatizado de 20 minutos con auditoría completa.
              </div>
            </div>

            {/* CTA BUTTONS */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
              <a
                href="#contacto"
                className="group inline-flex items-center justify-center gap-3 bg-accent text-white px-7 py-3.5 font-bold text-sm tracking-wide rounded-sm hover:bg-white hover:text-primary transition-all duration-300 shadow-[0_4px_20px_rgba(21,94,117,0.4)]"
              >
                Agenda una demostración
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </a>

              <a
                href="#soluciones"
                className="inline-flex items-center justify-center gap-2 text-neutral-200 hover:text-white font-semibold text-sm tracking-wide transition-colors duration-200 py-2 sm:py-0"
              >
                <span className="border-b border-white/40 hover:border-white transition-colors pb-1 flex items-center gap-1.5">
                  Descubre cómo funciona <ChevronDown size={14} className="mt-0.5" />
                </span>
              </a>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: Custom Interactive Operational System SVG */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="lg:col-span-5 xl:col-span-6 w-full flex items-center justify-center lg:justify-end"
          >
            <HeroSystemAnimation isPlaying={isPlaying} />
          </motion.div>

        </div>
      </div>

      {/* BOTTOM ANCHOR BAR: Brand Capability Badges & Motion Controls */}
      <div className="relative z-10 w-full border-t border-white/15 bg-[#0A093D]/95 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-neutral-200">

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-5 gap-y-2 uppercase tracking-widest text-[11px] sm:text-xs font-semibold">
            <span className="text-teal-300">IA EMPRESARIAL</span>
            <span className="text-white/30">•</span>
            <span className="text-white">AUTOMATIZACIÓN</span>
            <span className="text-white/30">•</span>
            <span className="text-white">SOFTWARE</span>
            <span className="text-white/30">•</span>
            <span className="text-white">CLOUD</span>
          </div>

          <div className="flex items-center gap-5">
            <a href="#soluciones" className="hidden md:inline-flex items-center gap-1.5 text-neutral-200 hover:text-white transition-colors text-[11px] uppercase tracking-wider font-semibold">
              <span>Explorar soluciones</span>
              <ChevronDown size={12} />
            </a>

            {/* Accessibility Motion Toggle */}
            <button
              onClick={togglePlay}
              className="text-neutral-200 hover:text-white transition-colors flex items-center gap-2 text-[11px] uppercase tracking-widest px-2.5 py-1 border border-white/20 rounded hover:bg-white/10 font-semibold"
              aria-label={isPlaying ? "Pausar animación del hero" : "Reproducir animación del hero"}
            >
              {isPlaying ? (
                <>
                  <Pause size={12} className="text-emerald-400" /> Animación: Activa
                </>
              ) : (
                <>
                  <Play size={12} className="text-neutral-400" /> Animación: Pausada
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};
