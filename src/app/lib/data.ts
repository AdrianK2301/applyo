// src/app/lib/data.ts

export type Status = 'Merkliste' | 'In Arbeit' | 'Beworben' | 'Interview' | 'Angebot' | 'Absage' | 'Archiv';
export type Priority = 'High' | 'Medium' | 'Low';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  status: Status;
  priority: 'High' | 'Medium' | 'Low';
  lastUpdate: string;
  nextStep?: string;
  date?: string; // Datum für Kalender-Events (z.B. Interviewtermin)
  notes?: string;
  prepTasks?: { text: string; completed: boolean }[];
  description?: string;
  summary?: string;
  requirements?: string[];
  benefits?: string[];
  skills?: string[];
  contactPerson?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  isDefault?: boolean;
}

export const jobs: Job[] = [
  {
    id: '1',
    title: 'Junior UX Designer',
    company: 'TechCorp GmbH',
    location: 'Berlin (Remote)',
    status: 'Beworben',
    priority: 'High',
    lastUpdate: '2025-10-24',
    nextStep: 'Seit 14 Tagen keine Antwort. Follow-up senden?',
    date: '2025-11-10', // Fiktive Frist für Follow-up
  },
  {
    id: '2',
    title: 'Frontend Developer',
    company: 'Startup XY',
    location: 'München',
    status: 'Interview',
    priority: 'High',
    lastUpdate: '2026-01-20',
    nextStep: 'Interview Vorbereitung',
    date: '2026-01-30', // Das Interview-Datum
  },
  {
    id: '3',
    title: 'Product Manager Trainee',
    company: 'Big Bank AG',
    location: 'Frankfurt',
    status: 'Merkliste',
    priority: 'Low',
    lastUpdate: '2025-12-20',
  },
  // Ein neuer Eintrag für den Kalender
  {
    id: '4',
    title: 'Marketing Manager',
    company: 'Creative Studio',
    location: 'Hamburg',
    status: 'Interview',
    priority: 'Medium',
    lastUpdate: '2026-01-25',
    nextStep: 'Kennenlerngespräch',
    date: '2026-01-28',
  }
];