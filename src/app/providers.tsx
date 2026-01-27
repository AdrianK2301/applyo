// src/app/providers.tsx
'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { JobsProvider } from '@/app/providers/JobsProvider';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // attribute="class" sorgt dafür, dass Tailwind die Klasse 'dark' erhält
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <JobsProvider>
        {children}
      </JobsProvider>
    </NextThemesProvider>
  );
}