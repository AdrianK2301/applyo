// src/app/files/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import {
    FileText, Copy, Download, Clock, Plus,
    Trash2, Save, CheckCircle2, ShieldAlert,
    Loader2, X, FileUp
} from 'lucide-react';
import { createClient } from '@/app/lib/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useJobs } from '@/app/hooks/useJobs';
import { EmailTemplate } from '../lib/data';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function FilesPage() {
    const { templates, addTemplate, updateTemplate, deleteTemplate } = useJobs();
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const docInputRef = useRef<HTMLInputElement>(null);
    const [activeDocType, setActiveDocType] = useState<'cv' | 'letter' | null>(null);

    const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
    const [isAddingTemplate, setIsAddingTemplate] = useState(false);
    const [newTemplate, setNewTemplate] = useState({ name: '', subject: '', body: '' });

    const [documents, setDocuments] = useState({
        cvUrl: '',
        cvName: '',
        cvLastUpdated: '',
        cvMasterText: '',
        letterUrl: '',
        letterName: '',
        letterLastUpdated: '',
        letterMasterText: ''
    });

    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        async function getUser() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                setDocuments({
                    cvUrl: user.user_metadata?.cv_url || '',
                    cvName: user.user_metadata?.cv_name || '',
                    cvLastUpdated: user.user_metadata?.cv_last_updated || '',
                    cvMasterText: user.user_metadata?.cv_master_text || '',
                    letterUrl: user.user_metadata?.letter_url || '',
                    letterName: user.user_metadata?.letter_name || '',
                    letterLastUpdated: user.user_metadata?.letter_last_updated || '',
                    letterMasterText: user.user_metadata?.letter_master_text || ''
                });
            }
            setLoading(false);
        }
        getUser();
    }, [supabase]);

    const handleDocumentClick = (type: 'cv' | 'letter') => {
        setActiveDocType(type);
        docInputRef.current?.click();
    };

    const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user || !activeDocType) return;
        setUploading(true);
        setError(null);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${activeDocType}_${Date.now()}.${fileExt}`;
            const filePath = `${user.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, file);
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(filePath);

            const updateData: any = {};
            if (activeDocType === 'cv') {
                updateData.cv_url = publicUrl;
                updateData.cv_name = file.name;
                updateData.cv_last_updated = new Date().toISOString();
            } else {
                updateData.letter_url = publicUrl;
                updateData.letter_name = file.name;
                updateData.letter_last_updated = new Date().toISOString();
            }

            const { error: updateError } = await supabase.auth.updateUser({ data: updateData });
            if (updateError) throw updateError;

            setDocuments(prev => ({
                ...prev,
                ...(activeDocType === 'cv' ? {
                    cvUrl: publicUrl,
                    cvName: file.name,
                    cvLastUpdated: updateData.cv_last_updated
                } : {
                    letterUrl: publicUrl,
                    letterName: file.name,
                    letterLastUpdated: updateData.letter_last_updated
                })
            }));

            setSuccess(`${activeDocType === 'cv' ? 'Lebenslauf' : 'Anschreiben'} hochgeladen.`);
            router.refresh();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Fehler beim Dokument-Upload.');
        } finally {
            setUploading(false);
            setActiveDocType(null);
        }
    };

    const handleSaveMasterTexts = async () => {
        setSaving(true);
        const { error } = await supabase.auth.updateUser({
            data: {
                cv_master_text: documents.cvMasterText,
                letter_master_text: documents.letterMasterText
            }
        });
        setSaving(false);
        if (error) setError(error.message);
        else {
            setSuccess('Texte erfolgreich gespeichert.');
            setTimeout(() => setSuccess(null), 3000);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center p-20 text-gray-400 font-medium font-mono text-sm tracking-widest uppercase">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-6 h-6 border-2 border-blue-600/20 border-t-blue-600 rounded-full mr-4"
            />
            Dateien werden geladen...
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto space-y-12 pb-24 px-4"
        >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Meine Dateien</h1>
                    <p className="text-[10px] font-black text-gray-500 tracking-[0.2em] mt-2 uppercase">Dokumente & E-Mail Vorlagen</p>
                </div>
                <AnimatePresence>
                    {(success || error) && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, x: 20 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.9, x: 20 }}
                            className={clsx(
                                "flex items-center gap-3 px-6 py-3 rounded-2xl border text-xs font-black uppercase tracking-widest shadow-lg",
                                error
                                    ? 'bg-red-500/10 text-red-500 border-red-500/20 shadow-red-500/5'
                                    : 'bg-green-500/10 text-green-500 border-green-500/20 shadow-green-500/5'
                            )}
                        >
                            {error ? <ShieldAlert size={16} /> : <CheckCircle2 size={16} />}
                            {error || success}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="space-y-16">
                {/* Section: Documents */}
                <section className="space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-600/10 text-blue-600 rounded-2xl">
                            <FileText size={24} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Bewerbungsunterlagen</h2>
                    </div>

                    <input type="file" ref={docInputRef} onChange={handleDocumentUpload} className="hidden" />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <DocumentItem
                            title="Master Lebenslauf (CV)"
                            fileName={documents.cvName}
                            lastUpdated={documents.cvLastUpdated}
                            onUpload={() => handleDocumentClick('cv')}
                            onDownload={() => documents.cvUrl && window.open(documents.cvUrl)}
                            isUploading={uploading && activeDocType === 'cv'}
                        />
                        <DocumentItem
                            title="Master Anschreiben"
                            fileName={documents.letterName}
                            lastUpdated={documents.letterLastUpdated}
                            onUpload={() => handleDocumentClick('letter')}
                            onDownload={() => documents.letterUrl && window.open(documents.letterUrl)}
                            isUploading={uploading && activeDocType === 'letter'}
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 tracking-[0.2em] uppercase">Master Lebenslauf Text (für KI)</label>
                            <textarea
                                value={documents.cvMasterText}
                                onChange={(e) => setDocuments({ ...documents, cvMasterText: e.target.value })}
                                placeholder="Kopiere hier den Text deines Lebenslaufs hinein..."
                                className="w-full glass border border-gray-200 dark:border-white/10 rounded-[2rem] p-6 text-sm font-medium h-64 resize-none bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all custom-scrollbar"
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 tracking-[0.2em] uppercase">Master Anschreiben Text (für KI)</label>
                            <textarea
                                value={documents.letterMasterText}
                                onChange={(e) => setDocuments({ ...documents, letterMasterText: e.target.value })}
                                placeholder="Kopiere hier den Text deines Standard-Anschreibens hinein..."
                                className="w-full glass border border-gray-200 dark:border-white/10 rounded-[2rem] p-6 text-sm font-medium h-64 resize-none bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all custom-scrollbar"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end mt-6">
                        <button
                            onClick={handleSaveMasterTexts}
                            disabled={saving}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-5 rounded-2xl text-[10px] font-black tracking-widest shadow-xl shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 uppercase"
                        >
                            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            {saving ? 'Speichert...' : 'Dokumenten-Texte speichern'}
                        </button>
                    </div>
                </section>

                {/* Section: Templates */}
                <section className="space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-600/10 text-indigo-600 rounded-2xl">
                                <Copy size={24} />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">E-Mail Vorlagen</h2>
                        </div>
                        <button
                            onClick={() => setIsAddingTemplate(true)}
                            className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
                        >
                            <Plus size={16} /> Neue Vorlage
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {templates.map(template => (
                            <motion.div layout key={template.id} className="group glass-card border-black/5 dark:border-white/5 p-8 rounded-[2.5rem] hover:border-blue-500/30 transition-all hover:shadow-2xl relative overflow-hidden">
                                <div className="flex justify-between mb-6">
                                    <div className="p-3 bg-blue-600/10 text-blue-500 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                        <FileText size={20} />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setEditingTemplate(template)}
                                            className="p-2.5 text-gray-400 hover:text-blue-500 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-all"
                                        >
                                            <Edit2Icon size={18} />
                                        </button>
                                        <button
                                            onClick={() => deleteTemplate(template.id)}
                                            className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                                <h4 className="font-black text-base text-gray-900 dark:text-white mb-2 tracking-tight">{template.name}</h4>
                                <p className="text-[10px] text-blue-500 font-black mb-6 uppercase tracking-widest truncate">{template.subject}</p>
                                <p className="text-[12px] text-gray-500 dark:text-gray-400 line-clamp-4 leading-relaxed font-medium italic border-l-2 border-black/5 dark:border-white/5 pl-4">&quot;{template.body}&quot;</p>
                            </motion.div>
                        ))}
                        {templates.length === 0 && (
                            <div className="col-span-full p-20 glass-card rounded-[3rem] border-dashed border-2 border-black/5 dark:border-white/5 flex flex-col items-center justify-center text-gray-400 text-center">
                                <Copy size={48} className="mb-4 opacity-20" />
                                <p className="font-black text-[10px] uppercase tracking-widest">Keine Vorlagen gefunden</p>
                                <button onClick={() => setIsAddingTemplate(true)} className="mt-4 text-blue-500 text-xs font-black hover:underline tracking-widest">JETZT ERSTELLEN</button>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* Modals for Adding/Editing Templates */}
            <AnimatePresence>
                {(isAddingTemplate || editingTemplate) && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 dark:bg-slate-950/80 backdrop-blur-xl z-[100]" onClick={() => { setIsAddingTemplate(false); setEditingTemplate(null); }} />
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="fixed inset-0 m-auto w-full max-w-2xl h-fit bg-white/95 dark:bg-slate-950/90 shadow-[0_0_100px_rgba(0,0,0,0.1)] dark:shadow-[0_0_100px_rgba(37,99,235,0.2)] border border-black/5 dark:border-white/10 rounded-[3rem] z-[110] overflow-hidden">
                            <div className="p-10 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-black/5 dark:bg-white/5">
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase">{isAddingTemplate ? 'Vorlage erstellen' : 'Vorlage verfeinern'}</h3>
                                <button onClick={() => { setIsAddingTemplate(false); setEditingTemplate(null); }} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"><X size={28} /></button>
                            </div>
                            <div className="p-10 space-y-8">
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Name der Vorlage</label>
                                    <input
                                        type="text"
                                        value={isAddingTemplate ? newTemplate.name : editingTemplate!.name}
                                        onChange={(e) => isAddingTemplate ? setNewTemplate({ ...newTemplate, name: e.target.value }) : setEditingTemplate({ ...editingTemplate!, name: e.target.value })}
                                        className="w-full glass border border-gray-100 dark:border-white/10 rounded-2xl p-4 text-sm font-bold bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        placeholder="z.B. Nachfassen #1"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">E-Mail Betreff</label>
                                    <input
                                        type="text"
                                        value={isAddingTemplate ? newTemplate.subject : editingTemplate!.subject}
                                        onChange={(e) => isAddingTemplate ? setNewTemplate({ ...newTemplate, subject: e.target.value }) : setEditingTemplate({ ...editingTemplate!, subject: e.target.value })}
                                        className="w-full glass border border-gray-100 dark:border-white/10 rounded-2xl p-4 text-sm font-bold bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        placeholder="Bezüglich meiner Bewerbung..."
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Inhalt (Body)</label>
                                    <textarea
                                        className="w-full glass border border-gray-200 dark:border-white/10 rounded-[2rem] p-6 text-sm font-medium h-56 resize-none bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all custom-scrollbar"
                                        value={isAddingTemplate ? newTemplate.body : editingTemplate!.body}
                                        onChange={e => isAddingTemplate ? setNewTemplate({ ...newTemplate, body: e.target.value }) : setEditingTemplate({ ...editingTemplate!, body: e.target.value })}
                                        placeholder="Hallo {contact_name}, ..."
                                    />
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {['{company}', '{job_title}', '{contact_name}', '{user_name}'].map(tag => (
                                            <span key={tag} className="text-[9px] font-black text-blue-500 px-2.5 py-1 bg-blue-500/10 rounded-lg">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="p-10 bg-black/5 dark:bg-white/5 border-t border-black/5 dark:border-white/5 flex gap-4">
                                <button onClick={() => { setIsAddingTemplate(false); setEditingTemplate(null); }} className="flex-1 py-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-gray-700 dark:text-gray-400 font-black text-[10px] tracking-widest rounded-2xl transition-all uppercase">Abbrechen</button>
                                <button onClick={async () => {
                                    setSaving(true);
                                    if (isAddingTemplate) await addTemplate(newTemplate);
                                    else if (editingTemplate) await updateTemplate(editingTemplate);
                                    setSaving(false);
                                    setIsAddingTemplate(false);
                                    setEditingTemplate(null);
                                    router.refresh();
                                }} className="flex-1 py-4 bg-blue-600 text-white font-black text-[10px] tracking-widest shadow-xl shadow-blue-500/20 rounded-2xl hover:scale-105 transition-all uppercase">
                                    {saving ? 'Synchronisierung...' : 'Vorlage speichern'}
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function DocumentItem({ title, fileName, lastUpdated, onUpload, onDownload, isUploading }: any) {
    return (
        <div className="p-8 glass border border-black/5 dark:border-white/5 rounded-[2.5rem] hover:border-blue-500/30 transition-all group/doc">
            <div className="flex items-start justify-between mb-6">
                <div className="p-3 bg-blue-600/10 text-blue-600 rounded-xl group-hover/doc:bg-blue-600 group-hover/doc:text-white transition-all shadow-sm">
                    <FileText size={24} />
                </div>
                {fileName && (
                    <button onClick={onDownload} className="p-2.5 text-gray-400 hover:text-blue-500 hover:bg-blue-500/5 rounded-xl transition-all">
                        <Download size={20} />
                    </button>
                )}
            </div>
            <h4 className="font-black text-base text-gray-900 dark:text-white mb-1 tracking-tight">{title}</h4>
            <p className="text-[10px] text-gray-500 font-bold mb-6 tracking-widest uppercase truncate">
                {isUploading ? 'Wird hochgeladen...' : fileName || 'Kein Dokument hinterlegt'}
            </p>
            {lastUpdated && !isUploading && (
                <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2 font-black">
                    <Clock size={12} /> Letztes Update: {new Date(lastUpdated).toLocaleDateString('de-DE')}
                </p>
            )}
            <button
                onClick={onUpload}
                disabled={isUploading}
                className="w-full py-4 bg-black/5 dark:bg-white/5 hover:bg-blue-600 hover:text-white text-[10px] font-black uppercase tracking-widest text-blue-500 rounded-2xl border border-black/5 dark:border-white/10 transition-all flex items-center justify-center gap-2"
            >
                {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                {fileName ? 'Aktualisieren' : 'Dokument Hochladen'}
            </button>
        </div>
    );
}

function Edit2Icon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            <path d="m15 5 4 4" />
        </svg>
    );
}
