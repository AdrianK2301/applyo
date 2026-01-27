// src/app/settings/page.tsx
import { Bell, LogOut } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Einstellungen</h1>
        <p className="text-gray-500 dark:text-gray-400">Verwalte dein Profil und deine App-Präferenzen.</p>
      </div>

      {/* Profil Sektion */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center gap-4">
          <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xl">
            J
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">John Doe</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Bachelor-Absolvent • Jobsuchend</p>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Anzeigename</label>
                    <input type="text" defaultValue="John Doe" className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-colors" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fokus Jobtitel</label>
                    <input type="text" defaultValue="Junior UX Designer" className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-colors" />
                </div>
            </div>
        </div>
      </div>

      {/* Automatisierung & Benachrichtigungen */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="p-4 bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex items-center gap-2 transition-colors">
            <Bell size={18} className="text-gray-500 dark:text-gray-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Automatisierung & Erinnerungen</h3>
        </div>
        <div className="p-6 space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <p className="font-medium text-gray-900 dark:text-white">Automatische Follow-up Erinnerung</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Erinnere mich 14 Tage nach Status "Beworben".</p>
                </div>
                {/* Checkbox (Toggle) */}
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
            </div>
            
            <div className="flex items-start justify-between">
                <div>
                    <p className="font-medium text-gray-900 dark:text-white">Interview Vorbereitungs-Checkliste</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Zeige automatisch To-Dos, wenn ein Interview ansteht.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
            </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
          <button className="flex items-center gap-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium transition-colors">
              <LogOut size={16} />
              Ausloggen
          </button>
      </div>
    </div>
  );
}