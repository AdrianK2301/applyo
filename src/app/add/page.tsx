// src/app/add/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Link as LinkIcon, CheckCircle2, Loader2, Building2, MapPin, Target } from 'lucide-react';
import Link from 'next/link';
import { useJobs } from '@/app/hooks/useJobs';
import { analyzeJob } from '@/app/actions/analyze-job';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { Lora } from 'next/font/google';

const lora = Lora({ subsets: ['latin'] });

export default function AddJobPage() {
  const router = useRouter();
  const { addJob } = useJobs();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    status: 'Merkliste' as const,
    priority: 'Medium' as const,
    url: ''
  });

  const handleAnalyze = async () => {
    if (!url) return;
    setIsLoading(true);
    setError('');

    try {
      const result = await analyzeJob(url);

      if (result?.error) {
        setError(result.error);
        return;
      }

      if (result?.data) {
        setFormData({
          ...formData,
          url: url,
          title: result.data.title || '',
          company: result.data.company || '',
          location: result.data.location || '',
          description: result.data.description || '',
        });
        setStep(2);
      }
    } catch (err) {
      setError('Ein unerwarteter Fehler ist aufgetreten.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newJob: any = {
      id: Date.now().toString(),
      ...formData,
      lastUpdate: new Date().toISOString().split('T')[0],
    };
    addJob(newJob);
    router.push('/applications');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto py-12 px-6"
    >
      <div className="mb-12 flex items-center gap-6">
        <Link href="/applications" className="p-4 glass-card rounded-2xl text-gray-400 hover:text-white hover:bg-white/10 transition-all active:scale-95 shadow-lg border border-white/10 text-gray-400">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className={`${lora.className} text-4xl font-bold text-gray-900 dark:text-white tracking-tight `}>Job hinzufügen</h1>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mt-2">Automatisch importieren oder manuell erfassen</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="glass-card p-12 rounded-[3rem] border border-white/10 shadow-2xl text-center space-y-10 relative overflow-hidden group bg-white/5"
          >


            <div className="h-20 w-20 bg-blue-600/10 text-blue-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/10 group-hover:scale-110 transition-transform duration-500">
              <Sparkles size={40} />
            </div>

            <div className="space-y-4 relative z-10">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Magischer Import</h2>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 max-w-sm mx-auto">Füge den Link zur Stellenanzeige ein. Unsere KI extrahiert alle relevanten Details automatisch für dich.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto relative z-10">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="https://linkedin.com/jobs/..."
                  className="w-full h-16 glass bg-transparent border border-gray-200 dark:border-white/10 rounded-2xl pl-14 pr-6 text-sm font-bold text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-600/10 outline-none transition-all placeholder:text-gray-600"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <button
                onClick={handleAnalyze}
                disabled={isLoading || !url}
                className="h-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-10 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <><Sparkles size={18} /> Analysieren</>}
              </button>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm font-bold bg-red-500/10 p-4 rounded-xl max-w-lg mx-auto relative z-10 border border-red-500/20"
              >
                {error}
              </motion.div>
            )}

            <div className="pt-10 border-t border-white/5 relative z-10">
              <button onClick={() => setStep(2)} className="text-[10px] font-black text-gray-500 hover:text-white uppercase tracking-widest underline decoration-2 underline-offset-8 decoration-white/10 hover:decoration-blue-500 transition-all">Überspringen & manuell erfassen</button>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handleSubmit}
            className="glass-card p-12 rounded-[3.5rem] border border-white/10 shadow-2xl space-y-12 bg-white/5"
          >
            {url && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-500/10 text-green-500 p-5 rounded-2xl flex items-center gap-4 text-xs font-black uppercase tracking-widest border border-green-500/20"
              >
                <CheckCircle2 size={24} />
                Daten erfolgreich extrahiert!
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="col-span-2">
                <Input label="Position / Jobtitel" value={formData.title} onChange={(v: string) => setFormData({ ...formData, title: v })} placeholder="z.B. Senior Frontend Engineer" icon={Target} required />
              </div>
              <Input label="Unternehmen / Firma" value={formData.company} onChange={(v: string) => setFormData({ ...formData, company: v })} placeholder="z.B. Innovate Tech GmbH" icon={Building2} required />
              <Input label="Standort / Ort" value={formData.location} onChange={(v: string) => setFormData({ ...formData, location: v })} placeholder="z.B. Berlin (Hybrid)" icon={MapPin} />

              <div className="col-span-2 space-y-3">
                <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Beschreibung / Notizen</label>
                <textarea
                  className="w-full h-32 glass bg-transparent border border-gray-200 dark:border-white/10 rounded-2xl p-6 text-sm font-bold text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-600/10 outline-none transition-all placeholder:text-gray-600 resize-none"
                  placeholder="Kurze Beschreibung oder wichtige Notizen..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Status</label>
                <select
                  className="w-full h-16 glass bg-transparent border border-gray-200 dark:border-white/10 rounded-2xl px-6 text-sm font-bold text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-600/10 outline-none transition-all"
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                >
                  <option className="bg-slate-900">Merkliste</option>
                  <option className="bg-slate-900">Vorbereitung</option>
                  <option className="bg-slate-900">Beworben</option>
                  <option className="bg-slate-900">Interview</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Priorität</label>
                <select
                  className="w-full h-16 glass bg-transparent border border-gray-200 dark:border-white/10 rounded-2xl px-6 text-sm font-bold text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-600/10 outline-none transition-all"
                  value={formData.priority}
                  onChange={e => setFormData({ ...formData, priority: e.target.value as any })}
                >
                  <option value="High" className="bg-slate-900">Hoch 🔥</option>
                  <option value="Medium" className="bg-slate-900">Mittel</option>
                  <option value="Low" className="bg-slate-900">Niedrig</option>
                </select>
              </div>
            </div>

            <div className="pt-10 border-t border-white/5 flex flex-col sm:flex-row gap-6">
              <button type="submit" className="flex-1 h-18 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/40 hover:scale-105 active:scale-95 transition-all">
                Job speichern
              </button>
              <button type="button" onClick={() => router.back()} className="h-18 px-10 glass text-gray-400 hover:text-white hover:bg-white/10 border border-white/10 rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] transition-all">
                Abbrechen
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Input({ label, value, onChange, placeholder, icon: Icon, required }: any) {
  return (
    <div className="space-y-3">
      <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">{label}</label>
      <div className="relative group/input">
        {Icon && (
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-blue-500 transition-colors">
            <Icon size={20} />
          </div>
        )}
        <input
          required={required}
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={clsx(
            "w-full h-16 glass bg-transparent border border-gray-200 dark:border-white/10 rounded-2xl pr-6 text-sm font-bold text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-600/10 outline-none transition-all placeholder:text-gray-600",
            Icon ? "pl-14" : "pl-6"
          )}
        />
      </div>
    </div>
  );
}