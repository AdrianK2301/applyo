'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, LayoutDashboard, FileText, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

interface OnboardingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-all"
                    />

                    {/* Modal Container */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-2xl pointer-events-auto"
                        >
                            <div className="
  bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-[2.5rem] border border-gray-200 dark:border-white/10 shadow-2xl">
                                {/* Decorative background elements */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] -ml-32 -mb-32 pointer-events-none" />

                                {/* Close Button */}
                                <button
                                    onClick={onClose}
                                    className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all z-10"
                                >
                                    <X size={20} />
                                </button>

                                <div className="p-8 md:p-12">
                                    <div className="flex items-center gap-4 mb-6">

                                        <div>
                                            <h2 className="text-2xl font-black text-black tracking-tight">Willkommen bei applyo</h2>
                                            <p className="text-blue-400 text-sm font-medium">Dein persönlicher Bewerbungs-Assistent</p>
                                        </div>
                                    </div>

                                    <div className="prose prose-invert max-w-none text-gray-500 mb-10 text-sm leading-relaxed">
                                        <p className="mb-4">
                                            Applyo hilft dir dabei, den Überblick über deine Bewerbungen zu behalten, Dokumente zu organisieren und deine Karriereziele systematisch zu verfolgen.
                                        </p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                                            <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                                                <div className="flex items-center gap-3 mb-3 text-blue-400 font-bold">
                                                    <LayoutDashboard size={18} className="text-blue-400" />
                                                    <span>Übersicht behalten</span>
                                                </div>
                                                <p className="text-xs text-gray-400">Verfolge den Status all deiner Bewerbungen an einem zentralen Ort.</p>
                                            </div>

                                            <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                                                <div className="flex items-center gap-3 mb-3 text-green-400 font-bold">
                                                    <FileText size={18} className="text-green-400" />
                                                    <span>Dokumente managen</span>
                                                </div>
                                                <p className="text-xs text-gray-400">Speichere Lebensläufe und Anschreiben direkt bei den passenden Jobs.</p>
                                            </div>

                                            <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                                                <div className="flex items-center gap-3 mb-3 text-orange-400 font-bold">
                                                    <Calendar size={18} className="text-orange-400" />
                                                    <span>Termine planen</span>
                                                </div>
                                                <p className="text-xs text-gray-400">Verpasse keine Interviews und Deadlines mehr mit dem integrierten Kalender.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <Link
                                            href="/applications"
                                            onClick={onClose}
                                            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-4 px-6 rounded-2xl font-bold text-center transition-all flex items-center justify-center gap-2 group"
                                        >
                                            <LayoutDashboard size={18} className="group-hover:scale-110 transition-transform" />
                                            Zur Übersicht
                                        </Link>

                                        {/* Assuming there might be a setup wizard or similar, linking to Add for now or maybe Settings if that's what user meant by Wizard. 
                        The prompt said "The wizard or application overview should be linked". 
                        I'll link 'overview' above. For 'wizard', I'll deduce if there is one. 
                        Looking at file structure, 'add' seems like a creation wizard.
                    */}
                                        <Link
                                            href="/add"
                                            onClick={onClose}
                                            className="flex-1 bg-white/5 hover:bg-white/10 text-blue-500 py-4 px-6 rounded-2xl font-bold text-center border border-grey/10 transition-all flex items-center justify-center gap-2 group"
                                        >
                                            Neue Bewerbung
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
