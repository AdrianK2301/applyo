// src/app/components/Sidebar.tsx
'use client';

import React from 'react';
import {
  BarChart3,
  Briefcase,
  Calendar,
  Settings,
  LogOut,
  X,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { Lora } from 'next/font/google';

const lora = Lora({ subsets: ['latin'] });

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { icon: BarChart3, label: 'Dashboard', href: '/' },
    { icon: Briefcase, label: 'Bewerbungen', href: '/applications' },
    { icon: Calendar, label: 'Kalender', href: '/calendar' },
    { icon: Settings, label: 'Einstellungen', href: '/settings' },
  ];

  return (
    <>
      <div
        className={clsx(
          "fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40 transition-opacity lg:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <aside className={clsx(
        "fixed lg:static inset-y-0 left-0 w-72 h-full glass transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-50 lg:translate-x-0 border-r border-white/10 flex flex-col pt-8 pb-12",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between px-8 mb-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className={`text-white font-bold text-xl italic tracking-tighter ${lora.className}`}>a</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight"> applyo            </h1>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 text-gray-500 hover:bg-white/10 rounded-xl">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onClose()}
                className={clsx(
                  "relative flex items-center gap-4 px-6 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 overflow-hidden group",
                  isActive
                    ? "text-white shadow-xl shadow-blue-500/20"
                    : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-blue-600 -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon size={18} className={clsx(isActive ? "text-white" : "text-gray-400 group-hover:text-blue-500 transition-colors")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-6 mt-auto">
          <Link href="/add" onClick={() => onClose()} className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-800 text-white p-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all">
            <Plus size={16} />
            Hinzufügen
          </Link>
        </div>
      </aside>
    </>
  );
}