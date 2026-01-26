import { jobs } from './lib/data';
import { ArrowRight, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

export default function Dashboard() {
  // KPIs berechnen [cite: 24-27]
  const activeJobs = jobs.filter(j => j.status === 'Beworben').length;
  const interviews = jobs.filter(j => j.status === 'Interview').length;
  const waiting = jobs.filter(j => j.status === 'Beworben').length; // Vereinfacht

  const priorityJobs = jobs.filter(j => j.priority === 'High').slice(0, 3); // Top 3 

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      {/* 1. Quick Stats (KPIs)  */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Laufende Bewerbungen" value={activeJobs} icon={BriefcaseIcon} color="blue" />
        <StatCard title="Offene Interviews" value={interviews} icon={CalendarIcon} color="yellow" />
        <StatCard title="Warte auf Rückmeldung" value={waiting} icon={ClockIcon} color="gray" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 2. Action Center ("Next Steps")  */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Action Center</h3>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {jobs.filter(j => j.nextStep).map(job => (
               <div key={job.id} className="flex items-start gap-4 mb-4 last:mb-0 pb-4 border-b last:border-0 border-gray-100">
                  <div className="p-2 bg-orange-100 text-orange-600 rounded-full">
                    <AlertCircle size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{job.company} - {job.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{job.nextStep}</p> {/* [cite: 31] */}
                  </div>
                  <button className="text-sm bg-white border border-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-50">
                    Erledigen
                  </button>
               </div>
            ))}
            {jobs.filter(j => j.nextStep).length === 0 && (
              <p className="text-gray-500">Alles erledigt! Keine offenen Tasks.</p>
            )}
          </div>
        </div>

        {/* 3. Priority Focus  */}
        <div className="space-y-4">
           <h3 className="text-lg font-semibold text-gray-900">High Priority</h3>
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {priorityJobs.map(job => (
                <div key={job.id} className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-gray-900">{job.title}</div>
                      <div className="text-sm text-gray-500">{job.company}</div>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                      {job.status}
                    </span>
                  </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}

// Hilfskomponenten für Icons und Stats
function BriefcaseIcon({ className }: { className?: string }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>; }
function CalendarIcon({ className }: { className?: string }) { return <Clock className={className} />; }
function ClockIcon({ className }: { className?: string }) { return <AlertCircle className={className} />; }

function StatCard({ title, value, icon: Icon, color }: any) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    yellow: 'bg-yellow-50 text-yellow-600', // [cite: 73]
    gray: 'bg-gray-50 text-gray-600',
  };
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center">
      <div className={`p-3 rounded-lg ${colors[color as keyof typeof colors]} mr-4`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}