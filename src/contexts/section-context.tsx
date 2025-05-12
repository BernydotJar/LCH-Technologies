'use client';

import type { Dispatch, SetStateAction, ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';

interface SectionContextType {
  activeSectionId: string | null;
  setActiveSectionId: Dispatch<SetStateAction<string | null>>;
}

const SectionContext = createContext<SectionContextType | undefined>(undefined);

export function SectionProvider({ children }: { children: ReactNode }) {
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  return (
    <SectionContext.Provider value={{ activeSectionId, setActiveSectionId }}>
      {children}
    </SectionContext.Provider>
  );
}

export function useSection() {
  const context = useContext(SectionContext);
  if (context === undefined) {
    throw new Error('useSection must be used within a SectionProvider');
  }
  return context;
}
