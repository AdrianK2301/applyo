// src/app/applications/page.tsx
'use client';

import { useState } from 'react';
import { useJobs } from '@/app/hooks/useJobs';
import {
  Search,
  Filter,
  List,
  LayoutGrid,
  Plus,
  MoreHorizontal,
  Building2,
  MapPin,
  Calendar,
  ArrowRight,
  ChevronRight,
  Eye,
  Trash2,
  X,
  Copy,
  CheckCircle2,
  ExternalLink,
  Edit,
  Clock,
  User,
  MessageSquare
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Job, Status } from '@/app/lib/data';
import KanbanBoard from '@/app/components/KanbanBoard';

type ViewType = 'list' | 'kanban';
type Priority = 'High' | 'Medium' | 'Low';

export default function ApplicationsPage() {
  const { jobs, isLoaded, deleteJob, updateJob, templates, user } = useJobs();
  const [view, setView] = useState<ViewType>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'prep'>('details');
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<Job | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isLoaded) return (
    <div className="flex items-center justify-center p-20 text-gray-400 font-medium font-mono text-sm tracking-widest uppercase">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-6 h-6 border-2 border-blue-600/20 border-t-blue-600 rounded-full mr-4"
      />
      Bewerbungen werden geladen...
    </div>
  );

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenJob = (job: Job) => {
    setSelectedJob(job);
    setEditFormData({ ...job });
    setIsDrawerOpen(true);
    setActiveTab('details');
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (editFormData) {
      await updateJob(editFormData);
      setSelectedJob(editFormData);
      setIsEditing(false);
    }
  };

  const handleCopyTemplate = (templateBody: string, job: Job) => {
    const userName = user?.user_metadata?.full_name || 'Bewerber';
    const contactName = job.contactPerson || 'Ansprechpartner';

    let text = templateBody
      .replace(/{company}/g, job.company)
      .replace(/{job_title}/g, job.title)
      .replace(/{location}/g, job.location || 'Remote')
      .replace(/{date}/g, new Date().toLocaleDateString('de-DE'))
      .replace(/{contact_name}/g, contactName)
      .replace(/{user_name}/g, userName);

    navigator.clipboard.writeText(text);
    setCopiedId(job.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleTask = async (job: Job, taskIndex: number) => {
    const updatedTasks = [...(job.prepTasks || [])];
    updatedTasks[taskIndex] = {
      ...updatedTasks[taskIndex],
      completed: !updatedTasks[taskIndex].completed
    };
    const updatedJob = { ...job, prepTasks: updatedTasks };
    setSelectedJob(updatedJob);
    await updateJob(updatedJob);
  };

  const statusStyles: Record<Status, string> = {
    'Merkliste': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    'In Vorbereitung': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    'Beworben': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    'Interview': 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    'Angebot': 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    'Absage': 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
    'Archiv': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
  };

  const priorityStyles: Record<Priority, string> = {
    'High': 'text-rose-500',
    'Medium': 'text-amber-500',
    'Low': 'text-blue-500'
  };

  const statuses: Status[] = ['Merkliste', 'In Vorbereitung', 'Beworben', 'Interview', 'Angebot', 'Absage'];
  const priorities: Priority[] = ['High', 'Medium', 'Low'];

  return (
    <div className="h-full flex flex-col gap-10">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative group flex-1 max-w-xl">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-blue-500 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Nach Firma oder Position suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-16 glass-card rounded-[1.5rem] border border-white/10 pl-14 pr-6 text-sm font-bold bg-transparent dark:text-white dark:border-white/5 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all placeholder:text-gray-500"
          />
        </div>

        <div className="flex items-center gap-3 glass p-2 rounded-[1.5rem] border border-white/10 shrink-0">
          <button
            onClick={() => setView('list')}
            className={clsx(
              "p-3 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest",
              view === 'list' ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-gray-500 hover:text-white"
            )}
          >
            <List size={18} />
            <span>Liste</span>
          </button>
          <button
            onClick={() => setView('kanban')}
            className={clsx(
              "p-3 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest",
              view === 'kanban' ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-gray-500 hover:text-white"
            )}
          >
            <LayoutGrid size={18} />
            <span>Kanban</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0 relative">
        <AnimatePresence mode="wait">
          {view === 'list' ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-card rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col h-full bg-white/5"
            >
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Position & Firma</th>
                      <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                      <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Priorität</th>
                      <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Aktualisiert</th>
                      <th className="px-8 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredJobs.length > 0 ? filteredJobs.map((job) => (
                      <motion.tr
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        key={job.id}
                        className="group hover:bg-white/5 transition-all border-b border-white/5 last:border-0 cursor-pointer"
                        onClick={() => handleOpenJob(job)}
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                              <Building2 size={24} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-black text-sm text-gray-900 dark:text-white uppercase tracking-tight truncate">{job.title}</p>
                              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">{job.company}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={clsx("px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest", statusStyles[job.status])}>
                            {job.status}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            <div className={clsx("w-2 h-2 rounded-full", job.priority === 'High' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : job.priority === 'Medium' ? 'bg-amber-500' : 'bg-blue-500')}></div>
                            <span className={clsx("text-[10px] font-black uppercase tracking-widest", priorityStyles[job.priority])}>
                              {job.priority === 'High' ? 'Hoch' : job.priority === 'Medium' ? 'Mittel' : 'Niedrig'}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                            <Clock size={14} className="text-blue-500 opacity-50" />
                            {new Date(job.lastUpdate).toLocaleDateString('de-DE')}
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button className="p-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all shadow-sm">
                            <ChevronRight size={20} />
                          </button>
                        </td>
                      </motion.tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="px-8 py-20 text-center text-gray-500 font-black uppercase tracking-[0.3em] text-xs">Keine Bewerbungen gefunden</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="kanban"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="h-full"
            >
              <KanbanBoard jobs={filteredJobs} onJobClick={handleOpenJob} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Drawer Overlay */}
      <AnimatePresence>
        {isDrawerOpen && selectedJob && editFormData && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/40 dark:bg-slate-950/60 backdrop-blur-xl z-[100]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-2xl glass-card bg-white/95 dark:bg-slate-950/90 z-[110] border-l border-black/5 dark:border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.1)] dark:shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col"
            >
              <div className="p-8 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-black/5 dark:bg-white/5">
                <div className="flex items-center gap-4 flex-1 mr-4">
                  <div className="w-14 h-14 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-blue-500/30 shrink-0">
                    <Building2 size={28} />
                  </div>
                  {isEditing ? (
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={editFormData.title}
                        onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                        className="w-full bg-black/5 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 text-gray-900 dark:text-white font-black uppercase text-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Position"
                      />
                      <input
                        type="text"
                        value={editFormData.company}
                        onChange={(e) => setEditFormData({ ...editFormData, company: e.target.value })}
                        className="w-full bg-black/5 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-1 text-gray-600 dark:text-gray-300 font-bold uppercase text-[10px] tracking-widest focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Firma"
                      />
                    </div>
                  ) : (
                    <div className="min-w-0">
                      <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-tight uppercase truncate">{selectedJob.title}</h2>
                      <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1 tracking-[0.2em] truncate">{selectedJob.company}</p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-2xl transition-all"
                >
                  <X size={28} />
                </button>
              </div>

              <div className="flex gap-4 px-8 mt-6 bg-transparent">
                <button
                  onClick={() => setActiveTab('details')}
                  className={clsx(
                    "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    activeTab === 'details' ? "bg-black/5 dark:bg-white/10 text-gray-900 dark:text-white shadow-lg shadow-black/5 dark:shadow-white/5" : "text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  Einzelheiten
                </button>
                <button
                  onClick={() => setActiveTab('prep')}
                  className={clsx(
                    "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    activeTab === 'prep' ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  In Vorbereitung
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-1 zero-scrollbar">
                <div className="p-8">
                  {activeTab === 'details' ? (
                    <div className="space-y-10">
                      <div className="grid grid-cols-2 gap-6">
                        <DetailCard
                          icon={MapPin}
                          label="Standort"
                          value={isEditing ? (
                            <input
                              type="text"
                              value={editFormData.location}
                              onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                              className="w-full bg-black/5 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-lg px-2 py-1 text-black dark:text-white font-black uppercase text-[11px] focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                          ) : selectedJob.location || 'Remote'}
                        />
                        <DetailCard
                          icon={Calendar}
                          label="Status"
                          value={
                            <select
                              value={isEditing ? editFormData.status : selectedJob.status}
                              onChange={async (e) => {
                                const newStatus = e.target.value as Status;
                                if (isEditing) {
                                  setEditFormData({ ...editFormData, status: newStatus });
                                } else {
                                  const updated = { ...selectedJob, status: newStatus };
                                  setSelectedJob(updated);
                                  await updateJob(updated);
                                }
                              }}
                              className="w-full bg-transparent border-none text-black dark:text-white font-black uppercase text-[11px] outline-none cursor-pointer appearance-none"
                            >
                              {statuses.map(s => <option key={s} value={s} className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">{s}</option>)}
                            </select>
                          }
                        />
                        <DetailCard
                          icon={Clock}
                          label="Letztes Update"
                          value={new Date(selectedJob.lastUpdate).toLocaleDateString()}
                        />
                        <DetailCard
                          icon={Eye}
                          label="Priorität"
                          value={
                            <select
                              value={isEditing ? editFormData.priority : selectedJob.priority}
                              onChange={async (e) => {
                                const newPriority = e.target.value as Priority;
                                if (isEditing) {
                                  setEditFormData({ ...editFormData, priority: newPriority });
                                } else {
                                  const updated = { ...selectedJob, priority: newPriority };
                                  setSelectedJob(updated);
                                  await updateJob(updated);
                                }
                              }}
                              className="w-full bg-transparent border-none text-black dark:text-white font-black uppercase text-[11px] outline-none cursor-pointer appearance-none"
                            >
                              {priorities.map(p => (
                                <option key={p} value={p} className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">
                                  {p === 'High' ? 'Hoch' : p === 'Medium' ? 'Mittel' : 'Niedrig'}
                                </option>
                              ))}
                            </select>
                          }
                        />
                      </div>

                      <div className="space-y-8">
                        {/* Summary */}
                        <div className="space-y-4">
                          <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Zusammenfassung</label>
                          <div className="glass-card p-6 rounded-[2rem] border-gray-200 dark:border-white/5 bg-black/5 dark:bg-white/5">
                            {isEditing ? (
                              <textarea
                                value={editFormData.summary || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, summary: e.target.value })}
                                rows={4}
                                className="w-full bg-transparent text-sm text-gray-700 dark:text-gray-300 leading-relaxed outline-none resize-none"
                                placeholder="Kurze Zusammenfassung..."
                              />
                            ) : (
                              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{selectedJob.summary || selectedJob.description || 'Keine Zusammenfassung verfügbar.'}</p>
                            )}
                          </div>
                        </div>

                        {/* Requirements */}
                        {(selectedJob.requirements?.length > 0 || isEditing) && (
                          <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Anforderungen</label>
                            <ul className="space-y-2">
                              {(isEditing ? (editFormData.requirements || []) : selectedJob.requirements).map((req, i) => (
                                <li key={i} className="flex items-start gap-3 p-3 rounded-xl bg-black/5 dark:bg-white/5 text-xs text-gray-700 dark:text-gray-300">
                                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                  <span>{req}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Benefits */}
                        {(selectedJob.benefits?.length > 0 || isEditing) && (
                          <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Benefits</label>
                            <div className="grid grid-cols-2 gap-3">
                              {(isEditing ? (editFormData.benefits || []) : selectedJob.benefits).map((ben, i) => (
                                <div key={i} className="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/10 text-xs font-bold">
                                  <CheckCircle2 size={14} className="shrink-0" />
                                  <span className="truncate">{ben}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Skills */}
                        {(selectedJob.skills?.length > 0 || isEditing) && (
                          <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Skills & Tech Stack</label>
                            <div className="flex flex-wrap gap-2">
                              {(isEditing ? (editFormData.skills || []) : selectedJob.skills).map((skill, i) => (
                                <span key={i} className="px-3 py-1.5 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-wider border border-blue-600/10">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        <div className="space-y-4">
                          <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Meine Notizen</label>
                          <div className="glass-card p-6 rounded-[2rem] border-gray-200 dark:border-white/5 bg-amber-500/5 border-amber-500/10">
                            {isEditing ? (
                              <textarea
                                value={editFormData.notes || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                                rows={4}
                                className="w-full bg-transparent text-sm text-gray-700 dark:text-gray-300 leading-relaxed outline-none resize-none placeholder:text-gray-500"
                                placeholder="Eigene Notizen hinzufügen..."
                              />
                            ) : (
                              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">{selectedJob.notes || 'Keine eigenen Notizen.'}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Schnell-Briefe (Vorlagen)</label>
                        <div className="grid grid-cols-1 gap-4">
                          {templates.length > 0 ? templates.map(t => (
                            <button
                              key={t.id}
                              onClick={() => handleCopyTemplate(t.body, selectedJob)}
                              className="group flex items-center justify-between p-6 glass border border-black/5 dark:border-white/5 rounded-[1.8rem] hover:bg-black/5 dark:hover:bg-white/5 hover:border-blue-500/30 transition-all text-left"
                            >
                              <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-600/10 text-blue-500 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                  <Copy size={18} />
                                </div>
                                <div>
                                  <p className="text-xs font-black text-gray-800 dark:text-gray-100 uppercase tracking-tight">{t.name}</p>
                                  <p className="text-[9px] text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5">Kopieren & Ausfüllen</p>
                                </div>
                              </div>
                              {copiedId === selectedJob.id && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2 text-green-500 text-[10px] font-black">
                                  <CheckCircle2 size={16} /> KOPIERT
                                </motion.div>
                              )}
                              <ArrowRight size={18} className="text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white group-hover:translate-x-1 transition-all" />
                            </button>
                          )) : (
                            <p className="text-xs text-gray-500 italic p-4">Keine Vorlagen gefunden. Erstelle welche in den Einstellungen.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-10">
                      <div className="p-8 glass-card border-blue-500/20 bg-blue-600/5 rounded-[2.5rem] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-10 text-blue-500/10 group-hover:text-blue-500/20 transition-all">
                          <MessageSquare size={120} />
                        </div>
                        <h4 className="text-xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight relative z-10">In Vorbereitungs-Checklist</h4>
                        <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest mb-8 relative z-10">Bereite dich optimal vor</p>

                        <div className="space-y-4 relative z-10">
                          {selectedJob.prepTasks?.map((task, i) => (
                            <div
                              key={i}
                              onClick={() => toggleTask(selectedJob, i)}
                              className={clsx(
                                "flex items-center gap-4 p-4 glass border-black/5 dark:border-white/5 rounded-2xl cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-all",
                                task.completed && "bg-blue-600/5 border-blue-500/20"
                              )}
                            >
                              <div className={clsx(
                                "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                                task.completed ? "bg-blue-600 border-blue-600 text-white" : "border-black/10 dark:border-white/10 text-transparent hover:border-blue-500"
                              )}>
                                <CheckCircle2 size={14} />
                              </div>
                              <span className={clsx(
                                "text-xs font-bold transition-all",
                                task.completed ? "text-gray-900 dark:text-white line-through opacity-50" : "text-gray-700 dark:text-gray-300"
                              )}>
                                {task.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-8 border-t border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 flex gap-4">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSaveEdit}
                      className="flex-1 h-14 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-blue-500/20"
                    >
                      Speichern
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditFormData({ ...selectedJob }); // Reset
                      }}
                      className="h-14 px-6 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all border border-black/5 dark:border-white/5"
                    >
                      Abbrechen
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex-1 h-14 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all border border-black/5 dark:border-white/5 flex items-center justify-center gap-3"
                    >
                      <Edit size={18} className="text-blue-500" /> Bearbeiten
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Bewerbung wirklich löschen?')) {
                          deleteJob(selectedJob.id);
                          setIsDrawerOpen(false);
                        }
                      }}
                      className="h-14 px-6 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all shadow-lg hover:shadow-rose-500/20"
                    >
                      <Trash2 size={20} />
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailCard({ icon: Icon, label, value }: any) {
  return (
    <div className="glass-card p-6 rounded-[2rem] border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 flex flex-col gap-3 group hover:bg-black/10 dark:hover:bg-white/10 transition-all">
      <div className="flex items-center gap-3">
        <Icon size={16} className="text-blue-500" />
        <span className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-[11px] font-black text-black dark:text-white uppercase tracking-tight group-hover:text-blue-500 transition-colors">{value}</div>
    </div>
  );
}