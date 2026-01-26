// src/app/lib/data.ts

export type Status = 'Merkliste' | 'In Vorbereitung' | 'Beworben' | 'Interview' | 'Angebot' | 'Absage';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  status: Status;
  priority: 'High' | 'Medium' | 'Low';
  lastUpdate: string;
  nextStep?: string;
  date?: string; // NEU: Datum für Kalender-Events (z.B. Interviewtermin)
}

export const jobs: Job[] = [
  {
    id: '1',
    title: 'Junior UX Designer',
    company: 'TechCorp GmbH',
    location: 'Berlin (Remote)',
    status: 'Beworben',
    priority: 'High',
    lastUpdate: '2023-10-24',
    nextStep: 'Seit 14 Tagen keine Antwort. Follow-up senden?',
    date: '2023-11-10', // Fiktive Frist für Follow-up
  },
  {
    id: '2',
    title: 'Frontend Developer',
    company: 'Startup XY',
    location: 'München',
    status: 'Interview',
    priority: 'High',
    lastUpdate: '2023-10-26',
    nextStep: 'Interview Vorbereitung',
    date: '2023-10-30', // Das Interview-Datum
  },
  {
    id: '3',
    title: 'Product Manager Trainee',
    company: 'Big Bank AG',
    location: 'Frankfurt',
    status: 'Merkliste',
    priority: 'Low',
    lastUpdate: '2023-10-20',
  },
  // Ein neuer Eintrag für den Kalender
  {
    id: '4',
    title: 'Marketing Manager',
    company: 'Creative Studio',
    location: 'Hamburg',
    status: 'Interview',
    priority: 'Medium',
    lastUpdate: '2023-10-27',
    nextStep: 'Kennenlerngespräch',
    date: '2023-11-02',
  }
];