/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { DonnaChat, type DonnaHandoff } from './components/DonnaChat';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Capabilities } from './components/Capabilities';
import { EvidenceAI } from './components/EvidenceAI';
import { ProductReferences } from './components/ProductReferences';
import { CaseStudies } from './components/CaseStudies';
import { Governance } from './components/Governance';
import { Process } from './components/Process';
import { WhyLCH } from './components/WhyLCH';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';

export type ContactHandoff = DonnaHandoff & { nonce: number };

export default function App() {
  const [handoff, setHandoff] = useState<ContactHandoff | null>(null);
  const handleDonnaHandoff = ({ interest, message }: DonnaHandoff) => {
    setHandoff((previous) => ({ interest, message, nonce: (previous?.nonce ?? 0) + 1 }));
    window.location.hash = 'contacto';
    window.requestAnimationFrame(() => document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' }));
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Hero />
        <Capabilities />
        <EvidenceAI />
        <ProductReferences />
        <CaseStudies />
        <Governance />
        <Process />
        <WhyLCH />
        <Contact handoff={handoff} />
      </main>
      <Footer />
      <DonnaChat onHandoff={handleDonnaHandoff} />
    </div>
  );
}
