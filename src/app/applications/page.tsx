// src/app/applications/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Job } from '@/app/lib/data';
import { useJobs } from '@/app/hooks/useJobs';
import { Search, X, MapPin, DollarSign, Calendar, ExternalLink, Trash2, Download, Upload } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React from 'react';

export default function ApplicationsPage() {
  const { jobs, updateJob, deleteJob, archiveJob, restoreJob, importJobs, isLoaded } = useJobs();
  const searchParams = useSearchParams();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [activeTab, setActiveTab] = useState('Alle');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'company' | 'priority'>('date');

  useEffect(() => {
    const filter = searchParams.get('filter');
    const status = searchParams.get('status');

    if (filter === 'Aktiv') {
      setActiveTab('Aktiv');
    } else if (status) {
      // If a specific status is requested, we might want to stay on "Alle" or a relevant tab
      // but ensure the list is filtered. For simplicity, we can map common statuses to tabs.
      if (['Beworben', 'Interview'].includes(status)) {
        setActiveTab('Aktiv');
      } else if (status === 'Merkliste') {
        setActiveTab('Merkliste');
      } else {
        setActiveTab('Alle');
      }
    }
  }, [searchParams]);

  if (!isLoaded) return <div className="p-10 text-center text-gray-500">Lade Bewerbungen...</div>;

  const filteredJobs = jobs
    .filter(job => {
      const filterParam = searchParams.get('filter');
      const statusParam = searchParams.get('status');

      let matchesTab = true;

      // Priority: Specific status parameter > Tab filter
      if (statusParam) {
        matchesTab = job.status === statusParam;
      } else {
        matchesTab =
          activeTab === 'Alle' ? job.status !== 'Archiv' :
            activeTab === 'Aktiv' ? ['Beworben', 'Interview'].includes(job.status) :
              activeTab === 'Merkliste' ? job.status === 'Merkliste' :
                activeTab === 'Archiv' ? job.status === 'Archiv' :
                  true;
      }

      const query = searchQuery.toLowerCase();
      const matchesSearch =
        job.title.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query);

      return matchesTab && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime();
      }
      if (sortBy === 'company') {
        return a.company.localeCompare(b.company);
      }
      if (sortBy === 'priority') {
        const priorityScore = { 'High': 3, 'Medium': 2, 'Low': 1 };
        return priorityScore[b.priority] - priorityScore[a.priority];
      }
      return 0;
    });

  return (
    <div className="relative flex h-[calc(100vh-8rem)]">

      {/* HAUPTBEREICH */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top Bar */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-lg self-start transition-colors">
            {['Alle', 'Merkliste', 'Aktiv', 'Archiv'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === tab
                  ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex gap-3 items-center">
            <div className="flex gap-1 mr-2">
              <button
                onClick={() => {
                  const blob = new Blob([JSON.stringify(jobs, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `applyo_backup_${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                }}
                title="Exportieren"
                className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Download size={18} />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                title="Importieren"
                className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Upload size={18} />
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      try {
                        const imported = JSON.parse(event.target?.result as string);
                        if (confirm('Bestehende Daten mit Import überschreiben?')) {
                          importJobs(imported);
                        }
                      } catch (err) {
                        alert('Fehler beim Importieren der Datei.');
                      }
                    };
                    reader.readAsText(file);
                  }}
                />
              </button>
            </div>
            <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-lg transition-colors">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 py-1 outline-none"
              >
                <option value="date">Zuletzt aktualisiert</option>
                <option value="company">Firma A-Z</option>
                <option value="priority">Priorität</option>
              </select>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64 placeholder-gray-400 transition-colors"
              />
            </div>
            <Link href="/add" className="bg-slate-900 dark:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-blue-700 transition-colors whitespace-nowrap">
              + Job
            </Link>
          </div>
        </div>

        {/* Tabelle */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 flex-1 overflow-hidden flex flex-col transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-slate-700 sticky top-0 transition-colors">
                <tr>
                  <th className="px-6 py-3 font-medium">Jobtitel</th>
                  <th className="px-6 py-3 font-medium">Firma</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Priorität</th>
                  <th className="px-6 py-3 font-medium">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {filteredJobs.length > 0 ? (
                  filteredJobs.map((job) => (
                    <tr
                      key={job.id}
                      onClick={() => setSelectedJob(job)}
                      className={`cursor-pointer transition-colors ${selectedJob?.id === job.id
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : 'hover:bg-blue-50 dark:hover:bg-slate-800'
                        }`}
                    >
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{job.title}</td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{job.company}</td>
                      <td className="px-6 py-4"><StatusBadge status={job.status} /></td>
                      <td className="px-6 py-4"><PriorityBadge priority={job.priority} /></td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-500">{job.lastUpdate}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">Keine Bewerbungen gefunden.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MOBILE OVERLAY */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/50 z-40 lg:hidden" onClick={() => setSelectedJob(null)}></div>
      )}

      {/* DETAIL DRAWER */}
      <div className={`fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white dark:bg-slate-900 shadow-2xl border-l border-gray-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${selectedJob ? 'translate-x-0' : 'translate-x-full'}`}>
        {selectedJob ? (
          <>
            <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-start bg-gray-50 dark:bg-slate-800/50 transition-colors">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{selectedJob.title}</h2>
                <p className="text-blue-600 dark:text-blue-400 font-medium">{selectedJob.company}</p>
              </div>
              <button onClick={() => setSelectedJob(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg transition-colors">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs uppercase font-bold mb-1"><MapPin size={12} /> Ort</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-200">{selectedJob.location}</div>
                </div>
                <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg transition-colors">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs uppercase font-bold mb-1"><DollarSign size={12} /> Gehalt</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-200">k.A.</div>
                </div>
              </div>

              {/* Status Update */}
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Status & Phase</label>
                <select
                  className="w-full border border-gray-300 dark:border-slate-700 rounded-lg p-2.5 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                  value={selectedJob.status}
                  onChange={(e) => {
                    const newStatus = e.target.value as any;
                    const updated = { ...selectedJob, status: newStatus, lastUpdate: new Date().toISOString().split('T')[0] };
                    setSelectedJob(updated);
                    updateJob(updated);
                  }}
                >
                  <option value="Merkliste">Merkliste</option>
                  <option value="In Vorbereitung">In Vorbereitung</option>
                  <option value="Beworben">Beworben (Warten)</option>
                  <option value="Interview">Interview</option>
                  <option value="Absage">Absage</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Persönliche Notizen</label>
                <textarea
                  className="w-full border border-gray-300 dark:border-slate-700 rounded-lg p-3 text-sm h-32 resize-none bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                  placeholder="Notizen..."
                ></textarea>
              </div>

              <div className="border-t border-gray-100 dark:border-slate-800 pt-6">
                <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Calendar size={16} /> Timeline</h4>
                <div className="relative pl-4 border-l-2 border-gray-200 dark:border-slate-700 space-y-6">
                  <div className="relative">
                    <div className="absolute -left-[21px] bg-blue-500 h-3 w-3 rounded-full border-2 border-white dark:border-slate-900"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-0.5">{selectedJob.lastUpdate}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-200">Letztes Update</p>
                  </div>
                </div>
              </div>

              <a href="#" className="flex items-center justify-center gap-2 w-full border border-gray-300 dark:border-slate-700 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                <ExternalLink size={16} /> Zur Originalanzeige
              </a>

              {selectedJob.status === 'Archiv' ? (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      restoreJob(selectedJob.id);
                      setSelectedJob({ ...selectedJob, status: 'Merkliste' });
                    }}
                    className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Wiederherstellen
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Möchtest du diese Bewerbung wirklich ENDGÜLTIG löschen? Dies kann nicht rückgängig gemacht werden.')) {
                        deleteJob(selectedJob.id);
                        setSelectedJob(null);
                      }
                    }}
                    className="flex items-center justify-center gap-2 w-full border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 py-2.5 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors mt-2"
                  >
                    <Trash2 size={16} /> Endgültig löschen
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    if (confirm('Möchtest du diese Bewerbung ins Archiv verschieben?')) {
                      archiveJob(selectedJob.id);
                      setSelectedJob({ ...selectedJob, status: 'Archiv' });
                    }
                  }}
                  className="flex items-center justify-center gap-2 w-full border border-gray-300 dark:border-slate-700 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Trash2 size={16} /> In das Archiv verschieben
                </button>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

// Komponenten (Badges) müssen auch angepasst werden für bessere Lesbarkeit
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'Merkliste': 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-slate-800 dark:text-gray-300 dark:border-slate-700',
    'Beworben': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
    'Interview': 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
    'Angebot': 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
    'Absage': 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
  };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || 'bg-gray-100 text-gray-800'}`}>{status}</span>;
}

function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    'High': 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400',
    'Medium': 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400',
    'Low': 'text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-400',
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles[priority]}`}>{priority === 'High' && '🔥 '}{priority}</span>;
}