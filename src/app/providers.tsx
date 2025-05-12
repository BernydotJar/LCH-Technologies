"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes/dist/types";
import { LanguageProvider } from "@/contexts/language-context";
import { SectionProvider } from "@/contexts/section-context"; // Import SectionProvider

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider 
      attribute="class" 
      defaultTheme="system" 
      enableSystem
      disableTransitionOnChange
    >
      <LanguageProvider>
        <SectionProvider> {/* Add SectionProvider here */}
          {children}
        </SectionProvider>
      </LanguageProvider>
    </NextThemesProvider>
  );
}
