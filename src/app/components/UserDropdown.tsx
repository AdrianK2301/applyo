// src/app/components/UserDropdown.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/app/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Settings, LogOut, ChevronDown, User } from 'lucide-react';
import Link from 'next/link';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';

interface UserDropdownProps {
    user: SupabaseUser;
}

export default function UserDropdown({ user }: UserDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();
    const router = useRouter();

    const fullName = user.user_metadata?.full_name || user.email?.split('@')[0];
    const initials = user.email?.slice(0, 2).toUpperCase() || '??';
    const avatarUrl = user.user_metadata?.avatar_url;

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-4 p-1 rounded-2xl hover:bg-white/10 transition-all focus:outline-none group"
            >
                <div className="h-10 w-10 rounded-xl overflow-hidden shadow-lg flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-xs uppercase border border-white/10 group-hover:scale-105 transition-transform">
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt="Avatar"
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        initials
                    )}
                </div>
                <div className="hidden sm:flex items-center gap-2">
                    <span className="text-sm font-black text-gray-900 dark:text-white tracking-tight">{fullName}</span>
                    <ChevronDown size={14} className={`text-gray-500 transition-all duration-300 ${isOpen ? 'rotate-180 text-white' : ''}`} />
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute right-0 mt-3 w-56 glass bg-white/90 dark:bg-slate-900/90 border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl py-3 z-50 overflow-hidden"
                    >
                        <div className="px-5 py-3 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                            <p className="text-xs font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight truncate">{fullName}</p>
                            <p className="text-[10px] text-gray-500 font-bold truncate mt-0.5">{user.email}</p>
                        </div>

                        <div className="p-2 space-y-1">
                            <Link
                                href="/settings"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-2xl transition-all"                            >
                                <Settings size={16} className="text-blue-500" />
                                <span>Einstellungen</span>
                            </Link>

                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-400 hover:bg-rose-500/5 rounded-2xl transition-all"
                            >
                                <LogOut size={16} />
                                <span>Abmelden</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
