// src/app/components/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Briefcase, Calendar, Settings, PlusCircle, X, Moon, Sun } from 'lucide-react'; // Icons importieren
import { clsx } from 'clsx';
import { useTheme } from 'next-themes'; // Hook importieren
import { useState, useEffect } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Meine Bewerbungen', href: '/applications', icon: Briefcase },
  { name: 'Kalender', href: '/calendar', icon: Calendar },
  { name: 'Einstellungen', href: '/settings', icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  // NEU: Wir holen uns zusätzlich 'resolvedTheme'
  const { theme, setTheme, resolvedTheme } = useTheme(); 
  const [mounted, setMounted] = useState(false);

  // Verhindert Hydration Mismatch
  useEffect(() => setMounted(true), []);

  return (
    <>
      <div 
        className={clsx(
          "fixed inset-0 bg-gray-900/50 z-40 lg:hidden transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sidebar Container: Helle und Dunkle Farben definiert */}
      <div className={clsx(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex flex-col h-full transition-all duration-300 ease-in-out lg:translate-x-0 lg:static",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-slate-800 shrink-0">
          <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">applyo.</h1>
          <button onClick={onClose} className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 flex-shrink-0 ${
                    isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-slate-800 shrink-0 space-y-4">
           {/* Der Dark Mode Switch */}
           <button
             // NEU: Wir prüfen 'resolvedTheme' statt 'theme'
             // Das sorgt dafür, dass der Wechsel auch funktioniert, wenn man vorher auf "System" stand
             onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
             className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-slate-800 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
           >
             <span className="flex items-center gap-2">
               {/* Icon Anzeige Logik */}
               {mounted && resolvedTheme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
               <span>
                   {mounted && resolvedTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}
               </span>
             </span>
           </button>

           <Link 
             href="/add" 
             onClick={onClose}
             className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
           >
              <PlusCircle size={18} />
              <span>Job hinzufügen</span>
           </Link>
        </div>
      </div>
    </>
  );
}