// src/app/page.tsx
'use client';

import { useJobs } from '@/app/hooks/useJobs';
import { Briefcase, Clock, AlertCircle, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Job } from '@/app/lib/data';
import { useState } from 'react';
import OnboardingModal from '@/app/components/OnboardingModal';
import { Info } from 'lucide-react';

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
  const [showOnboarding, setShowOnboarding] = useState(false);

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
  const interviews = jobs.filter(j => j.status === 'Interview' || j.interviewDate).length;

  // Calculate follow-ups: jobs with 'Beworben' status older than 7 days without update
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const followups = jobs.filter(j =>
    j.status === 'Beworben' &&
    new Date(j.lastUpdate) < sevenDaysAgo
  ).length;

  // Calculate jobs added this week for each category
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const activeJobsThisWeek = jobs.filter(j =>
    ['Beworben', 'Interview'].includes(j.status) &&
    new Date(j.lastUpdate) >= oneWeekAgo
  ).length;

  const interviewsThisWeek = jobs.filter(j =>
    j.status === 'Interview' &&
    new Date(j.lastUpdate) >= oneWeekAgo
  ).length;

  const followupsThisWeek = jobs.filter(j =>
    j.status === 'Beworben' &&
    new Date(j.lastUpdate) < sevenDaysAgo &&
    new Date(j.lastUpdate) >= oneWeekAgo
  ).length;

  const upcomingInterviews = jobs.filter(j => j.status === 'Interview').sort((a, b) => new Date(a.date || '').getTime() - new Date(b.date || '').getTime()).slice(0, 3);

  const hasApplicationsThisWeek = activeJobsThisWeek > 0;
  const nextInterviewTomorrow = interviewsThisWeek > 0; // optional später datumsgesteuert
  const hasUrgentFollowups = followups > 0;
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-12"
    >
      {/* Top Stats */}

      {/* Onboarding Trigger */}
      <div className="flex justify-end mb-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowOnboarding(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all border border-white/10 group"
        >
          <div className="bg-white/20 p-1 rounded-full">
            <Info size={12} className="text-white" />
          </div>
          <span className="text-[10px] font-black tracking-widest">Über applyo</span>
        </motion.button>
      </div>

      <OnboardingModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <StatCard
          icon={Briefcase}
          label="Aktive Bewerbungen"
          value={activeJobs}
          color={hasApplicationsThisWeek ? 'green' : 'gray'}
          trend={`+${activeJobsThisWeek} diese Woche`}
          trendColor={hasApplicationsThisWeek ? 'green' : 'gray'}
          href="/applications?filter=active"
        />

        <StatCard
          icon={Calendar}
          label="Anstehende Termine"
          value={interviews}
          color={nextInterviewTomorrow ? 'orange' : 'gray'}
          trend="Nächster: Morgen"
          trendColor={nextInterviewTomorrow ? 'orange' : 'gray'}
          href="/applications?filter=upcoming"
        />

        <StatCard
          icon={AlertCircle}
          label="Follow-ups fällig"
          value={followups}
          color={hasUrgentFollowups ? 'red' : 'gray'}
          trend="Dringend erledigen"
          trendColor={hasUrgentFollowups ? 'red' : 'gray'}
          href="/applications?filter=followup"
        />

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Next Steps - Main Area */}
        <motion.div variants={itemVariants} className="lg:col-span-2 glass-card rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">📋 Nächste Schritte</h3>
              <p className="text-[10px] font-black text-gray-500 tracking-[0.2em] mt-2">Was jetzt zu tun ist</p>
            </div>
          </div>

          <div className="space-y-4">
            {(() => {
              // Priority logic for next steps
              const now = new Date();
              now.setHours(0, 0, 0, 0); // Normalize to midnight for accurate date comparison

              const threeDaysFromNow = new Date(now);
              threeDaysFromNow.setDate(now.getDate() + 3);

              const sevenDaysAgo = new Date(now);
              sevenDaysAgo.setDate(now.getDate() - 7);

              const nextSteps: Array<{
                job: Job;
                action: string;
                icon: string;
                timeContext: string;
                priority: number;
              }> = [];

              jobs.forEach(job => {
                // 1. Urgent interviews (within next 3 days) - Highest priority
                if (job.status === 'Interview' && job.interviewDate) {
                  const interviewDate = new Date(job.interviewDate);
                  interviewDate.setHours(0, 0, 0, 0);

                  if (interviewDate <= threeDaysFromNow && interviewDate >= now) {
                    const daysUntil = Math.ceil((interviewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    nextSteps.push({
                      job,
                      action: 'Interview vorbereiten',
                      icon: '⚡',
                      timeContext: daysUntil === 0 ? 'Heute!' : daysUntil === 1 ? 'Morgen' : `In ${daysUntil} Tagen`,
                      priority: 1
                    });
                  }
                }

                // 2. Overdue follow-ups (7+ days old in "Beworben")
                if (job.status === 'Beworben') {
                  const lastUpdateDate = new Date(job.lastUpdate);
                  lastUpdateDate.setHours(0, 0, 0, 0);

                  if (lastUpdateDate < sevenDaysAgo) {
                    const daysAgo = Math.floor((now.getTime() - lastUpdateDate.getTime()) / (1000 * 60 * 60 * 24));
                    nextSteps.push({
                      job,
                      action: 'Follow-up senden',
                      icon: '📧',
                      timeContext: `Vor ${daysAgo} Tagen beworben`,
                      priority: 2
                    });
                  }
                }

                // 3. Jobs "In Arbeit" (need to be submitted)
                if (job.status === 'In Arbeit') {
                  const lastUpdateDate = new Date(job.lastUpdate);
                  lastUpdateDate.setHours(0, 0, 0, 0);

                  const daysInProgress = Math.floor((now.getTime() - lastUpdateDate.getTime()) / (1000 * 60 * 60 * 24));
                  nextSteps.push({
                    job,
                    action: 'Bewerbung abschließen',
                    icon: '✍️',
                    timeContext: daysInProgress === 0 ? 'Heute begonnen' : `In Arbeit seit ${daysInProgress} ${daysInProgress === 1 ? 'Tag' : 'Tagen'}`,
                    priority: 3
                  });
                }

                // 4. Oldest "Merkliste" items (to keep momentum)
                if (job.status === 'Merkliste') {
                  const lastUpdateDate = new Date(job.lastUpdate);
                  lastUpdateDate.setHours(0, 0, 0, 0);

                  const daysOld = Math.floor((now.getTime() - lastUpdateDate.getTime()) / (1000 * 60 * 60 * 24));
                  if (daysOld > 3) {
                    nextSteps.push({
                      job,
                      action: 'Bewerbung starten',
                      icon: '💾',
                      timeContext: `Gespeichert vor ${daysOld} Tagen`,
                      priority: 4
                    });
                  }
                }
              });

              // Sort by priority first, then by lastUpdate (newest first) for consistent ordering
              const topSteps = nextSteps
                .sort((a, b) => {
                  if (a.priority !== b.priority) {
                    return a.priority - b.priority;
                  }
                  // If priority is same, show most recently updated first
                  return new Date(b.job.lastUpdate).getTime() - new Date(a.job.lastUpdate).getTime();
                })
                .slice(0, 3);

              return topSteps.length > 0 ? topSteps.map((step, index) => (
                <Link
                  key={step.job.id}
                  href="/applications"
                  className="block"
                >
                  <div className="p-6 glass border border-white/5 rounded-[2rem] hover:bg-white/5 hover:border-blue-500/30 transition-all group/step cursor-pointer">
                    <div className="flex items-start gap-5">
                      <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center text-2xl group-hover/step:bg-blue-600 group-hover/step:scale-110 transition-all shadow-sm">
                        {step.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-blue-500 uppercase tracking-tight mb-1">{step.action}</p>
                        <p className="font-black text-base text-gray-900 dark:text-white uppercase tracking-tight truncate">{step.job.company}</p>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5 truncate">{step.job.title}</p>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">{step.timeContext}</p>
                      </div>
                      <ArrowRight className="text-gray-400 group-hover/step:text-blue-500 group-hover/step:translate-x-1 transition-all shrink-0" size={20} />
                    </div>
                  </div>
                </Link>
              )) : (
                <div className="h-64 bg-gradient-to-br from-blue-600/10 to-transparent rounded-[2rem] border border-white/5 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.2),transparent)]"></div>
                  <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-[10px] relative z-10">🎉 Alles erledigt!</p>
                </div>
              );
            })()}
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
                    {job.interviewDate ? new Date(job.interviewDate).getDate() : job.date ? new Date(job.date).getDate() : '?'}
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
        <div className={`p-4 rounded-2xl ${colors[color] || colors.gray} group-hover:scale-110 transition-transform duration-500`}>
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
          <span className={`text-[9px] font-black uppercase tracking-widest ${trendColor === 'green' ? 'text-green-500' : trendColor === 'orange' ? 'text-orange-500' : trendColor === 'red' ? 'text-red-500' : 'text-gray-500'}`}>
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