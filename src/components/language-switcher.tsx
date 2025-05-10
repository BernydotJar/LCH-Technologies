// src/components/language-switcher.tsx
"use client";

import { useRouter, usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
// ChevronDown is removed from trigger, Globe is replaced by SVG
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Locale } from "@/i18n.config";
import { i18n } from "@/i18n.config";

// Provided SVG icon as a component
const LanguagesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="m5 8 6 6"></path>
    <path d="m4 14 6-6"></path>
    <path d="M2 5h10"></path>
    <path d="M7 2v6"></path>
    <path d="M15 17h6"></path>
    <path d="m18 14v6"></path>
    <path d="m14 20 3-3 3 3"></path>
  </svg>
);

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale() as Locale;
  const t = useTranslations("LanguageSwitcher");

  const switchLanguage = (newLocale: Locale) => {
    let newPath = pathname;
    // Correctly create a regex to match any of the configured locale codes at the start of the path
    const localePattern = new RegExp(`^/(${i18n.locales.map(l => l.code).join('|')})(?=/|$)`);
    
    if (localePattern.test(pathname)) {
      newPath = pathname.replace(localePattern, '');
    }
    // Ensure newPath is at least "/" if it becomes empty (e.g. home page)
    if (newPath === '' || newPath === `/${locale}`) newPath = '/';
    
    router.push(`/${newLocale}${newPath === '/' && newLocale === i18n.defaultLocale ? '' : newPath}`);
    router.refresh(); 
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t('selectLanguageLabel')}>
          <LanguagesIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {i18n.locales.map((loc) => (
          <DropdownMenuItem
            key={loc.code}
            onClick={() => switchLanguage(loc.code as Locale)}
            className={locale === loc.code ? "font-semibold bg-accent/50" : ""}
          >
            {loc.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
