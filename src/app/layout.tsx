// src/app/layout.tsx
'use client'; // WICHTIG: Macht dies zu einer Client Component

import './globals.css';
import { Inter } from 'next/font/google';
import Sidebar from './components/Sidebar';
import { useState } from 'react';
import { Menu } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <html lang="de">
      <body className={`${inter.className} bg-gray-50 text-slate-900 flex h-screen overflow-hidden`}>
        
        {/* Sidebar mit State-Steuerung */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        {/* Hauptinhalt */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          
          {/* Header */}
          <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 sm:px-8 justify-between shrink-0">
             <div className="flex items-center gap-4">
               {/* Hamburger Button (nur Mobile sichtbar) */}
               <button 
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-md"
               >
                 <Menu size={24} />
               </button>
               <h2 className="font-semibold text-lg truncate">Dashboard</h2>
             </div>
             
             <div className="flex items-center gap-3">
               <div className="text-sm text-gray-500 hidden sm:block">Willkommen, John</div>
               <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
                 JD
               </div>
             </div>
          </header>

          {/* Scrollbarer Content Bereich */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}