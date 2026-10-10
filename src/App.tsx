/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { DonnaChat, type DonnaHandoff } from './components/DonnaChat';
import type { ContactDraft } from './contact/semanticContract';
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
export type DonnaPreparedDraft = { draft: ContactDraft; nonce: number };

export default function App() {
  const [handoff, setHandoff] = useState<ContactHandoff | null>(null);
  const [preparedDraft, setPreparedDraft] = useState<DonnaPreparedDraft | null>(null);
  const [openDonnaForContact, setOpenDonnaForContact] = useState<DonnaPreparedDraft | null>(null);
  // The typed draft bridge lives in React memory, not the API or browser DOM.
  const handleDonnaDraft = (draft: ContactDraft) => {
    setPreparedDraft((previous) => ({ draft, nonce: (previous?.nonce ?? 0) + 1 }));
  };
  const handleStartDonna = (draft: ContactDraft) => {
    setOpenDonnaForContact((previous) => ({ draft, nonce: (previous?.nonce ?? 0) + 1 }));
  };
  const handleDonnaHandoff = (data: DonnaHandoff) => {
    setHandoff((previous) => ({ ...data, nonce: (previous?.nonce ?? 0) + 1 }));
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
        <Contact handoff={handoff} preparedDraft={preparedDraft} onStartDonna={handleStartDonna} />
      </main>
      <Footer />
      <DonnaChat onHandoff={handleDonnaHandoff} onDraft={handleDonnaDraft} startContactRequest={openDonnaForContact} />
    </div>
  );
}
