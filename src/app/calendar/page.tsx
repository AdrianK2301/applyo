// src/app/calendar/page.tsx
'use client';

import { useState } from 'react';
import { useJobs } from '@/app/hooks/useJobs';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin } from 'lucide-react';
import { clsx } from 'clsx';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function CalendarPage() {
  const { jobs, isLoaded } = useJobs();
  const [currentDate, setCurrentDate] = useState(new Date());

  if (!isLoaded) return (
    <div className="flex items-center justify-center p-20 text-gray-400 font-medium font-mono text-sm tracking-widest uppercase">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-6 h-6 border-2 border-blue-600/20 border-t-blue-600 rounded-full mr-4"
      />
      Kalender wird geladen...
    </div>
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startingDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonthDays = new Date(year, month, 0).getDate();
  const days = [];

  for (let i = startingDay - 1; i >= 0; i--) {
    days.push({
      day: prevMonthDays - i,
      month: month - 1,
      year: month === 0 ? year - 1 : year,
      isCurrentMonth: false,
    });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      day: i,
      month: month,
      year: year,
      isCurrentMonth: true,
    });
  }

  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      day: i,
      month: month + 1,
      year: month === 11 ? year + 1 : year,
      isCurrentMonth: false,
    });
  }

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthNames = [
    "Januar", "Februar", "März", "April", "Mai", "Juni",
    "Juli", "August", "September", "Oktober", "November", "Dezember"
  ];

  const dayNames = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

  const getDayJobs = (d: number, m: number, y: number) => {
    return jobs.filter(job => {
      if (!job.date) return false;
      const jobDate = new Date(job.date);
      return jobDate.getDate() === d && jobDate.getMonth() === m && jobDate.getFullYear() === y;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[1600px] mx-auto h-[calc(100vh-12rem)] flex flex-col"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
        <div className="flex items-center gap-6">
          <div className="p-4 glass-card rounded-2xl text-blue-500 shadow-xl shadow-blue-500/10 active:scale-95 transition-all text-blue-500">
            <CalendarIcon size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-2">{monthNames[month]} {year}</h1>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Application Zeitplan & Termine</p>
          </div>
        </div>

        <div className="flex items-center glass p-1.5 rounded-2xl shadow-lg border border-white/10 shrink-0">
          <button onClick={handlePrevMonth} className="p-3 hover:bg-white/10 rounded-xl text-gray-500 hover:text-white transition-all">
            <ChevronLeft size={24} />
          </button>
          <button onClick={() => setCurrentDate(new Date())} className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all bg-white/5 mx-1 rounded-xl">
            Heute
          </button>
          <button onClick={handleNextMonth} className="p-3 hover:bg-white/10 rounded-xl text-gray-500 hover:text-white transition-all">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 glass-card rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border border-white/10">
        <div className="grid grid-cols-7 bg-white/5 backdrop-blur-md border-b border-white/5">
          {dayNames.map(day => (
            <div key={day} className="py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-r last:border-r-0 border-white/5">
              {day}
            </div>
          ))}
        </div>

        <div className="flex-1 grid grid-cols-7 auto-rows-fr overflow-y-auto custom-scrollbar">
          {days.map((dateObj, idx) => {
            const dayJobs = getDayJobs(dateObj.day, dateObj.month, dateObj.year);
            const isToday = new Date().getDate() === dateObj.day &&
              new Date().getMonth() === dateObj.month &&
              new Date().getFullYear() === dateObj.year;

            return (
              <div
                key={idx}
                className={clsx(
                  "min-h-[140px] p-4 border-r border-b border-white/5 flex flex-col gap-2 transition-all duration-300",
                  !dateObj.isCurrentMonth && "bg-black/10 dark:bg-black/20 opacity-30",
                  dateObj.isCurrentMonth && "hover:bg-blue-600/5 cursor-default group"
                )}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className={clsx(
                    "text-xs font-black w-8 h-8 flex items-center justify-center rounded-xl transition-all shadow-sm",
                    isToday ? "bg-blue-600 text-white shadow-blue-500/30 scale-110" : "text-gray-500 dark:text-gray-400 group-hover:text-blue-500"
                  )}>
                    {dateObj.day}
                  </span>
                  {dayJobs.length > 0 && dateObj.isCurrentMonth && (
                    <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest px-2 py-1 bg-blue-500/10 rounded-lg">
                      {dayJobs.length} Events
                    </span>
                  )}
                </div>

                <div className="flex-1 space-y-2 overflow-y-auto zero-scrollbar">
                  <AnimatePresence>
                    {dayJobs.map(job => (
                      <motion.div
                        key={job.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="group/item"
                      >
                        <Link
                          href={`/applications?status=${job.status}`}
                          className={clsx(
                            "block p-3 rounded-2xl text-[10px] font-black tracking-tight leading-tight transition-all active:scale-95 border",
                            job.status === 'Interview'
                              ? "bg-blue-600/10 text-blue-600 border-blue-500/20 hover:bg-blue-600/20"
                              : job.status === 'Angebot'
                                ? "bg-green-600/10 text-green-600 border-green-500/20 hover:bg-green-600/20"
                                : "bg-white/5 text-gray-400 border-white/5 hover:border-white/10"
                          )}
                        >
                          <div className="truncate mb-1">{job.company}</div>
                          <div className="flex items-center gap-1 text-[8px] opacity-70">
                            <MapPin size={8} /> {job.location || 'Remote'}
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}