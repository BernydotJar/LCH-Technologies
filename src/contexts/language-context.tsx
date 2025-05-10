'use client';
import type {Dispatch, SetStateAction} from 'react';
import {createContext, useContext, useState, ReactNode} from 'react';

interface LanguageContextType {
  language: string;
  setLanguage: Dispatch<SetStateAction<string>>;
  languages: { code: string; name: string }[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const languagesData = [
   { code: 'en', name: 'English' },
   { code: 'es', name: 'Spanish' },
   { code: 'it', name: 'Italian' },
];

export function LanguageProvider({children}: {children: ReactNode}) {
  const [language, setLanguage] = useState<string>(languagesData[0].code); // Default to English

  return (
    <LanguageContext.Provider value={{language, setLanguage, languages: languagesData}}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
