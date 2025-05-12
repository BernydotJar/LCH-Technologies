'use client';

import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { useSection } from '@/contexts/section-context';

interface SectionObserverProps {
  sectionId: string;
  children: ReactNode;
  threshold?: number; // How much of the element should be visible to trigger (0 to 1)
}

export default function SectionObserver({
  sectionId,
  children,
  threshold = 0.5, // Default to 50% visibility
}: SectionObserverProps) {
  const { setActiveSectionId } = useSection();
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActiveSectionId(sectionId);
        } else {
          // Optional: Clear if it's the one currently set and it goes out of view
          // setActiveSectionId((prevId) => (prevId === sectionId ? null : prevId));
          // For simplicity, we'll let another intersecting section overwrite it.
          // If no other section is intersecting, the last active one remains.
          // Consider a more sophisticated logic if multiple sections can be "partially" active.
        }
      },
      {
        threshold: threshold,
      }
    );

    const currentRef = sectionRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [sectionId, setActiveSectionId, threshold]);

  return <div ref={sectionRef}>{children}</div>;
}
