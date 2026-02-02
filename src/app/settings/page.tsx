// src/app/settings/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Bell, LogOut, Save, CheckCircle2, User, Mail, Lock,
  Download, Trash2, Briefcase, FileText, Clock,
  Smartphone, ShieldAlert, Camera, Loader2,
  Copy, X
} from 'lucide-react';
import { createClient } from '@/app/lib/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useRouter, useSearchParams } from 'next/navigation';
import { useJobs } from '@/app/hooks/useJobs';
import { EmailTemplate } from '../lib/data';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

type TabType = 'profile' | 'security' | 'notifications' | 'data' | 'templates';

export default function SettingsPage() {
  const { jobs, templates, addTemplate, updateTemplate, deleteTemplate } = useJobs();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [isAddingTemplate, setIsAddingTemplate] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: '', subject: '', body: '' });

  const [profile, setProfile] = useState({
    name: '',
    jobTitle: '',
    location: 'Remote',
    resumeLink: '',
    followUpDays: '14',
    avatarUrl: ''
  });

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tab = searchParams.get('tab') as TabType;
    if (tab && ['profile', 'security', 'notifications', 'data', 'templates'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    const editId = searchParams.get('edit');
    if (activeTab === 'templates' && editId && templates.length > 0 && !editingTemplate && !isAddingTemplate) {
      const templateToEdit = templates.find(t => t.id === editId);
      if (templateToEdit) setEditingTemplate(templateToEdit);
    }
  }, [searchParams, templates, editingTemplate, isAddingTemplate, activeTab]);

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setEmail(user.email || '');
        setProfile({
          name: user.user_metadata?.full_name || '',
          jobTitle: user.user_metadata?.job_title || '',
          location: user.user_metadata?.location_pref || 'Remote',
          resumeLink: user.user_metadata?.resume_link || '',
          followUpDays: user.user_metadata?.follow_up_days || '14',
          avatarUrl: user.user_metadata?.avatar_url || ''
        });
      }
      setLoading(false);
    }
    getUser();
  }, [supabase]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: profile.name,
          job_title: profile.jobTitle,
          location_pref: profile.location,
          resume_link: profile.resumeLink,
          follow_up_days: profile.followUpDays,
          avatar_url: profile.avatarUrl
        }
      });
      if (error) throw error;
      setSuccess('Profil erfolgreich aktualisiert.');
      router.refresh();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    setError(null);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true, contentType: file.type });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setProfile(prev => ({ ...prev, avatarUrl: publicUrl }));
      const { error: updateError } = await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
      if (updateError) throw updateError;
      setSuccess('Profilbild hochgeladen.');
      router.refresh();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Fehler beim Upload.');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  if (loading) return (
    <div className="flex items-center justify-center p-20 text-gray-400 font-medium font-mono text-sm tracking-widest uppercase">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-6 h-6 border-2 border-blue-600/20 border-t-blue-600 rounded-full mr-4"
      />
      Einstellungen werden geladen...
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-12 pb-24"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Einstellungen</h1>
          <p className="text-[10px] font-black text-gray-500 tracking-[0.2em] mt-2">Verwalte dein Konto & Erlebnis</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-1">
          <nav className="sticky top-8 flex flex-col gap-2 p-1.5 glass rounded-[2rem] border border-black/5 dark:border-white/10 shadow-xl overflow-hidden">
            {[
              { id: 'profile', label: 'Profil', icon: User },
              { id: 'templates', label: 'Vorlagen', icon: Copy },
              { id: 'security', label: 'Sicherheit', icon: ShieldAlert },
              { id: 'notifications', label: 'Alarme', icon: Bell },
              { id: 'data', label: 'Cloud-Daten', icon: Download },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as TabType)}
                className={clsx(
                  "relative flex items-center gap-4 px-6 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all duration-500 overflow-hidden",
                  activeTab === item.id
                    ? "text-white shadow-lg shadow-blue-500/20"
                    : "text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                )}
              >
                {activeTab === item.id && (
                  <motion.div
                    layoutId="activeSettingTab"
                    className="absolute inset-0 bg-blue-600 -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="lg:col-span-3 min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'profile' && (
                <div className="space-y-10">
                  <Card title="Öffentliche Identität" icon={User}>
                    <form onSubmit={handleUpdateProfile} className="space-y-10">
                      <div className="flex items-center gap-8 group">
                        <div
                          onClick={handleAvatarClick}
                          className="relative h-28 w-28 rounded-[2.5rem] overflow-hidden cursor-pointer shadow-2xl transition-all hover:scale-105 active:scale-95 border-2 border-black/5 dark:border-white/10"
                        >
                          {profile.avatarUrl ? (
                            <img src={profile.avatarUrl} alt="Profil" className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center text-white font-black text-4xl uppercase">
                              {user?.email?.slice(0, 2) || '??'}
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm">
                            {uploading ? <Loader2 size={32} className="text-white animate-spin" /> : <Camera size={32} className="text-white" />}
                          </div>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                        <div>
                          <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">Avatar Foto</h3>
                          <div className="flex gap-4 mt-2">
                            <button type="button" onClick={handleAvatarClick} className="text-xs font-black text-blue-500 tracking-widest hover:underline">Ändern</button>
                            {profile.avatarUrl && <button type="button" className="text-xs font-black text-red-500 tracking-widest hover:underline">Löschen</button>}
                          </div>
                          <p className="text-[10px] text-gray-500 tracking-widest mt-2">Empfohlen: 400x400 JPG/PNG</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <SettingInput label="Anzeigename" value={profile.name} onChange={(v: string) => setProfile({ ...profile, name: v })} placeholder="Max Mustermann" />
                        <SettingInput label="Berufliche Rolle" value={profile.jobTitle} onChange={(v: string) => setProfile({ ...profile, jobTitle: v })} placeholder="Senior Entwickler" icon={Briefcase} />
                        <div className="space-y-3">
                          <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 tracking-widest uppercase">Arbeitspräferenz</label>
                          <select
                            value={profile.location}
                            onChange={e => setProfile({ ...profile, location: e.target.value })}
                            className="w-full glass border border-gray-200 dark:border-white/10 rounded-2xl p-4 text-sm font-bold bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          >
                            <option value="Remote">Remote</option>
                            <option value="Hybrid">Hybrid</option>
                            <option value="On-site">Vor Ort</option>
                          </select>
                        </div>
                        <SettingInput label="Link zum Lebenslauf" value={profile.resumeLink} onChange={(v: string) => setProfile({ ...profile, resumeLink: v })} placeholder="https://drive.google.com/..." icon={FileText} />
                      </div>

                      <div className="pt-8 border-t border-black/5 dark:border-white/5 flex justify-end">
                        <button type="submit" disabled={saving} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 rounded-2xl text-[10px] font-black tracking-widest shadow-xl shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                          <Save size={18} /> {saving ? 'Verarbeitung...' : 'Änderungen speichern'}
                        </button>
                      </div>
                    </form>
                  </Card>
                </div>
              )}

              {activeTab === 'templates' && (
                <div className="space-y-10">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase">E-Mail Vorlagen</h3>
                    <button onClick={() => setIsAddingTemplate(true)} className="bg-blue-600/10 text-blue-500 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">
                      + Neue Vorlage
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {templates.map(template => (
                      <motion.div layout key={template.id} className="group glass-card border-black/5 dark:border-white/5 p-6 rounded-[2rem] hover:border-blue-500/30 transition-all hover:shadow-2xl">
                        <div className="flex justify-between mb-4">
                          <div className="p-3 bg-blue-600/10 text-blue-500 rounded-xl"><FileText size={20} /></div>
                          <div className="flex gap-1 transition-all">
                            <button onClick={() => setEditingTemplate(template)} className="p-2 text-gray-500 hover:text-blue-500 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg"><Edit2 size={16} /></button>
                          </div>
                        </div>
                        <h4 className="font-black text-sm text-gray-900 dark:text-white mb-1 tracking-tight">{template.name}</h4>
                        <p className="text-[10px] text-gray-500 font-bold mb-4 truncate text-blue-500 tracking-widest">{template.subject}</p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed italic border-l-2 border-black/5 dark:border-white/5 pl-4">&quot;{template.body}&quot;</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-8">
                  <Card title="Kontoschutz" icon={ShieldAlert}>
                    <div className="space-y-10">
                      <SettingInput label="E-Mail Adresse" value={email} onChange={setEmail} icon={Mail} type="email" />
                      <SettingInput label="Neues Passwort" value={newPassword} onChange={setNewPassword} icon={Lock} type="password" />
                      <div className="flex justify-end pt-4 border-t border-black/5 dark:border-white/5">
                        <button className="bg-black/5 dark:bg-white/5 text-gray-500 dark:text-gray-400 px-8 py-3 rounded-xl text-[10px] font-black tracking-widest hover:text-gray-900 dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-all">Anmeldedaten aktualisieren</button>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {activeTab === 'data' && (
                <div className="space-y-10">
                  <Card title="Cloud & Lokale Daten" icon={Download}>
                    <div className="space-y-6">
                      <div className="p-6 glass-card rounded-3xl border-black/5 dark:border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-blue-600/10 text-blue-600 rounded-2xl"><FileText size={24} /></div>
                          <div>
                            <p className="font-black text-sm text-gray-900 dark:text-white">Datensatz exportieren</p>
                            <p className="text-[10px] text-gray-500 font-bold tracking-widest mt-1">Alle Jobs als CSV herunterladen</p>
                          </div>
                        </div>
                        <button className="text-blue-500 font-black text-xs hover:underline">Starten</button>
                      </div>

                      <div className="p-6 bg-rose-500/5 rounded-3xl border border-rose-500/10 flex items-center justify-between">
                        <div>
                          <p className="font-black text-sm text-rose-500">Atomic Wipe</p>
                          <p className="text-[10px] text-rose-500/60 font-bold tracking-widest mt-1">Alle Tracking-Daten dauerhaft löschen</p>
                        </div>
                        <button className="bg-rose-500 text-white px-6 py-2.5 rounded-xl text-[10px] font-black shadow-lg shadow-rose-500/20 active:scale-95 transition-all">DATEN LÖSCHEN</button>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="flex justify-center pt-20 border-t border-black/5 dark:border-white/5">
        <button onClick={handleLogout} className="flex items-center gap-3 text-[10px] font-black text-gray-500 hover:text-red-500 uppercase tracking-[0.3em] transition-all group">
          <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" /> Bei Applyo abmelden
        </button>
      </div>

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
                <SettingInput label="Name der Vorlage" value={isAddingTemplate ? newTemplate.name : editingTemplate!.name} onChange={(v: string) => isAddingTemplate ? setNewTemplate({ ...newTemplate, name: v }) : setEditingTemplate({ ...editingTemplate!, name: v })} placeholder="Nachfassen #1" />
                <SettingInput label="E-Mail Betreff" value={isAddingTemplate ? newTemplate.subject : editingTemplate!.subject} onChange={(v: string) => isAddingTemplate ? setNewTemplate({ ...newTemplate, subject: v }) : setEditingTemplate({ ...editingTemplate!, subject: v })} placeholder="Bezüglich meiner Bewerbung..." />
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
                <button onClick={() => { setIsAddingTemplate(false); setEditingTemplate(null); }} className="flex-1 py-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-gray-700 dark:text-gray-400 font-black text-[10px] tracking-widest rounded-2xl transition-all">Verwerfen</button>
                <button onClick={async () => {
                  setSaving(true);
                  if (isAddingTemplate) await addTemplate(newTemplate);
                  else if (editingTemplate) await updateTemplate(editingTemplate);
                  setSaving(false);
                  setIsAddingTemplate(false);
                  setEditingTemplate(null);
                }} className="flex-1 py-4 bg-blue-600 text-white font-black text-[10px] tracking-widest shadow-xl shadow-blue-500/20 rounded-2xl hover:scale-105 transition-all">
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

function Card({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) {
  return (
    <div className="glass rounded-[2.5rem] border border-black/5 dark:border-white/5 shadow-2xl overflow-hidden group/card hover:bg-white/5 transition-all duration-500">
      <div className="px-10 py-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-black/5 dark:bg-white/5">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-blue-600/10 text-blue-600 rounded-xl group-hover/card:bg-blue-600 group-hover/card:text-white transition-all shadow-sm">
            <Icon size={18} />
          </div>
          <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">{title}</h3>
        </div>
      </div>
      <div className="p-10">
        {children}
      </div>
    </div>
  );
}

function SettingInput({ label, value, onChange, placeholder, type = 'text', icon: Icon }: any) {
  return (
    <div className="space-y-3">
      <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">{label}</label>
      <div className="relative group/input">
        {Icon && (
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-blue-500 transition-colors">
            <Icon size={18} />
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={clsx(
            "w-full glass border border-gray-200 dark:border-white/10 rounded-2xl py-4 text-sm font-bold bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-600",
            Icon ? 'pl-14 pr-6' : 'px-6'
          )}
        />
      </div>
    </div>
  );
}

const Edit2 = (props: any) => (
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