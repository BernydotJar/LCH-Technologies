
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { ThemeToggleButton } from '@/components/theme-toggle-button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { useLanguage } from '@/contexts/language-context';

// Custom SVG Logo Component
const TechFrontLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M8.5 7C7.67157 7 7 7.67157 7 8.5C7 9.32843 7.67157 10 8.5 10H9V14.5C9 15.3284 8.32843 16 7.5 16C6.67157 16 6 15.3284 6 14.5" />
    <path d="M12 18C12 19.1046 12.8954 20 14 20C15.1046 20 16 19.1046 16 18V10.5C16 9.11929 14.8807 8 13.5 8C12.1193 8 11 9.11929 11 10.5V12" />
    <path d="M14 6C14.5523 6 15 5.55228 15 5C15 4.44772 14.5523 4 14 4C13.4477 4 13 4.44772 13 5C13 5.55228 13.4477 6 14 6Z" />
  </svg>
);


export default function Header() {
  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/solutions', label: 'Solutions' },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
    { href: '/meta-generator', label: 'AI Meta Tool' },
    // { href: '/chatbot', label: 'Chatbot' }, // Removed Chatbot link
  ];

  const { language, setLanguage, languages } = useLanguage();

  return (
    <header className="bg-background/80 backdrop-blur-md sticky top-0 z-50 w-full border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-primary">
          <TechFrontLogo className="h-6 w-6 text-primary" />
          <span>TechFront</span>
        </Link>
        <nav className="hidden md:flex gap-6 items-center">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggleButton />
          <Select onValueChange={setLanguage} value={language}>
            <SelectTrigger aria-label="Change language" />
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="grid gap-4 p-4">
                  <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-primary mb-4">
                    <TechFrontLogo className="h-5 w-5 text-primary" />
                    <span>TechFront</span>
                  </Link>
                  {navItems.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="text-muted-foreground hover:text-primary"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

