// src/app/layout.tsx
'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import Sidebar from './components/Sidebar';
import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { ThemeProvider } from './providers'; // Dein Provider

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Verhindert Hydration-Fehler
  useEffect(() => {
    setMounted(true);
  }, []);

  // WICHTIG: Wenn noch nicht gemountet, gib ein leeres HTML-Gerüst zurück,
  // aber MIT html und body tags, damit Next.js nicht meckert.
  if (!mounted) {
    return (
      <html lang="de">
        <body></body>
      </html>
    );
  }

  return (
    /* 1. HTML muss ganz außen sein */
    <html lang="de" suppressHydrationWarning>
      
      {/* 2. BODY kommt direkt danach */}
      <body className={`${inter.className} bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex h-screen overflow-hidden transition-colors duration-300`}>
        
        {/* 3. PROVIDER kommt IN den Body */}
        <ThemeProvider>
          
          {/* Ab hier dein App-Layout */}
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          
          <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <header className="h-16 bg-white dark:bg-slate-900 dark:border-slate-800 border-b border-gray-200 flex items-center px-4 sm:px-8 justify-between shrink-0 transition-colors duration-300">
               <div className="flex items-center gap-4">
                 <button 
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md"
                 >
                   <Menu size={24} />
                 </button>
                 <h2 className="font-semibold text-lg truncate">Dashboard</h2>
               </div>
               
               <div className="flex items-center gap-3">
                 <div className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">Willkommen, John</div>
                 <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-xs">
                   JD
                 </div>
               </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 sm:p-8">
              {children}
            </div>
          </main>

        </ThemeProvider>
      </body>
    </html>
  );
}