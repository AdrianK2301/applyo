// src/app/settings/page.tsx
import { User, Bell, Shield, LogOut } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Einstellungen</h1>
        <p className="text-gray-500">Verwalte dein Profil und deine App-Präferenzen.</p>
      </div>

      {/* Profil Sektion */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-4">
          <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
            J
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">John Doe</h2>
            <p className="text-sm text-gray-500">Bachelor-Absolvent • Jobsuchend</p>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Anzeigename</label>
                    <input type="text" defaultValue="John Doe" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fokus Jobtitel</label>
                    <input type="text" defaultValue="Junior UX Designer" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
            </div>
        </div>
      </div>

      {/* Automatisierung & Benachrichtigungen [cite: 10, 66] */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
            <Bell size={18} className="text-gray-500" />
            <h3 className="font-semibold text-gray-900">Automatisierung & Erinnerungen</h3>
        </div>
        <div className="p-6 space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <p className="font-medium text-gray-900">Automatische Follow-up Erinnerung</p>
                    <p className="text-sm text-gray-500">Erinnere mich 14 Tage nach Status "Beworben".</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
            </div>
            
            <div className="flex items-start justify-between">
                <div>
                    <p className="font-medium text-gray-900">Interview Vorbereitungs-Checkliste</p>
                    <p className="text-sm text-gray-500">Zeige automatisch To-Dos, wenn ein Interview ansteht.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
            </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
          <button className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium">
              <LogOut size={16} />
              Ausloggen
          </button>
      </div>
    </div>
  );
}