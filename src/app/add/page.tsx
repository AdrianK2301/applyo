// src/app/add/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Link as LinkIcon, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AddJobPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // Steuert, ob wir URL-Input oder Formular sehen
  const [isLoading, setIsLoading] = useState(false); // Für die Lade-Animation
  const [url, setUrl] = useState('');

  // Das Formular-State
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    status: 'Merkliste',
    priority: 'Medium',
    url: ''
  });

  // Funktion: Simuliert den "Magic Import" 
  const handleAnalyze = () => {
    if (!url) return;
    
    setIsLoading(true);
    
    // Wir simulieren 1.5 Sekunden "Analysezeit"
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
      
      // Hier tun wir so, als hätten wir Daten gefunden
      setFormData({
        ...formData,
        url: url,
        title: 'Senior Frontend Engineer', // Simuliertes Ergebnis
        company: 'Spotify AB',            // Simuliertes Ergebnis
        location: 'Berlin (Hybrid)',      // Simuliertes Ergebnis
      });
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Hier würde normalerweise der API Call zum Speichern stehen.
    // Wir leiten den Nutzer einfach zurück zur Übersicht.
    alert("Job erfolgreich gespeichert! (Demo)");
    router.push('/applications');
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      
      {/* Header mit Zurück-Button */}
      <div className="mb-8 flex items-center gap-4">
        <Link href="/applications" className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Neuen Job hinzufügen</h1>
          <p className="text-gray-500">Importiere Daten automatisch oder trage sie manuell ein.</p>
        </div>
      </div>

      {/* SCHRITT 1: URL EINGABE [cite: 55] */}
      {step === 1 && (
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-center space-y-6">
          <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles size={32} />
          </div>
          
          <h2 className="text-lg font-semibold">Magic Import</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Füge den Link zur Stellenanzeige ein (LinkedIn, Indeed, etc.). 
            Wir versuchen, die Details automatisch für dich auszufüllen.
          </p>

          <div className="flex gap-2 max-w-lg mx-auto">
            <div className="relative flex-1">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="https://www.linkedin.com/jobs/..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <button 
              onClick={handleAnalyze}
              disabled={isLoading || !url}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : 'Analysieren'}
            </button>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <button onClick={() => setStep(2)} className="text-sm text-gray-500 hover:text-gray-900 underline">
              Überspringen & manuell eingeben
            </button>
          </div>
        </div>
      )}

      {/* SCHRITT 2: FORMULAR ÜBERPRÜFEN [cite: 57] */}
      {step === 2 && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Erfolgsmeldung wenn importiert wurde */}
          {url && (
            <div className="bg-green-50 text-green-700 p-3 rounded-lg flex items-center gap-2 text-sm mb-4">
              <CheckCircle2 size={16} />
              Daten erfolgreich aus Link extrahiert! Bitte überprüfen.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Jobtitel</label>
              <input 
                type="text" 
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Firma</label>
              <input 
                type="text" 
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.company}
                onChange={e => setFormData({...formData, company: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Standort</label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
              >
                <option>Merkliste</option>
                <option>In Vorbereitung</option>
                <option>Beworben</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priorität</label>
              <select 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                value={formData.priority}
                onChange={e => setFormData({...formData, priority: e.target.value as any})}
              >
                <option value="High">Hoch 🔥</option>
                <option value="Medium">Mittel</option>
                <option value="Low">Niedrig</option>
              </select>
            </div>

            <div className="col-span-2">
               <label className="block text-sm font-medium text-gray-700 mb-1">Link zur Anzeige</label>
               <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-500 bg-gray-50 outline-none"
                  value={formData.url}
                  readOnly
               />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="submit" 
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Job speichern
            </button>
            <button 
              type="button" 
              onClick={() => router.back()}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Abbrechen
            </button>
          </div>
        </form>
      )}
    </div>
  );
}