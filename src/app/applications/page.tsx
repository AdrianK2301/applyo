// src/app/applications/page.tsx
'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useJobs } from '@/app/hooks/useJobs';
import { useRouter, useSearchParams } from 'next/navigation';
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
  MessageSquare,
  Wand2,
  Sparkles,
  FileDown,
  Loader2,
  Send,
  FileText,
  MoreVertical,
  SlidersHorizontal,
  ArrowUpDown,
  ChevronDown,
  Check
} from 'lucide-react';
import { tailorDocument } from '@/app/actions/tailor-document';
import { generatePDF } from '@/app/lib/pdf';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useStorageUrl } from '@/app/hooks/useStorageUrl';
import { Job, Status, EmailTemplate, EmploymentType } from '@/app/lib/data';
import KanbanBoard from '@/app/components/KanbanBoard';
import { User as SupabaseUser } from '@supabase/supabase-js';

import * as XLSX from 'xlsx';

type ViewType = 'list' | 'kanban';
type Priority = 'High' | 'Medium' | 'Low';

export default function ApplicationsPage() {
  return (
    <Suspense fallback={<div>Laden...</div>}>
      <ApplicationsContent />
    </Suspense>
  );
}

function ApplicationsContent() {
  const { jobs, isLoaded, deleteJob, updateJob, templates, user } = useJobs();
  const [view, setView] = useState<ViewType>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'prep' | 'tailor' | 'send' | 'feedback'>('details');
  const [isTailoring, setIsTailoring] = useState(false);
  const [tailorDocType, setTailorDocType] = useState<'cv' | 'letter'>('letter');
  const [tailoredText, setTailoredText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<Job | null>(null);

  const [sortedJobs, setSortedJobs] = useState<Job[]>([]);
  const [filterStatus, setFilterStatus] = useState<Status | 'All'>('All');
  const [filterPriority, setFilterPriority] = useState<Priority | 'All'>('All');
  const [filterEmploymentType, setFilterEmploymentType] = useState<EmploymentType | 'All'>('All');
  const [sortConfig, setSortConfig] = useState<{ key: 'company' | 'status' | null; direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setIsFilterMenuOpen(false);
      }
    };

    if (isFilterMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterMenuOpen]);


  const [copiedTemplateId, setCopiedTemplateId] = useState<string | null>(null);
  const [expandedTemplateId, setExpandedTemplateId] = useState<string | null>(null);
  const [newItemText, setNewItemText] = useState('');

  const searchParams = useSearchParams();
  const filterType = searchParams.get('filter');
  const jobId = searchParams.get('jobId');

  useEffect(() => {
    let result = jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesFilter = true;

      if (filterType === 'active') {
        matchesFilter = ['Beworben', 'Interview'].includes(job.status);
      } else if (filterType === 'followup') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        matchesFilter = job.status === 'Beworben' && new Date(job.lastUpdate) < sevenDaysAgo;
      } else if (filterType === 'upcoming') {
        const now = new Date();
        matchesFilter = job.status === 'Interview' || (!!job.interviewDate && new Date(job.interviewDate) >= now);
      } else {
        const matchesStatus = filterStatus === 'All' || job.status === filterStatus;
        const matchesPriority = filterPriority === 'All' || job.priority === filterPriority;
        const matchesEmploymentType = filterEmploymentType === 'All' || job.employmentType === filterEmploymentType;
        matchesFilter = matchesStatus && matchesPriority && matchesEmploymentType;
      }

      return matchesSearch && matchesFilter;
    });

    if (sortConfig.key) {
      result.sort((a, b) => {
        let aValue: string = '';
        let bValue: string = '';

        if (sortConfig.key === 'company') {
          aValue = a.company.toLowerCase();
          bValue = b.company.toLowerCase();
        } else if (sortConfig.key === 'status') {
          aValue = a.status;
          bValue = b.status;
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setSortedJobs(result);
  }, [jobs, searchQuery, filterStatus, filterPriority, filterEmploymentType, sortConfig, filterType]);

  // Handle opening job from URL
  useEffect(() => {
    if (isLoaded && jobId) {
      const jobToOpen = jobs.find(j => j.id === jobId);
      if (jobToOpen) {
        handleOpenJob(jobToOpen);
      }
    }
  }, [isLoaded, jobs, jobId]);

  const handleSort = (key: 'company' | 'status') => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleOpenJob = (job: Job) => {
    setSelectedJob(job);
    setEditFormData({ ...job });
    setIsDrawerOpen(true);
    setActiveTab('details');
    setIsEditing(false);
    setNewItemText('');
  };

  const handleSaveEdit = async () => {
    if (editFormData) {
      await updateJob(editFormData);
      setSelectedJob(editFormData);
      setIsEditing(false);
    }
  };

  const handleCopyTemplate = (text: string, templateId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTemplateId(templateId);
    setTimeout(() => setCopiedTemplateId(null), 2000);
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

  const handleAddItem = async () => {
    if (!newItemText.trim() || !selectedJob) return;

    const updatedTasks = [...(selectedJob.prepTasks || []), { text: newItemText, completed: false }];
    const updatedJob = { ...selectedJob, prepTasks: updatedTasks };

    setSelectedJob(updatedJob);
    await updateJob(updatedJob);
    setNewItemText('');
  };

  const handleDeleteTask = async (taskIndex: number) => {
    if (!selectedJob) return;
    const updatedTasks = (selectedJob.prepTasks || []).filter((_, i) => i !== taskIndex);
    const updatedJob = { ...selectedJob, prepTasks: updatedTasks };
    setSelectedJob(updatedJob);
    await updateJob(updatedJob);
  };

  const handleTailor = async () => {
    if (!selectedJob || !user) return;
    setIsTailoring(true);
    try {
      const masterContent = tailorDocType === 'cv'
        ? user.user_metadata?.cv_master_text
        : user.user_metadata?.letter_master_text;

      if (!masterContent) {
        alert('Kein Master-Text in den Einstellungen gefunden. Bitte füge diesen zuerst hinzu.');
        setIsTailoring(false);
        return;
      }

      const { data, error: tailorError } = await tailorDocument(
        selectedJob,
        tailorDocType,
        masterContent,
        user.user_metadata?.full_name || 'Bewerber'
      );

      if (tailorError) throw new Error(tailorError);
      if (data) setTailoredText(data);
    } catch (err: any) {
      alert(err.message || 'Fehler bei der KI-Anpassung.');
    } finally {
      setIsTailoring(false);
    }
  };

  const handleExportExcel = () => {
    const exportData = jobs.map(job => ({
      Titel: job.title,
      Firma: job.company,
      Ort: job.location,
      Status: job.status,
      Priorität: job.priority,
      Zusammenfassung: job.summary || '',
      Anforderungen: job.requirements?.join(', ') || '',
      Aufgaben: job.tasks?.join(', ') || '',
      Benefits: job.benefits?.join(', ') || '',
      'Letztes Update': new Date(job.lastUpdate).toLocaleDateString(),
      'Nächster Schritt': job.nextStep || '',
      'Interview Datum': job.interviewDate ? new Date(job.interviewDate).toLocaleDateString() : '',
      Ansprechpartner: job.contactPerson || '',
      Kontakt: job.contactInfo || '',
      Notizen: job.notes || '',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bewerbungen");
    XLSX.writeFile(wb, "applyo_bewerbungen.xlsx");
  };

  const handleDownloadTailored = () => {
    if (!tailoredText || !selectedJob) return;
    const typeLabel = tailorDocType === 'cv' ? 'Lebenslauf' : 'Anschreiben';
    const fileName = `${selectedJob.company}_${typeLabel} _Anpassung.pdf`;
    generatePDF(`${typeLabel} für ${selectedJob.company} `, tailoredText, fileName);
  };

  const statusStyles: Record<Status, string> = {
    'Merkliste': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    'In Arbeit': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
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

  const statuses: Status[] = ['Merkliste', 'In Arbeit', 'Beworben', 'Interview', 'Angebot', 'Absage'];
  const priorities: Priority[] = ['High', 'Medium', 'Low'];
  const employmentTypes: EmploymentType[] = ['Vollzeit', 'Teilzeit', 'Minijob', 'Werkstudent', 'Praktikum'];

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

        {/* Filters */}
        <div className="relative" ref={filterMenuRef}>
          <button
            onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
            className={clsx(
              "h-16 w-16 flex items-center justify-center rounded-[1.5rem] border transition-all",
              isFilterMenuOpen || filterStatus !== 'All' || filterPriority !== 'All' || filterEmploymentType !== 'All'
                ? "bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-500/20"
                : "glass-card border-white/10 text-gray-500 dark:text-gray-400 hover:bg-white/5"
            )}
          >
            <Filter size={20} />
          </button>

          <AnimatePresence>
            {isFilterMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 sm:left-0 sm:right-auto top-20 w-72 glass-card p-6 rounded-[2rem] border border-white/10 shadow-2xl z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">Filter</h3>
                    {(filterStatus !== 'All' || filterPriority !== 'All' || filterEmploymentType !== 'All') && (
                      <button
                        onClick={() => {
                          setFilterStatus('All');
                          setFilterPriority('All');
                          setFilterEmploymentType('All');
                        }}
                        className="text-[10px] font-bold text-red-400 hover:text-red-300 transition-colors"
                      >
                        Zurücksetzen
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 ml-2">Status</label>
                    <div className="relative group">
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as Status | 'All')}
                        className="w-full h-12 pl-4 pr-10 bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-900 dark:text-white outline-none cursor-pointer hover:bg-gray-200 dark:hover:bg-white/10 transition-all appearance-none"
                      >
                        <option value="All" className="bg-white dark:bg-slate-900">Alle Status</option>
                        {statuses.map(s => <option key={s} value={s} className="bg-white dark:bg-slate-900">{s}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 ml-2">Priorität</label>
                    <div className="relative group">
                      <select
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value as Priority | 'All')}
                        className="w-full h-12 pl-4 pr-10 bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-900 dark:text-white outline-none cursor-pointer hover:bg-gray-200 dark:hover:bg-white/10 transition-all appearance-none"
                      >
                        <option value="All" className="bg-white dark:bg-slate-900">Alle Prioritäten</option>
                        {priorities.map(p => <option key={p} value={p} className="bg-white dark:bg-slate-900">{p}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 ml-2">Anstellungsart</label>
                    <div className="relative group">
                      <select
                        value={filterEmploymentType}
                        onChange={(e) => setFilterEmploymentType(e.target.value as EmploymentType | 'All')}
                        className="w-full h-12 pl-4 pr-10 bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-900 dark:text-white outline-none cursor-pointer hover:bg-gray-200 dark:hover:bg-white/10 transition-all appearance-none"
                      >
                        <option value="All" className="bg-white dark:bg-slate-900">Alle Arten</option>
                        {employmentTypes.map(t => <option key={t} value={t} className="bg-white dark:bg-slate-900">{t}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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

          <div className="w-px h-6 bg-white/10 mx-2" />

          <button
            onClick={handleExportExcel}
            className="p-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            title="Als Excel exportieren"
          >
            <FileDown size={18} />
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
                      <th
                        className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] cursor-pointer hover:text-white transition-colors group select-none"
                        onClick={() => handleSort('company')}
                      >
                        <div className="flex items-center gap-2">
                          Position & Firma
                          {sortConfig.key === 'company' && (
                            <ArrowRight size={12} className={clsx("transition-transform", sortConfig.direction === 'desc' ? 'rotate-90' : '-rotate-90')} />
                          )}
                        </div>
                      </th>
                      <th
                        className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] cursor-pointer hover:text-white transition-colors group select-none"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center gap-2">
                          Status
                          {sortConfig.key === 'status' && (
                            <ArrowRight size={12} className={clsx("transition-transform", sortConfig.direction === 'desc' ? 'rotate-90' : '-rotate-90')} />
                          )}
                        </div>
                      </th>
                      <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Priorität</th>
                      <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Aktualisiert</th>
                      <th className="px-8 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedJobs.length > 0 ? sortedJobs.map((job) => (
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
                              <p className="font-black text-sm text-gray-900 dark:text-white tracking-tight truncate">{job.title}</p>
                              <p className="text-[10px] font-bold text-gray-500 tracking-widest mt-0.5">{job.company}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={clsx("px-4 py-1.5 rounded-xl text-[9px] font-black tracking-widest", statusStyles[job.status])}>
                            {job.status}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            <div className={clsx("w-2 h-2 rounded-full", job.priority === 'High' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : job.priority === 'Medium' ? 'bg-amber-500' : 'bg-blue-500')}></div>
                            <span className={clsx("text-[10px] font-black tracking-widest", priorityStyles[job.priority])}>
                              {job.priority === 'High' ? 'Hoch' : job.priority === 'Medium' ? 'Mittel' : 'Niedrig'}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 tracking-widest">
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
                        <td colSpan={5} className="px-8 py-20 text-center text-gray-500 font-black tracking-[0.3em] text-xs">Keine Bewerbungen gefunden</td>
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
              <KanbanBoard jobs={sortedJobs} onJobClick={handleOpenJob} />
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
                        className="w-full bg-black/5 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 text-gray-900 dark:text-white font-black text-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Position"
                      />
                      <input
                        type="text"
                        value={editFormData.company}
                        onChange={(e) => setEditFormData({ ...editFormData, company: e.target.value })}
                        className="w-full bg-black/5 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-1 text-gray-600 dark:text-gray-300 font-bold text-[10px] tracking-widest focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Firma"
                      />
                    </div>
                  ) : (
                    <div className="min-w-0">
                      <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-tight truncate">{selectedJob.title}</h2>
                      <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 tracking-widest mt-1 tracking-[0.2em] truncate">{selectedJob.company}</p>
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

              <div className="flex gap-3 px-8 mt-6 bg-transparent overflow-x-auto no-scrollbar pb-2">
                <button
                  onClick={() => setActiveTab('details')}
                  className={clsx(
                    "px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all shrink-0",
                    activeTab === 'details' ? "bg-black/5 dark:bg-white/10 text-gray-900 dark:text-white shadow-lg shadow-black/5 dark:shadow-white/5" : "text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  Einzelheiten
                </button>
                <button
                  onClick={() => setActiveTab('prep')}
                  className={clsx(
                    "px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all shrink-0",
                    activeTab === 'prep' ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  Checkliste
                </button>
                <button
                  onClick={() => {
                    setActiveTab('tailor');
                    // Removed setTailoredText('') to persist generated content
                  }}
                  className={clsx(
                    "px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all flex items-center gap-2 shrink-0",
                    activeTab === 'tailor' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  KI-Anpassung
                </button>
                <button
                  onClick={() => setActiveTab('send')}
                  className={clsx(
                    "px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all flex items-center gap-2 shrink-0",
                    activeTab === 'send' ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" : "text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <Send size={14} />
                  Senden
                </button>
                <button
                  onClick={() => setActiveTab('feedback')}
                  className={clsx(
                    "px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all shrink-0",
                    activeTab === 'feedback' ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" : "text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  Rückmeldungen
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-1 zero-scrollbar">
                <div className="p-8">
                  {activeTab === 'details' && (
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
                              className="w-full bg-black/5 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-lg px-2 py-1 text-black dark:text-white font-black text-[11px] focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                          ) : selectedJob.location || 'Remote'}
                        />
                        <DetailCard
                          icon={User}
                          label="Anstellungsart"
                          value={isEditing ? (
                            <select
                              value={editFormData.employmentType || ''}
                              onChange={(e) => setEditFormData({ ...editFormData, employmentType: e.target.value as EmploymentType })}
                              className="w-full bg-transparent border-none text-black dark:text-white font-black text-[11px] outline-none cursor-pointer appearance-none"
                            >
                              <option value="" className="bg-white dark:bg-slate-900">Nicht angegeben</option>
                              {employmentTypes.map(t => (
                                <option key={t} value={t} className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">{t}</option>
                              ))}
                            </select>
                          ) : selectedJob.employmentType || 'Nicht angegeben'}
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
                              className="w-full bg-transparent border-none text-black dark:text-white font-black text-[11px] outline-none cursor-pointer appearance-none"
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
                          icon={Calendar}
                          label="Interview Termin"
                          value={isEditing ? (
                            <input
                              type="date"
                              value={editFormData.interviewDate || ''}
                              onChange={(e) => setEditFormData({ ...editFormData, interviewDate: e.target.value })}
                              className="w-full bg-black/5 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-lg px-2 py-1 text-black dark:text-white font-black uppercase text-[11px] focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                          ) : selectedJob.interviewDate ? new Date(selectedJob.interviewDate).toLocaleDateString('de-DE') : 'Nicht festgelegt'}
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
                              className="w-full bg-transparent border-none text-black dark:text-white font-black text-[11px] outline-none cursor-pointer appearance-none"
                            >
                              {priorities.map(p => (
                                <option key={p} value={p} className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">
                                  {p === 'High' ? 'Hoch' : p === 'Medium' ? 'Mittel' : 'Niedrig'}
                                </option>
                              ))}
                            </select>
                          }
                        />
                        <DetailCard
                          icon={User}
                          label="Ansprechpartner"
                          value={isEditing ? (
                            <input
                              type="text"
                              value={editFormData.contactPerson || ''}
                              onChange={(e) => setEditFormData({ ...editFormData, contactPerson: e.target.value })}
                              className="w-full bg-black/5 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-lg px-2 py-1 text-black dark:text-white font-black text-[11px] focus:ring-1 focus:ring-blue-500 outline-none"
                              placeholder="Name"
                            />
                          ) : selectedJob.contactPerson || 'Nicht angegeben'}
                        />
                        <DetailCard
                          icon={MessageSquare}
                          label="Kontaktinfo"
                          value={isEditing ? (
                            <input
                              type="text"
                              value={editFormData.contactInfo || ''}
                              onChange={(e) => setEditFormData({ ...editFormData, contactInfo: e.target.value })}
                              className="w-full bg-black/5 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-lg px-2 py-1 text-black dark:text-white font-black text-[11px] focus:ring-1 focus:ring-blue-500 outline-none"
                              placeholder="E-Mail / Tel"
                            />
                          ) : selectedJob.contactInfo || 'Nicht angegeben'}
                        />
                        <DetailCard
                          icon={ExternalLink}
                          label="Original Link"
                          value={isEditing ? (
                            <input
                              type="text"
                              value={editFormData.url || ''}
                              onChange={(e) => setEditFormData({ ...editFormData, url: e.target.value })}
                              className="w-full bg-black/5 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-lg px-2 py-1 text-black dark:text-white font-black text-[11px] focus:ring-1 focus:ring-blue-500 outline-none"
                              placeholder="https://..."
                            />
                          ) : selectedJob.url ? (
                            <a href={selectedJob.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors truncate block flex items-center gap-1">
                              Link öffnen <ExternalLink size={10} />
                            </a>
                          ) : 'Nicht angegeben'}
                        />
                      </div>

                      <div className="space-y-8">
                        <div className="space-y-4">
                          <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 tracking-[0.2em]">Zusammenfassung</label>
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

                        {((selectedJob.requirements?.length ?? 0) > 0 || isEditing) && (
                          <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 tracking-[0.2em]">Anforderungen</label>
                            <ul className="space-y-2">
                              {(isEditing ? (editFormData?.requirements || []) : (selectedJob.requirements || [])).map((req, i) => (
                                <li key={i} className="flex items-start gap-3 p-3 rounded-xl bg-black/5 dark:bg-white/5 text-xs text-gray-700 dark:text-gray-200">
                                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                  <span>{req}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {((selectedJob.benefits?.length ?? 0) > 0 || isEditing) && (
                          <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 tracking-[0.2em]">Benefits</label>
                            <div className="grid grid-cols-2 gap-3">
                              {(isEditing ? (editFormData?.benefits || []) : (selectedJob.benefits || [])).map((ben, i) => (
                                <div key={i} className="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/10 text-xs font-bold">
                                  <CheckCircle2 size={14} className="shrink-0" />
                                  <span className="truncate">{ben}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {((selectedJob.tasks?.length ?? 0) > 0 || isEditing) && (
                          <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 tracking-[0.2em]">Aufgaben</label>
                            <ul className="space-y-2">
                              {(isEditing ? (editFormData?.tasks || []) : (selectedJob.tasks || [])).map((task, i) => (
                                <li key={i} className="flex items-start gap-3 p-3 rounded-xl bg-black/5 dark:bg-white/5 text-xs text-gray-700 dark:text-gray-200">
                                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                                  <span>{task}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {((selectedJob.skills?.length ?? 0) > 0 || isEditing) && (
                          <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 tracking-[0.2em]">Skills & Tech Stack</label>
                            <div className="flex flex-wrap gap-2">
                              {(isEditing ? (editFormData?.skills || []) : (selectedJob.skills || [])).map((skill, i) => (
                                <span key={i} className="px-3 py-1.5 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 text-[10px] font-black tracking-wider border border-blue-600/10">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="space-y-4">
                          <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 tracking-[0.2em]">Meine Notizen</label>
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
                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 tracking-[0.2em]">Schnell-Briefe (Vorlagen)</label>
                        <div className="grid grid-cols-1 gap-4">
                          {templates.length > 0 ? templates.map(t => {
                            const processedText = t.body
                              .replace(/{company}/g, selectedJob.company)
                              .replace(/{job_title}/g, selectedJob.title)
                              .replace(/{location}/g, selectedJob.location || 'Remote')
                              .replace(/{date}/g, new Date().toLocaleDateString('de-DE'))
                              .replace(/{contact_name}/g, selectedJob.contactPerson || 'Ansprechpartner')
                              .replace(/{user_name}/g, user?.user_metadata?.full_name || 'Bewerber');

                            const isExpanded = expandedTemplateId === t.id;

                            return (
                              <div
                                key={t.id}
                                className="glass border border-black/5 dark:border-white/5 rounded-[1.8rem] overflow-hidden transition-all hover:bg-black/5 dark:hover:bg-white/5"
                              >
                                <button
                                  onClick={() => setExpandedTemplateId(isExpanded ? null : t.id)}
                                  className="w-full flex items-center justify-between p-6 text-left"
                                >
                                  <div className="flex items-center gap-4">
                                    <div className={clsx(
                                      "p-3 rounded-xl transition-all shadow-sm",
                                      isExpanded ? "bg-blue-600 text-white" : "bg-blue-600/10 text-blue-500"
                                    )}>
                                      <MessageSquare size={18} />
                                    </div>
                                    <div>
                                      <p className="text-xs font-black text-gray-800 dark:text-gray-100 tracking-tight">{t.name}</p>
                                      <p className="text-[9px] text-gray-400 dark:text-gray-500 tracking-widest mt-0.5">{isExpanded ? 'Klicken zum Einklappen' : 'Klicken zum Anzeigen & Kopieren'}</p>
                                    </div>
                                  </div>
                                  <ChevronRight size={18} className={clsx(
                                    "text-gray-400 dark:text-gray-500 transition-transform duration-300",
                                    isExpanded && "rotate-90"
                                  )} />
                                </button>

                                <AnimatePresence>
                                  {isExpanded && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="px-6 pb-6 pt-0 space-y-4">
                                        <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 cursor-text select-text">
                                          <p className="text-xs text-gray-600 dark:text-gray-300 whitespace-pre-wrap font-medium leading-relaxed font-mono">
                                            {processedText}
                                          </p>
                                        </div>

                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCopyTemplate(processedText, t.id);
                                          }}
                                          className={clsx(
                                            "w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
                                            copiedTemplateId === t.id
                                              ? "bg-green-500 text-white shadow-lg shadow-green-500/20"
                                              : "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg hover:scale-[1.02] active:scale-95"
                                          )}
                                        >
                                          {copiedTemplateId === t.id ? (
                                            <>
                                              <CheckCircle2 size={14} />
                                              Kopiert!
                                            </>
                                          ) : (
                                            <>
                                              <Copy size={14} />
                                              Text kopieren
                                            </>
                                          )}
                                        </button>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          }) : (
                            <p className="text-xs text-gray-500 italic p-4">Keine Vorlagen gefunden. Erstelle welche in den Einstellungen.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'prep' && (
                    <div className="space-y-10">
                      <div className="p-8 glass-card border-blue-500/20 bg-blue-600/5 rounded-[2.5rem] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-10 text-blue-500/10 group-hover:text-blue-500/20 transition-all">
                          <MessageSquare size={120} />
                        </div>
                        <h4 className="text-xl font-black text-gray-900 dark:text-white mb-2 tracking-tight relative z-10">In Arbeit-Checkliste</h4>
                        <p className="text-[10px] text-blue-500 font-black tracking-widest mb-8 relative z-10">Bereite dich optimal vor</p>

                        <div className="space-y-4 relative z-10">
                          {selectedJob.prepTasks?.map((task, i) => (
                            <div
                              key={i}
                              onClick={() => toggleTask(selectedJob, i)}
                              className={clsx(
                                "flex items-center gap-4 p-4 glass border-black/5 dark:border-white/5 rounded-2xl cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-all group",
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

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm('Eintrag löschen?')) {
                                    handleDeleteTask(i);
                                  }
                                }}
                                className="p-2 text-gray-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-rose-500/10"
                                title="Löschen"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Add New Item */}
                        <div className="mt-4 relative z-10 flex gap-2">
                          <input
                            type="text"
                            value={newItemText}
                            onChange={(e) => setNewItemText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                            placeholder="Neuen Punkt hinzufügen..."
                            className="flex-1 px-4 py-3 glass bg-white/50 dark:bg-black/20 border-black/5 dark:border-white/10 rounded-xl text-xs font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:text-gray-400"
                          />
                          <button
                            onClick={handleAddItem}
                            disabled={!newItemText.trim()}
                            className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20"
                          >
                            <Plus size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'tailor' && (
                    <div className="space-y-8">
                      <div className="p-8 glass-card border-indigo-500/20 bg-indigo-600/5 rounded-[2.5rem] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-10 text-indigo-500/10 group-hover:text-indigo-500/20 transition-all">
                        </div>
                        <h4 className="text-xl font-black text-gray-900 dark:text-white mb-2 tracking-tight relative z-10">KI-Optimierung</h4>
                        <p className="text-[10px] text-indigo-500 font-black tracking-widest mb-8 relative z-10">Unterlagen auf dieses Unternehmen zuschneiden</p>

                        <div className="flex gap-4 mb-8 relative z-10">
                          <button
                            onClick={() => { setTailorDocType('cv'); setTailoredText(''); }}
                            className={clsx(
                              "flex-1 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all border",
                              tailorDocType === 'cv' ? "bg-indigo-600 border-indigo-500 text-white" : "glass border-black/5 dark:border-white/5 text-gray-500"
                            )}
                          >
                            Lebenslauf (CV)
                          </button>
                          <button
                            onClick={() => { setTailorDocType('letter'); setTailoredText(''); }}
                            className={clsx(
                              "flex-1 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all border",
                              tailorDocType === 'letter' ? "bg-indigo-600 border-indigo-500 text-white" : "glass border-black/5 dark:border-white/5 text-gray-500"
                            )}
                          >
                            Anschreiben
                          </button>
                        </div>

                        {!tailoredText ? (
                          <button
                            onClick={handleTailor}
                            disabled={isTailoring}
                            className="w-full h-16 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black text-[11px] tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 relative z-10"
                          >
                            {isTailoring ? (
                              <>
                                <Loader2 size={20} className="animate-spin" />
                                Generiere Anpassung...
                              </>
                            ) : (
                              <>

                                Jetzt mit KI anpassen
                              </>
                            )}
                          </button>
                        ) : (
                          <div className="space-y-6 relative z-10">
                            <div className="glass-card p-8 rounded-[2rem] border-white/10 bg-black/5 dark:bg-white/5 shadow-inner">
                              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 tracking-[0.2em] uppercase mb-6 block">Vorschau des optimierten Dokuments</label>
                              <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium max-h-[40rem] overflow-y-auto custom-scrollbar pr-4 whitespace-pre-wrap selection:bg-indigo-500/30">
                                {tailoredText}
                              </div>
                            </div>
                            <div className="flex gap-4">
                              <button
                                onClick={() => setTailoredText('')}
                                className="flex-1 h-14 glass text-gray-500 font-black text-[10px] tracking-widest rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-all uppercase"
                              >
                                Neu generieren
                              </button>
                              <button
                                onClick={handleDownloadTailored}
                                className="flex-1 h-14 bg-green-600 text-white font-black text-[10px] tracking-widest rounded-2xl shadow-lg shadow-green-500/20 hover:scale-105 transition-all flex items-center justify-center gap-3 uppercase"
                              >
                                <FileDown size={18} />
                                PDF Download
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-6 bg-blue-500/5 rounded-3xl border border-blue-500/10">
                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-2">💡 Tipp</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                          Die KI nutzt deinen Master-Text aus den Einstellungen und optimiert ihn basierend auf den Anforderungen von <span className="text-blue-500 font-black">{selectedJob.company}</span>.
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'feedback' && (
                    <div className="space-y-8">
                      {/* Header */}
                      <div className="p-8 glass-card border-amber-500/20 bg-amber-600/5 rounded-[2.5rem] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-10 text-amber-500/10 group-hover:text-amber-500/20 transition-all">
                          <MessageSquare size={120} />
                        </div>
                        <h4 className="text-xl font-black text-gray-900 dark:text-white mb-2 tracking-tight relative z-10">Rückmeldungen & Notizen</h4>
                        <p className="text-[10px] text-amber-600 dark:text-amber-500 font-black tracking-widest mb-0 relative z-10">
                          Erfasse Feedback vom Unternehmen und Gesprächsnotizen
                        </p>
                      </div>

                      {/* General Feedback Textbox */}
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 tracking-[0.2em] uppercase ml-2">
                          Allgemeines Feedback
                        </label>
                        <div className="glass-card p-6 rounded-[2rem] border-black/5 dark:border-white/5 bg-white/40 dark:bg-black/20 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all">
                          <textarea
                            value={isEditing ? (editFormData?.feedbackGeneral || '') : (selectedJob.feedbackGeneral || '')}
                            onChange={(e) => {
                              if (isEditing && editFormData) {
                                setEditFormData({ ...editFormData, feedbackGeneral: e.target.value });
                              } else {
                                // Direct update for UI responsiveness
                                const updated = { ...selectedJob, feedbackGeneral: e.target.value };
                                setSelectedJob(updated);
                              }
                            }}
                            onBlur={async () => {
                              if (!isEditing) {
                                // Auto-save on blur
                                await updateJob(selectedJob);
                              }
                            }}
                            rows={6}
                            // Always enabled
                            className="w-full bg-transparent text-sm text-gray-700 dark:text-gray-300 leading-relaxed outline-none resize-none placeholder:text-gray-400"
                            placeholder="Hier Feedback eintragen..."
                          />
                        </div>
                      </div>

                      {/* Dynamic Feedback Items */}
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 tracking-[0.2em] uppercase ml-2">
                            Detail-Feedback
                          </label>
                          {/* Always visible Add Button */}
                          <button
                            onClick={async () => {
                              const newItem = { id: crypto.randomUUID(), title: '', content: '' };

                              if (isEditing && editFormData) {
                                const newItems = [...(editFormData.feedbackItems || []), newItem];
                                setEditFormData({ ...editFormData, feedbackItems: newItems });
                              } else {
                                const newItems = [...(selectedJob.feedbackItems || []), newItem];
                                const updated = { ...selectedJob, feedbackItems: newItems };
                                setSelectedJob(updated);
                                await updateJob(updated);
                              }
                            }}
                            className="text-[10px] font-black text-amber-600 hover:text-amber-700 flex items-center gap-1 bg-amber-500/10 px-3 py-1.5 rounded-lg hover:bg-amber-500/20 transition-all"
                          >
                            <Plus size={12} />
                            Neues Feld
                          </button>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                          {(isEditing ? (editFormData?.feedbackItems || []) : (selectedJob.feedbackItems || [])).map((item, index) => (
                            <div key={item.id} className="glass-card p-6 rounded-[2rem] border-black/5 dark:border-white/5 bg-white/40 dark:bg-black/20 relative group">
                              {/* Always visible Delete Button */}
                              <button
                                onClick={async () => {
                                  if (isEditing && editFormData) {
                                    const newItems = editFormData.feedbackItems?.filter(i => i.id !== item.id);
                                    setEditFormData({ ...editFormData, feedbackItems: newItems });
                                  } else {
                                    const newItems = selectedJob.feedbackItems?.filter(i => i.id !== item.id);
                                    const updated = { ...selectedJob, feedbackItems: newItems };
                                    setSelectedJob(updated);
                                    await updateJob(updated);
                                  }
                                }}
                                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 size={16} />
                              </button>

                              <div className="mb-4 pr-10">
                                <input
                                  type="text"
                                  value={item.title}
                                  onChange={(e) => {
                                    if (isEditing && editFormData && editFormData.feedbackItems) {
                                      const newItems = [...editFormData.feedbackItems];
                                      newItems[index] = { ...item, title: e.target.value };
                                      setEditFormData({ ...editFormData, feedbackItems: newItems });
                                    } else if (!isEditing && selectedJob.feedbackItems) {
                                      const newItems = [...selectedJob.feedbackItems];
                                      newItems[index] = { ...item, title: e.target.value };
                                      setSelectedJob({ ...selectedJob, feedbackItems: newItems });
                                    }
                                  }}
                                  onBlur={async () => {
                                    if (!isEditing) await updateJob(selectedJob);
                                  }}
                                  className="w-full bg-transparent text-sm font-black text-gray-900 dark:text-white outline-none border-b border-transparent focus:border-amber-500/30 placeholder:text-gray-400 pb-1"
                                  placeholder="Titel (z.B. Tech Interview)"
                                />
                              </div>

                              <textarea
                                value={item.content}
                                onChange={(e) => {
                                  if (isEditing && editFormData && editFormData.feedbackItems) {
                                    const newItems = [...editFormData.feedbackItems];
                                    newItems[index] = { ...item, content: e.target.value };
                                    setEditFormData({ ...editFormData, feedbackItems: newItems });
                                  } else if (!isEditing && selectedJob.feedbackItems) {
                                    const newItems = [...selectedJob.feedbackItems];
                                    newItems[index] = { ...item, content: e.target.value };
                                    setSelectedJob({ ...selectedJob, feedbackItems: newItems });
                                  }
                                }}
                                onBlur={async () => {
                                  if (!isEditing) await updateJob(selectedJob);
                                }}
                                rows={4}
                                className="w-full bg-transparent text-sm text-gray-700 dark:text-gray-300 leading-relaxed outline-none resize-none placeholder:text-gray-400"
                                placeholder="Details eintragen..."
                              />
                            </div>
                          ))}

                          {!(isEditing ? (editFormData?.feedbackItems || []) : (selectedJob.feedbackItems || [])).length && (
                            <div className="text-center py-10 text-gray-400 text-xs italic">
                              Noch keine Detail-Einträge vorhanden.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'send' && (
                    <SendTab
                      job={selectedJob}
                      user={user}
                      templates={templates}
                      tailoredText={tailoredText}
                      tailorDocType={tailorDocType}
                    />
                  )}
                </div>
              </div>

              <div className="p-8 border-t border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 flex gap-4">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSaveEdit}
                      className="flex-1 h-14 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] tracking-widest rounded-2xl transition-all shadow-lg shadow-blue-500/20"
                    >
                      Speichern
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditFormData({ ...selectedJob }); // Reset
                      }}
                      className="h-14 px-6 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-black text-[10px] tracking-widest rounded-2xl transition-all border border-black/5 dark:border-white/5"
                    >
                      Abbrechen
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex-1 h-14 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-black text-[10px] tracking-widest rounded-2xl transition-all border border-black/5 dark:border-white/5 flex items-center justify-center gap-3"
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
                      className="h-14 px-6 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white font-black text-[10px] tracking-widest rounded-2xl transition-all shadow-lg hover:shadow-rose-500/20"
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

function SendTab({
  job,
  user,
  templates,
  tailoredText,
  tailorDocType
}: {
  job: Job;
  user: SupabaseUser | null;
  templates: EmailTemplate[];
  tailoredText: string;
  tailorDocType: 'cv' | 'letter';
}) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [attachments, setAttachments] = useState<{ cv: boolean; letter: boolean }>({ cv: false, letter: false });
  const [isSent, setIsSent] = useState(false);

  // Asset Source Management
  const hasMasterCv = !!user?.user_metadata?.cv_url;
  const hasMasterLetter = !!user?.user_metadata?.letter_url;
  const hasTailoredCv = !!tailoredText && tailorDocType === 'cv';
  const hasTailoredLetter = !!tailoredText && tailorDocType === 'letter';

  const [cvSource, setCvSource] = useState<'master' | 'tailored'>(hasTailoredCv ? 'tailored' : 'master');
  const [letterSource, setLetterSource] = useState<'master' | 'tailored'>(hasTailoredLetter ? 'tailored' : 'master');

  const [tailoredPdfUrl, setTailoredPdfUrl] = useState<string | null>(null);

  const { url: signedMasterCvUrl } = useStorageUrl(user?.user_metadata?.cv_url, 'documents');
  const { url: signedMasterLetterUrl } = useStorageUrl(user?.user_metadata?.letter_url, 'documents');

  // 1. Generate PDF Blob if tailored text exists
  // 1. Generate PDF Blob if tailored text exists
  useEffect(() => {
    async function createPdf() {
      if (tailoredText) {
        const blob = await generatePDF('Optimiertes Dokument', tailoredText);
        if (blob) {
          const url = URL.createObjectURL(blob);
          setTailoredPdfUrl(url);
        }
      } else {
        setTailoredPdfUrl(null);
      }
    }
    createPdf();

    // Cleanup to prevent memory leaks
    return () => {
      if (tailoredPdfUrl) URL.revokeObjectURL(tailoredPdfUrl);
    };
  }, [tailoredText]);

  // Update defaults if availability changes
  useEffect(() => {
    if (hasTailoredCv) setCvSource('tailored');
    else if (hasMasterCv) setCvSource('master');

    if (hasTailoredLetter) setLetterSource('tailored');
    else if (hasMasterLetter) setLetterSource('master');
  }, [hasTailoredCv, hasMasterCv, hasTailoredLetter, hasMasterLetter]);

  // Auto-fill body
  useEffect(() => {
    if (selectedTemplateId) {
      const template = templates.find(t => t.id === selectedTemplateId);
      if (template) {
        setSubject(template.subject);
        const processed = template.body
          .replace(/{company}/g, job.company)
          .replace(/{job_title}/g, job.title)
          .replace(/{location}/g, job.location || 'Remote')
          .replace(/{date}/g, new Date().toLocaleDateString('de-DE'))
          .replace(/{contact_name}/g, job.contactPerson || 'Ansprechpartner')
          .replace(/{user_name}/g, user?.user_metadata?.full_name || 'Bewerber');
        setBody(processed);
      }
    }
  }, [selectedTemplateId, templates, job, user]);

  const { updateJob } = useJobs();
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);

  const handleSend = () => {
    const mailtoLink = `mailto:? subject = ${encodeURIComponent(subject)}& body=${encodeURIComponent(body)} `;
    window.location.href = mailtoLink;
    setIsSent(true);

    // Check if user wants to be prompted for status update
    if (user?.user_metadata?.send_status_prompt) {
      setTimeout(() => setShowStatusConfirm(true), 500);
    }
  };

  const handleConfirmStatusUpdate = async () => {
    await updateJob({ ...job, status: 'Beworben' as any });
    setShowStatusConfirm(false);
  };

  const hasCv = hasMasterCv || hasTailoredCv;
  const hasLetter = hasMasterLetter || hasTailoredLetter;

  return (
    <div className="space-y-8">
      <div className="p-8 glass-card border-emerald-500/20 bg-emerald-600/5 rounded-[2.5rem] relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-10 text-emerald-500/10 group-hover:text-emerald-500/20 transition-all">
          <Send size={120} />
        </div>
        <h4 className="text-xl font-black text-gray-900 dark:text-white mb-2 tracking-tight relative z-10">Bewerbung versenden</h4>
        <p className="text-[10px] text-emerald-500 font-black tracking-widest mb-8 relative z-10">E-Mail vorbereiten & Unterlagen anhängen</p>

        <div className="space-y-6 relative z-10">
          {/* Template Selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 tracking-[0.2em]">Vorlage wählen</label>
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="w-full glass bg-white/50 dark:bg-black/20 border-white/20 rounded-xl p-3 text-sm font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">-- Keine Vorlage --</option>
              {templates.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 tracking-[0.2em]">Betreff</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full glass bg-transparent border-black/10 dark:border-white/10 rounded-xl p-3 text-sm font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Bewerbung als..."
            />
          </div>

          {/* Body */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 tracking-[0.2em]">Nachricht</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full h-40 glass bg-transparent border-black/10 dark:border-white/10 rounded-xl p-4 text-sm font-medium text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 resize-none custom-scrollbar"
              placeholder="Sehr geehrte Damen und Herren..."
            />
          </div>

          {/* Attachments Selection */}
          <div className="space-y-4 pt-4 border-t border-black/5 dark:border-white/5">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 tracking-[0.2em]">Anhänge planen</label>
            <div className="flex gap-4">
              {/* CV Button & Selector */}
              <div className="flex-1 space-y-2">
                <button
                  onClick={() => hasCv && setAttachments(p => ({ ...p, cv: !p.cv }))}
                  className={clsx(
                    "w-full p-4 rounded-2xl border text-left transition-all",
                    attachments.cv ? "bg-emerald-500/10 border-emerald-500 text-emerald-600" : "glass border-black/5 dark:border-white/5 text-gray-400",
                    !hasCv && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <p className="text-[10px] font-black tracking-widest mb-1">Lebenslauf</p>
                  <p className="text-xs font-bold">{hasCv ? (cvSource === 'tailored' ? 'KI-Optimierte Version' : 'Master Version') : 'Nicht gefunden'}</p>
                </button>
                {hasMasterCv && hasTailoredCv && attachments.cv && (
                  <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl">
                    <button onClick={() => setCvSource('master')} className={clsx("flex-1 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all", cvSource === 'master' ? "bg-white dark:bg-gray-800 shadow text-gray-900 dark:text-white" : "text-gray-400")}>Master</button>
                    <button onClick={() => setCvSource('tailored')} className={clsx("flex-1 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all", cvSource === 'tailored' ? "bg-white dark:bg-gray-800 shadow text-indigo-600" : "text-gray-400")}>KI-Neu</button>
                  </div>
                )}
              </div>

              {/* Letter Button & Selector */}
              <div className="flex-1 space-y-2">
                <button
                  onClick={() => hasLetter && setAttachments(p => ({ ...p, letter: !p.letter }))}
                  className={clsx(
                    "w-full p-4 rounded-2xl border text-left transition-all",
                    attachments.letter ? "bg-emerald-500/10 border-emerald-500 text-emerald-600" : "glass border-black/5 dark:border-white/5 text-gray-400",
                    !hasLetter && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <p className="text-[10px] font-black tracking-widest mb-1">Anschreiben</p>
                  <p className="text-xs font-bold">{hasLetter ? (letterSource === 'tailored' ? 'KI-Optimierte Version' : 'Master Version') : 'Nicht gefunden'}</p>
                </button>
                {hasMasterLetter && hasTailoredLetter && attachments.letter && (
                  <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl">
                    <button onClick={() => setLetterSource('master')} className={clsx("flex-1 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all", letterSource === 'master' ? "bg-white dark:bg-gray-800 shadow text-gray-900 dark:text-white" : "text-gray-400")}>Master</button>
                    <button onClick={() => setLetterSource('tailored')} className={clsx("flex-1 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all", letterSource === 'tailored' ? "bg-white dark:bg-gray-800 shadow text-indigo-600" : "text-gray-400")}>KI-Neu</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            className="w-full py-4 bg-emerald-600 text-white font-black text-[10px] tracking-widest rounded-2xl shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Send size={16} />
            E-Mail Programm öffnen
          </button>
        </div>
      </div>

      {/* Drag & Drop Zone (Visible after click or always if items selected) */}
      {(isSent || attachments.cv || attachments.letter) && (
        <div className="p-8 glass-card border-black/5 dark:border-white/5 rounded-[2.5rem] space-y-4">
          <div className="flex items-center gap-3 text-emerald-600 mb-2">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <FileDown size={20} />
            </div>
            <p className="text-xs font-black uppercase tracking-widest">Dateien zum Anhängen</p>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Ziehe diese Dateien in dein geöffnetes E-Mail Fenster:
          </p>

          <div className="grid grid-cols-1 gap-3">
            {attachments.cv && hasCv && (
              <a
                href={cvSource === 'tailored' ? (tailoredPdfUrl || '#') : (signedMasterCvUrl || '#')}
                download={cvSource === 'tailored' ? 'Lebenslauf_Optimiert.pdf' : 'Lebenslauf.pdf'}
                target="_blank"
                className="flex items-center gap-4 p-4 glass bg-black/5 dark:bg-white/5 rounded-2xl hover:bg-emerald-500/10 hover:border-emerald-500/50 hover:text-emerald-600 transition-all border border-transparent group/file"
              >
                <FileText size={20} className={cvSource === 'tailored' ? 'text-indigo-500' : ''} />
                <div className="flex flex-col">
                  <span className="font-bold text-sm">Lebenslauf.pdf</span>
                  {cvSource === 'tailored' && <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">KI-Optimiert</span>}
                </div>
                <span className="ml-auto text-[10px] font-black uppercase tracking-widest opacity-0 group-hover/file:opacity-100 transition-opacity">Download</span>
              </a>
            )}
            {attachments.letter && hasLetter && (
              <div className="flex items-center gap-4 p-4 glass bg-black/5 dark:bg-white/5 rounded-2xl border border-transparent group/file w-full">
                <FileText size={20} className={letterSource === 'tailored' ? 'text-indigo-500' : ''} />
                <div className="flex flex-col mr-auto">
                  <span className="font-bold text-sm">Anschreiben</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">
                    {letterSource === 'tailored' ? <span className="text-indigo-500">KI-Optimiert</span> : 'Master Version'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Copy Button */}
                  <button
                    onClick={() => {
                      const textToCopy = letterSource === 'tailored' ? tailoredText : user?.user_metadata?.letter_master_text;
                      if (textToCopy) {
                        navigator.clipboard.writeText(textToCopy);
                        const btn = document.getElementById('btn-copy-action');
                        if (btn) {
                          const originalContent = btn.innerHTML;
                          btn.innerHTML = '<span class="text-green-500"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></span>';
                          setTimeout(() => { if (btn) btn.innerHTML = originalContent; }, 2000);
                        }
                      } else {
                        alert('Kein Text zum Kopieren verfügbar.');
                      }
                    }}
                    id="btn-copy-action"
                    disabled={letterSource === 'master' && !user?.user_metadata?.letter_master_text}
                    className="p-2.5 rounded-xl bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-black/40 text-gray-600 dark:text-gray-300 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Text kopieren"
                  >
                    <Copy size={16} />
                  </button>

                  {/* Download Button */}
                  <a
                    href={letterSource === 'tailored' ? (tailoredPdfUrl || '#') : (signedMasterLetterUrl || '#')}
                    download={letterSource === 'tailored' ? 'Anschreiben_Optimiert.pdf' : 'Anschreiben.pdf'}
                    target="_blank"
                    className="p-2.5 rounded-xl bg-white/50 dark:bg-black/20 hover:bg-emerald-500 hover:text-white text-gray-600 dark:text-gray-300 transition-all"
                    title="PDF Downloaden"
                  >
                    <FileDown size={16} />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status Confirmation Modal */}
      <AnimatePresence>
        {showStatusConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 dark:bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl border border-white/10">
              <div className="flex justify-center mb-6 text-blue-500 bg-blue-500/10 w-16 h-16 rounded-full items-center mx-auto">
                <MapPin size={32} />
              </div>
              <h3 className="text-xl font-black text-center text-gray-900 dark:text-white mb-2">Status aktualisieren?</h3>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                Möchtest du den Status dieser Bewerbung direkt auf <span className="text-blue-500 font-bold">"Beworben"</span> setzen?
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowStatusConfirm(false)} className="flex-1 py-3 bg-gray-100 dark:bg-white/5 rounded-xl text-xs font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all">Nein, lassen</button>
                <button onClick={handleConfirmStatusUpdate} className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:scale-105 transition-all">Ja, ändern</button>
              </div>
            </motion.div>
          </motion.div>
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
      <div className="text-[11px] font-black text-black dark:text-white tracking-tight group-hover:text-blue-500 transition-colors">{value}</div>
    </div>
  );
}