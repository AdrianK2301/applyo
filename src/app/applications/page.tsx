'use client';

import { useState } from 'react';
import { jobs, Job } from '@/app/lib/data'; // Importiert unsere Dummy-Daten
import { Search, Filter, MoreHorizontal, X, MapPin, DollarSign, Calendar, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function ApplicationsPage() {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null); // Für den Side-Drawer
  const [activeTab, setActiveTab] = useState('Alle');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. FILTER LOGIK: Tabs + Suche
  const filteredJobs = jobs.filter(job => {
    // A. Tab Filter
    const matchesTab = 
      activeTab === 'Alle' ? true :
      activeTab === 'Aktiv' ? ['Beworben', 'Interview'].includes(job.status) :
      activeTab === 'Merkliste' ? job.status === 'Merkliste' :
      true; // Archiv Logik könnte hier noch hin

    // B. Such Filter (Titel oder Firma)
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      job.title.toLowerCase().includes(query) || 
      job.company.toLowerCase().includes(query);

    return matchesTab && matchesSearch;
  });

  return (
    <div className="relative flex h-[calc(100vh-8rem)]"> 
      
      {/* === HAUPTBEREICH (TABELLE) === */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Bar: Suche & Filter & Button */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between gap-4">
          
          {/* Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-lg self-start">
             {['Alle', 'Merkliste', 'Aktiv'].map(tab => (
               <button
                 key={tab}
                 onClick={() => setActiveTab(tab)}
                 className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                    activeTab === tab 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                 }`}
               >
                 {tab}
               </button>
             ))}
          </div>

          <div className="flex gap-3">
             {/* Suche */}
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input 
                   type="text" 
                   placeholder="Suchen..." 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
                />
             </div>
             
             {/* Add Button (Mobile/Desktop) */}
             <Link href="/add" className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors whitespace-nowrap">
                + Job
             </Link>
          </div>
        </div>

        {/* Tabelle */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-200 sticky top-0">
                <tr>
                  <th className="px-6 py-3 font-medium">Jobtitel</th>
                  <th className="px-6 py-3 font-medium">Firma</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Priorität</th>
                  <th className="px-6 py-3 font-medium">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredJobs.length > 0 ? (
                  filteredJobs.map((job) => (
                    <tr 
                      key={job.id} 
                      onClick={() => setSelectedJob(job)} 
                      className={`hover:bg-blue-50 cursor-pointer transition-colors ${selectedJob?.id === job.id ? 'bg-blue-50' : ''}`}
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">{job.title}</td>
                      <td className="px-6 py-4 text-gray-600">{job.company}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={job.status} />
                      </td>
                      <td className="px-6 py-4">
                        <PriorityBadge priority={job.priority} />
                      </td>
                      <td className="px-6 py-4 text-gray-500">{job.lastUpdate}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      Keine Bewerbungen gefunden.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* === DETAIL DRAWER (SLIDE-OVER) === */}
      {/* Overlay für Mobile (klickt man es, schließt sich der Drawer) */}
      {selectedJob && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setSelectedJob(null)}
        ></div>
      )}

      {/* Das Panel selbst */}
      <div className={`
        fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white shadow-2xl border-l border-gray-200 
        transform transition-transform duration-300 ease-in-out z-50 flex flex-col
        ${selectedJob ? 'translate-x-0' : 'translate-x-full'}
      `}>
         {selectedJob ? (
           <>
             {/* Drawer Header */}
             <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 leading-tight">{selectedJob.title}</h2>
                  <p className="text-blue-600 font-medium">{selectedJob.company}</p>
                </div>
                <button onClick={() => setSelectedJob(null)} className="text-gray-400 hover:text-gray-600 p-1">
                  <X size={24} />
                </button>
             </div>
             
             {/* Drawer Content (Scrollable) */}
             <div className="flex-1 overflow-y-auto p-6 space-y-8">
                
                {/* Metadaten */}
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-gray-500 text-xs uppercase font-bold mb-1">
                        <MapPin size={12} /> Ort
                      </div>
                      <div className="text-sm font-medium">{selectedJob.location}</div>
                   </div>
                   <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-gray-500 text-xs uppercase font-bold mb-1">
                        <DollarSign size={12} /> Gehalt
                      </div>
                      <div className="text-sm font-medium">k.A.</div>
                   </div>
                </div>

                {/* Status Kontrolle */}
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Status & Phase</label>
                   <select 
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                      defaultValue={selectedJob.status}
                   >
                      <option value="Merkliste">Merkliste</option>
                      <option value="In Vorbereitung">In Vorbereitung</option>
                      <option value="Beworben">Beworben (Warten)</option>
                      <option value="Interview">Interview</option>
                      <option value="Absage">Absage</option>
                   </select>
                </div>

                {/* Notizen Feld */}
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Persönliche Notizen</label>
                   <textarea 
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm h-32 resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Was ist wichtig für diese Stelle? Ansprechpartner? Fragen?"
                   ></textarea>
                </div>
                
                {/* Timeline / History */}
                <div className="border-t border-gray-100 pt-6">
                   <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                     <Calendar size={16} /> Timeline
                   </h4>
                   <div className="relative pl-4 border-l-2 border-gray-200 space-y-6">
                      <div className="relative">
                        <div className="absolute -left-[21px] bg-blue-500 h-3 w-3 rounded-full border-2 border-white"></div>
                        <p className="text-sm text-gray-500 mb-0.5">{selectedJob.lastUpdate}</p>
                        <p className="text-sm font-medium text-gray-900">Status geändert auf "{selectedJob.status}"</p>
                      </div>
                      <div className="relative">
                        <div className="absolute -left-[21px] bg-gray-300 h-3 w-3 rounded-full border-2 border-white"></div>
                        <p className="text-sm text-gray-500 mb-0.5">2023-10-01</p>
                        <p className="text-sm font-medium text-gray-900">Gespeichert in Merkliste</p>
                      </div>
                   </div>
                </div>

                {/* Link zur Originalanzeige */}
                <a href="#" className="flex items-center justify-center gap-2 w-full border border-gray-300 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  <ExternalLink size={16} />
                  Zur Originalanzeige
                </a>
             </div>
           </>
         ) : null}
      </div>
    </div>
  );
}

// === KOMPONENTEN ===

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'Merkliste': 'bg-gray-100 text-gray-700 border-gray-200',
    'Beworben': 'bg-blue-50 text-blue-700 border-blue-200',
    'Interview': 'bg-yellow-50 text-yellow-700 border-yellow-200',
    'Angebot': 'bg-green-50 text-green-700 border-green-200',
    'Absage': 'bg-red-50 text-red-700 border-red-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    'High': 'text-red-600 bg-red-50',
    'Medium': 'text-orange-600 bg-orange-50',
    'Low': 'text-slate-600 bg-slate-100',
  };
  return (
     <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles[priority]}`}>
       {priority === 'High' && '🔥 '}
       {priority}
     </span>
  );
}