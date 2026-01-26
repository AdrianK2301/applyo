// src/app/components/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Briefcase, Calendar, Settings, PlusCircle, X } from 'lucide-react';
import { clsx } from 'clsx'; // Hilft uns beim Klassen-Management

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

  return (
    <>
      {/* Mobile Overlay (Dunkler Hintergrund) */}
      <div 
        className={clsx(
          "fixed inset-0 bg-gray-900/50 z-40 lg:hidden transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Die Sidebar selbst */}
      <div className={clsx(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col h-full transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 shrink-0">
          <h1 className="text-xl font-bold text-blue-600">applyo.</h1>
          {/* Schließen Button nur auf Mobile */}
          <button onClick={onClose} className="lg:hidden text-gray-500 hover:text-gray-700">
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
                onClick={onClose} // Schließt Menü auf Mobile nach Klick
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 flex-shrink-0 ${
                    isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 shrink-0">
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