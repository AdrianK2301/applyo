// src/app/page.tsx
'use client';

import { useJobs } from '@/app/hooks/useJobs';
import { Briefcase, Clock, AlertCircle, Calendar } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Job } from '@/app/lib/data';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100, damping: 20 } as const
  }
};

export default function Dashboard() {
  const { jobs, isLoaded } = useJobs();

  if (!isLoaded) return (
    <div className="flex items-center justify-center p-20 text-gray-400 font-medium font-mono text-sm tracking-widest uppercase">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-6 h-6 border-2 border-blue-600/20 border-t-blue-600 rounded-full mr-4"
      />
      Dashboard wird geladen...
    </div>
  );

  const activeJobs = jobs.filter(j => ['Beworben', 'Interview'].includes(j.status)).length;
  const interviews = jobs.filter(j => j.status === 'Interview').length;

  // Calculate follow-ups: jobs with 'Beworben' status older than 7 days without update
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const followups = jobs.filter(j =>
    j.status === 'Beworben' &&
    new Date(j.lastUpdate) < sevenDaysAgo
  ).length;

  const upcomingInterviews = jobs.filter(j => j.status === 'Interview').sort((a, b) => new Date(a.date || '').getTime() - new Date(b.date || '').getTime()).slice(0, 3);

  const hasApplicationsThisWeek = activeJobs > 0;
  const nextInterviewTomorrow = interviews > 0; // optional später datumsgesteuert
  const hasUrgentFollowups = followups > 0;
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-12"
    >
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <StatCard
          icon={Briefcase}
          label="Aktive Bewerbungen"
          value={activeJobs}
          color={hasApplicationsThisWeek ? 'green' : 'gray'}
          trend="+ diese Woche"
          trendColor={hasApplicationsThisWeek ? 'green' : 'gray'}
          href="/applications"
        />

        <StatCard
          icon={Calendar}
          label="Anstehende Termine"
          value={interviews}
          color={nextInterviewTomorrow ? 'orange' : 'gray'}
          trend="Nächster: Morgen"
          trendColor={nextInterviewTomorrow ? 'orange' : 'gray'}
          href="/calendar"
        />

        <StatCard
          icon={AlertCircle}
          label="Follow-ups fällig"
          value={followups}
          color={hasUrgentFollowups ? 'red' : 'gray'}
          trend="Dringend erledigen"
          trendColor={hasUrgentFollowups ? 'red' : 'gray'}
          href="/applications?status=Beworben"
        />

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Chart / Area */}
        <motion.div variants={itemVariants} className="lg:col-span-2 glass-card rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase">Status Quo</h3>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mt-2">Bewerbungs-Performance</p>
            </div>
            <div className="flex gap-2">
              {['Woche', 'Monat'].map(t => (
                <button key={t} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-colors">{t}</button>
              ))}
            </div>
          </div>
          <div className="h-64 bg-gradient-to-br from-blue-600/10 to-transparent rounded-[2rem] border border-white/5 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.2),transparent)]"></div>
            <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-[10px]">Statistiken werden generiert...</p>
          </div>
        </motion.div>

        {/* Action Sidebar */}
        <div className="space-y-8">
          <motion.div variants={itemVariants} className="glass rounded-[2.5rem] p-8 border border-white/10 shadow-xl">
            <h3 className="text-sm font-black text-gray-900 dark:text-white mb-6 tracking-widest">Nächste Termine</h3>
            <div className="space-y-4">
              {upcomingInterviews.length > 0 ? upcomingInterviews.map((job) => (
                <div key={job.id} className="flex items-center gap-4 group cursor-pointer p-4 hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/5">
                  <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm font-black">
                    {job.date ? new Date(job.date).getDate() : '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-[11px] text-gray-900 dark:text-white truncate">{job.company}</p>
                    <p className="text-[10px] text-gray-500 font-bold truncate">{job.title}</p>
                  </div>
                </div>
              )) : (
                <p className="text-xs text-gray-500 italic p-4">Keine anstehenden Termine.</p>
              )}
            </div>
            <Link href="/calendar" className="block w-full text-center py-4 mt-6 bg-white/5 hover:bg-white/10 text-[10px] font-black tracking-widest text-blue-500 rounded-2xl border border-white/5 transition-all">
              Zum Kalender
            </Link>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 shadow-2xl shadow-blue-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
            <h3 className="text-white font-black text-lg mb-2 relative z-10">Bereit für den nächsten Schritt?</h3>
            <p className="text-blue-100 text-xs mb-6 font-medium relative z-10 opacity-80">Trage deine neue Bewerbung ein und behalte den Überblick.</p>
            <Link href="/add" className="inline-block bg-white text-blue-600 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all relative z-10">
              Job hinzufügen
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ icon: Icon, label, value, color, trend, trendColor, href }: any) {

  const colors: any = {
    green: 'text-green-500 bg-green-500/10 shadow-green-500/10',
    orange: 'text-orange-500 bg-orange-500/10 shadow-orange-500/10',
    red: 'text-red-500 bg-red-500/10 shadow-red-500/10',
    gray: 'text-gray-400 bg-gray-400/10 shadow-gray-400/10',
  };


  const content = (
    <motion.div variants={itemVariants} className="glass shadow-xl rounded-[2.5rem] p-8 border border-white/10 hover:border-blue-500/30 transition-all group overflow-hidden relative h-full">
      <div className="flex justify-between items-start mb-6">
        <div className={`p-4 rounded-2xl ${colors[color]} group-hover:scale-110 transition-transform duration-500`}>
          <Icon size={24} />
        </div>
        <div className="text-[10px] font-black text-gray-400 tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
          Ansehen
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{label}</p>
        <div className="flex items-baseline gap-2">
          <h4 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">{value}</h4>
          <span className={`text-[9px] font-black uppercase tracking-widest text-${trendColor}-500`}>
            {trend}
          </span>
        </div>
      </div>
    </motion.div>
  );

  return href ? (
    <Link href={href} className="block group/card h-full">
      {content}
    </Link>
  ) : content;
}