/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Capabilities } from './components/Capabilities';
import { EvidenceAI } from './components/EvidenceAI';
import { Governance } from './components/Governance';
import { Process } from './components/Process';
import { WhyLCH } from './components/WhyLCH';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Hero />
        <Capabilities />
        <EvidenceAI />
        <Governance />
        <Process />
        <WhyLCH />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
