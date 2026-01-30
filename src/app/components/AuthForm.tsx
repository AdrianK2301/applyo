// src/app/components/AuthForm.tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/app/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';

interface AuthFormProps {
    type: 'login' | 'register';
}

export default function AuthForm({ type }: AuthFormProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();
    const router = useRouter();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (type === 'register') {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: name,
                        },
                    },
                });
                if (error) throw error;
                alert('Registrierung erfolgreich! Bitte überprüfe deine E-Mails zur Bestätigung.');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            }
            router.push('/');
            router.refresh();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md p-10 space-y-10 glass-card bg-white/5 border border-white/10 shadow-[0_0_100px_rgba(37,99,235,0.1)] rounded-[3rem] relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-8 text-blue-500/10 pointer-events-none">
                <Sparkles size={100} />
            </div>

            <div className="text-center space-y-4 relative z-10">
                <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-500 shadow-xl shadow-blue-500/10">
                    <User size={32} />
                </div>
                <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white uppercase">
                    {type === 'login' ? 'Willkommen' : 'Konto erstellen'}
                </h1>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                    {type === 'login'
                        ? 'Verwalte deine berufliche Zukunft'
                        : 'Starte deine Reise mit Applyo'}
                </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-6 relative z-10">
                {type === 'register' && (
                    <div className="space-y-3">
                        <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Name</label>
                        <div className="relative group/input">
                            <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-blue-500 transition-colors" size={18} />
                            <input
                                type="text"
                                required
                                className="w-full h-14 glass bg-transparent border border-white/10 rounded-2xl pl-14 pr-6 text-sm font-bold text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-600/10 outline-none transition-all placeholder:text-gray-600"
                                placeholder="Max Mustermann"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                    </div>
                )}
                <div className="space-y-3">
                    <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">E-Mail</label>
                    <div className="relative group/input">
                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-blue-500 transition-colors" size={18} />
                        <input
                            type="email"
                            required
                            className="w-full h-14 glass bg-transparent border border-white/10 rounded-2xl pl-14 pr-6 text-sm font-bold text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-600/10 outline-none transition-all placeholder:text-gray-600"
                            placeholder="mail@beispiel.de"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>
                <div className="space-y-3">
                    <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Passwort</label>
                    <div className="relative group/input">
                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-blue-500 transition-colors" size={18} />
                        <input
                            type="password"
                            required
                            className="w-full h-14 glass bg-transparent border border-white/10 rounded-2xl pl-14 pr-6 text-sm font-bold text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-600/10 outline-none transition-all placeholder:text-gray-600"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 text-xs font-black uppercase text-red-500 bg-red-500/10 rounded-2xl border border-red-500/20"
                    >
                        {error}
                    </motion.div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <>{type === 'login' ? 'Anmelden' : 'Registrieren'} <ArrowRight size={18} /></>}
                </button>
            </form>

            <div className="text-center pt-6 border-t border-white/5 relative z-10">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    {type === 'login' ? 'Noch kein Mitglied?' : 'Bereits Mitglied?'}
                    <Link
                        href={type === 'login' ? '/register' : '/login'}
                        className="ml-2 text-blue-500 hover:text-white transition-colors"
                    >
                        {type === 'login' ? 'Jetzt beitreten' : 'Hier anmelden'}
                    </Link>
                </p>
            </div>
        </motion.div>
    );
}
