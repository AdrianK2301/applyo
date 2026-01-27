// src/app/page.tsx
'use client';

import { useJobs } from '@/app/hooks/useJobs';
import { Briefcase, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const { jobs, isLoaded } = useJobs();

  if (!isLoaded) return <div className="p-8 text-gray-500 dark:text-gray-400">Lade Dashboard...</div>;

  const activeJobs = jobs.filter(j => ['Beworben', 'Interview'].includes(j.status)).length;
  const interviews = jobs.filter(j => j.status === 'Interview').length;
  const waiting = jobs.filter(j => j.status === 'Beworben').length;

  const priorityJobs = jobs.filter(j => j.priority === 'High').slice(0, 3);

  // Intelligent Action Center Logic
  const actionJobs = jobs.filter(j => {
    const lastUpdateDate = new Date(j.lastUpdate);
    const today = new Date();
    const diffDays = Math.ceil((today.getTime() - lastUpdateDate.getTime()) / (1000 * 3600 * 24));

    // Condition 1: Interview status (always action)
    if (j.status === 'Interview') return true;

    // Condition 2: Applied but no response for > 7 days
    if (j.status === 'Beworben' && diffDays > 7) return true;

    // Condition 3: Has a date (interview/deadline) within the next 3 days
    if (j.date) {
      const eventDate = new Date(j.date);
      const diffEvent = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
      if (diffEvent >= 0 && diffEvent <= 3) return true;
    }

    return j.nextStep;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Laufende Bewerbungen" value={activeJobs} icon={Briefcase} color="blue" href="/applications?filter=Aktiv" />
        <StatCard title="Offene Interviews" value={interviews} icon={Clock} color="yellow" href="/applications?status=Interview" />
        <StatCard title="Warte auf Rückmeldung" value={waiting} icon={AlertCircle} color="gray" href="/applications?status=Beworben" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Action Center */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Action Center</h3>
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 transition-colors">
            {actionJobs.length > 0 ? (
              actionJobs.map(job => (
                <div key={job.id} className="flex items-start gap-4 mb-4 last:mb-0 pb-4 border-b last:border-0 border-gray-100 dark:border-slate-800">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-full">
                    <AlertCircle size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">{job.company} - {job.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {job.status === 'Interview' ? (
                        <span className="text-blue-600 dark:text-blue-400 font-medium">Interview steht an! Vorbereiten.</span>
                      ) : (new Date().getTime() - new Date(job.lastUpdate).getTime()) / (1000 * 3600 * 24) > 7 ? (
                        <span className="text-orange-600 dark:text-orange-400 font-medium font-bold">Kein Update seit {Math.floor((new Date().getTime() - new Date(job.lastUpdate).getTime()) / (1000 * 3600 * 24))} Tagen. Nachhaken?</span>
                      ) : job.nextStep || 'Nächste Schritte planen.'}
                    </p>
                  </div>
                  <Link href="/applications" className="text-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                    Zum Job
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Alles erledigt! Keine offenen Tasks.</p>
            )}
          </div>
        </div>

        {/* Priority Focus */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">High Priority</h3>
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden transition-colors">
            {priorityJobs.length > 0 ? priorityJobs.map(job => (
              <div key={job.id} className="p-4 border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{job.title}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{job.company}</div>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400">
                    {job.status}
                  </span>
                </div>
              </div>
            )) : <div className="p-4 text-gray-500 dark:text-gray-400 text-sm">Keine Jobs mit hoher Prio.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, href }: any) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
    gray: 'bg-gray-50 text-gray-600 dark:bg-slate-800 dark:text-slate-400',
  };

  return (
    <Link href={href} className="group cursor-pointer">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 flex items-center transition-all hover:border-blue-300 dark:hover:border-blue-900 hover:shadow-md">
        <div className={`p-3 rounded-lg ${colors[color as keyof typeof colors]} mr-4 transition-transform group-hover:scale-110`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </Link>
  );
}