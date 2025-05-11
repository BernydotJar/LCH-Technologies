
import type { Metadata } from 'next';
import Breadcrumbs from '@/components/shared/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Our Solutions - LCH Technologies',
  description: 'Explore the innovative technology solutions offered by LCH Technologies to empower your business.',
};

export default function SolutionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-8">
      {/* Breadcrumbs can be dynamically rendered here based on route or passed as props */}
      {/* For now, a static placeholder or handled within each page */}
      {children}
    </div>
  );
}
