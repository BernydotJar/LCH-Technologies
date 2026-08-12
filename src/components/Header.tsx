import React from 'react';
import { Menu, X } from 'lucide-react';

export const Header = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const navLinks = [
    { name: 'Inicio', href: '#inicio' },
    { name: 'Soluciones', href: '#soluciones' },
    { name: 'Productos', href: '#productos' },
    { name: 'Nosotros', href: '#nosotros' },
  ];

  return (
    <header className="bg-primary text-white sticky top-0 z-50 w-full shadow-md">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <a
          href="#inicio"
          aria-label="LCH Technologies — Inicio"
          className="inline-flex items-center rounded-md bg-white px-2 py-1.5"
        >
          <img
            src={`${import.meta.env.BASE_URL}assets/brand/lch-technologies-logo.svg`}
            alt="LCH Technologies"
            className="h-10 w-auto sm:h-11"
          />
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-medium hover:text-accent transition-colors duration-200"
            >
              {link.name}
            </a>
          ))}
          <a
            href="#contacto"
            className="bg-accent text-white px-6 py-2.5 rounded hover:bg-opacity-90 transition-opacity font-semibold text-sm"
          >
            Agenda una demostración
          </a>
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 text-white bg-white/5 border border-white/15 rounded hover:bg-white/10 transition-colors flex items-center justify-center"
          onClick={toggleMenu}
          aria-label="Toggle Menu"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden bg-primary px-4 pt-2 pb-6 space-y-4 border-t border-white/10 shadow-lg">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="block text-base font-medium hover:text-accent transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </a>
          ))}
          <a
            href="#contacto"
            className="block w-full text-center bg-accent text-white px-6 py-3 rounded font-semibold mt-4"
            onClick={() => setIsOpen(false)}
          >
            Agenda una demostración
          </a>
        </div>
      )}
    </header>
  );
};
