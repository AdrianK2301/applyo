// src/app/calendar/page.tsx
import { jobs } from '@/app/lib/data';
import { Calendar as CalendarIcon, Clock, MapPin, ExternalLink } from 'lucide-react';

export default function CalendarPage() {
  // Wir filtern nur Jobs, die ein Datum haben (Interviews oder Fristen)
  const events = jobs
    .filter(job => job.date)
    .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());

  // Hilfsfunktion für schönes Datumsformat
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('de-DE', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    }).format(date);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Kalender & Termine</h1>
        <p className="text-gray-500">Deine anstehenden Interviews und Fristen im Überblick.</p>
      </div>

      <div className="space-y-6">
        {events.length > 0 ? (
          events.map((job) => (
            <div key={job.id} className="flex gap-4">
              {/* Datums-Box */}
              <div className="flex-shrink-0 w-24 text-center pt-2">
                <span className="block text-sm font-bold text-blue-600 uppercase tracking-wide">
                  {new Date(job.date!).toLocaleDateString('de-DE', { month: 'short' })}
                </span>
                <span className="block text-3xl font-light text-gray-900">
                  {new Date(job.date!).getDate()}
                </span>
              </div>

              {/* Event Karte */}
              <div className="flex-1 bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                {/* Farbiger Streifen links je nach Status */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                  job.status === 'Interview' ? 'bg-yellow-400' : 'bg-blue-400'
                }`}></div>

                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        job.status === 'Interview' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {job.status === 'Interview' ? 'Interview' : 'Frist / Follow-up'}
                      </span>
                      <span className="text-sm text-gray-400 flex items-center gap-1">
                        <Clock size={14} /> 10:00 Uhr
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900">{job.title}</h3>
                    <div className="text-gray-600 font-medium mb-2">{job.company}</div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPin size={14} />
                        {job.location}
                      </div>
                    </div>
                  </div>

                  {job.status === 'Interview' && (
                    <button className="text-sm border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                      <ExternalLink size={14} />
                      Vorbereitung
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <CalendarIcon className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">Keine Termine</h3>
            <p className="text-gray-500">Du hast aktuell keine Interviews oder Fristen eingetragen.</p>
          </div>
        )}
      </div>
    </div>
  );
}