/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { DonnaChat, type DonnaHandoff } from './components/DonnaChat';
import type { ContactDraft } from './contact/semanticContract';
import type { InterestArea } from './integrations/leadContract';
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
  const [openDonnaForExploration, setOpenDonnaForExploration] = useState(0);
  // The typed draft bridge lives in React memory, not the API or browser DOM.
  const handleDonnaDraft = (draft: ContactDraft) => {
    setPreparedDraft((previous) => ({ draft, nonce: (previous?.nonce ?? 0) + 1 }));
  };
  const handleStartDonna = (draft: ContactDraft) => {
    setOpenDonnaForContact((previous) => ({ draft, nonce: (previous?.nonce ?? 0) + 1 }));
  };
  const handleOpportunityContact = (interest: InterestArea) => {
    // Only a validated public interest is prepared; no message, PII or consent is invented.
    handleDonnaDraft({ interes: interest });
    window.location.hash = 'contacto';
    window.requestAnimationFrame(() => document.getElementById('contacto')?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    }));
  };
  const handleDonnaHandoff = (data: DonnaHandoff) => {
    setHandoff((previous) => ({ ...data, nonce: (previous?.nonce ?? 0) + 1 }));
    window.location.hash = 'contacto';
    window.requestAnimationFrame(() => document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' }));
  };

  return (
    <div className="app-shell min-h-screen bg-white">
      <Header />
      <main>
        <Hero onContact={handleOpportunityContact} onOpenDonna={() => setOpenDonnaForExploration((nonce) => nonce + 1)} />
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
      <DonnaChat onHandoff={handleDonnaHandoff} onDraft={handleDonnaDraft} startContactRequest={openDonnaForContact} openExplorationRequest={openDonnaForExploration} />
    </div>
  );
}
