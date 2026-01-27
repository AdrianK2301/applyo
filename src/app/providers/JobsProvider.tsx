// src/app/providers/JobsProvider.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Job, jobs as initialMockData } from '@/app/lib/data';

interface JobsContextType {
    jobs: Job[];
    addJob: (newJob: Job) => void;
    updateJob: (updatedJob: Job) => void;
    deleteJob: (id: string) => void;
    archiveJob: (id: string) => void;
    restoreJob: (id: string) => void;
    importJobs: (jobs: Job[]) => void;
    isLoaded: boolean;
}

export const JobsContext = createContext<JobsContextType | undefined>(undefined);

export function JobsProvider({ children }: { children: ReactNode }) {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const savedJobs = localStorage.getItem('applyo_jobs');
        if (savedJobs) {
            try {
                setJobs(JSON.parse(savedJobs));
            } catch (e) {
                console.error('Failed to parse saved jobs', e);
                setJobs(initialMockData);
            }
        } else {
            setJobs(initialMockData);
        }
        setIsLoaded(true);
    }, []);

    const save = (data: Job[]) => {
        setJobs(data);
        localStorage.setItem('applyo_jobs', JSON.stringify(data));
    };

    const addJob = (newJob: Job) => {
        const updatedJobs = [newJob, ...jobs];
        save(updatedJobs);
    };

    const updateJob = (updatedJob: Job) => {
        const updatedJobs = jobs.map((job) =>
            job.id === updatedJob.id ? updatedJob : job
        );
        save(updatedJobs);
    };

    const deleteJob = (id: string) => {
        const updatedJobs = jobs.filter(job => job.id !== id);
        save(updatedJobs);
    };

    const archiveJob = (id: string) => {
        const updatedJobs = jobs.map(job =>
            job.id === id ? { ...job, status: 'Archiv' as const, lastUpdate: new Date().toISOString().split('T')[0] } : job
        );
        save(updatedJobs);
    };

    const restoreJob = (id: string) => {
        const updatedJobs = jobs.map(job =>
            job.id === id ? { ...job, status: 'Merkliste' as const, lastUpdate: new Date().toISOString().split('T')[0] } : job
        );
        save(updatedJobs);
    };

    const importJobs = (newJobs: Job[]) => {
        save(newJobs);
    };

    return (
        <JobsContext.Provider value={{ jobs, addJob, updateJob, deleteJob, archiveJob, restoreJob, importJobs, isLoaded }}>
            {children}
        </JobsContext.Provider>
    );
}
