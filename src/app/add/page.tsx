// src/app/add/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Link as LinkIcon, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useJobs } from '@/app/hooks/useJobs'; // Hook importieren

export default function AddJobPage() {
  const router = useRouter();
  const { addJob } = useJobs(); // Hook nutzen
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [url, setUrl] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    status: 'Merkliste',
    priority: 'Medium',
    url: ''
  });

  const handleAnalyze = () => {
    if (!url) return;
    setIsLoading(true);
    // Simulierter Import
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
      setFormData({
        ...formData,
        url: url,
        title: 'Senior Frontend Engineer', 
        company: 'Spotify AB',            
        location: 'Berlin (Hybrid)',      
      });
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Neues Job-Objekt erstellen
    const newJob: any = {
        id: Date.now().toString(), // Simple ID Generierung
        ...formData,
        lastUpdate: new Date().toISOString().split('T')[0],
    };

    // Speichern über den Hook
    addJob(newJob);

    // Weiterleitung
    router.push('/applications');
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/applications" className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Neuen Job hinzufügen</h1>
          <p className="text-gray-500">Importiere Daten automatisch oder trage sie manuell ein.</p>
        </div>
      </div>

      {step === 1 && (
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-center space-y-6">
          <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles size={32} />
          </div>
          <h2 className="text-lg font-semibold">Magic Import</h2>
          <p className="text-gray-500 max-w-md mx-auto">Link zur Stellenanzeige einfügen. Wir füllen die Details automatisch aus.</p>

          <div className="flex gap-2 max-w-lg mx-auto">
            <div className="relative flex-1">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="https://..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <button 
              onClick={handleAnalyze}
              disabled={isLoading || !url}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : 'Analysieren'}
            </button>
          </div>
          <div className="pt-6 border-t border-gray-100">
            <button onClick={() => setStep(2)} className="text-sm text-gray-500 hover:text-gray-900 underline">Überspringen & manuell eingeben</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {url && <div className="bg-green-50 text-green-700 p-3 rounded-lg flex items-center gap-2 text-sm mb-4"><CheckCircle2 size={16} /> Daten erfolgreich extrahiert!</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Jobtitel</label>
              <input required type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Firma</label>
              <input required type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Standort</label>
              <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option>Merkliste</option>
                <option>In Vorbereitung</option>
                <option>Beworben</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priorität</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value as any})}>
                <option value="High">Hoch 🔥</option>
                <option value="Medium">Mittel</option>
                <option value="Low">Niedrig</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button type="submit" className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700">Job speichern</button>
            <button type="button" onClick={() => router.back()} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">Abbrechen</button>
          </div>
        </form>
      )}
    </div>
  );
}