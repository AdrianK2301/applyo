// src/app/providers/JobsProvider.tsx
'use client';

import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Job, Status, EmailTemplate } from '@/app/lib/data';
import { createClient } from '@/app/lib/supabase/client';
import { User } from '@supabase/supabase-js';

interface JobsContextType {
    jobs: Job[];
    templates: EmailTemplate[];
    addJob: (newJob: Omit<Job, 'id' | 'lastUpdate'>) => Promise<void>;
    updateJob: (updatedJob: Job) => Promise<void>;
    deleteJob: (id: string) => Promise<void>;
    archiveJob: (id: string) => Promise<void>;
    restoreJob: (id: string) => Promise<void>;
    importJobs: (jobs: Job[]) => void;
    addTemplate: (template: Omit<EmailTemplate, 'id'>) => Promise<void>;
    updateTemplate: (template: EmailTemplate) => Promise<void>;
    deleteTemplate: (id: string) => Promise<void>;
    fetchJobs: () => Promise<void>;
    fetchTemplates: () => Promise<void>;
    isLoaded: boolean;
    user: User | null;
}

export const JobsContext = createContext<JobsContextType | undefined>(undefined);

export function JobsProvider({ children }: { children: ReactNode }) {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const supabase = createClient();

    const fetchJobs = useCallback(async () => {
        const { data, error } = await supabase
            .from('jobs')
            .select('*')
            .order('last_update', { ascending: false });

        if (error) {
            console.error('Error fetching jobs:', error);
        } else {
            const mappedJobs: Job[] = data.map(item => {
                let prepTasks = item.prep_tasks || [];
                // If tasks are strings (old format), convert them
                if (prepTasks.length > 0 && typeof prepTasks[0] === 'string') {
                    prepTasks = prepTasks.map((t: string) => ({ text: t, completed: false }));
                }
                // If no tasks, provide defaults
                if (prepTasks.length === 0) {
                    prepTasks = [
                        { text: 'Firma recherchiert', completed: false },
                        { text: 'Kontaktperson kontaktiert', completed: false },
                        { text: 'Fragen vorbereitet', completed: false },
                        { text: 'Lebenslauf abgeglichen', completed: false }
                    ];
                }

                return {
                    id: item.id,
                    title: item.title,
                    company: item.company,
                    location: item.location,
                    status: item.status as Status,
                    priority: item.priority as 'High' | 'Medium' | 'Low',
                    lastUpdate: item.last_update,
                    nextStep: item.next_step,
                    date: item.date,
                    notes: item.notes,
                    prepTasks: prepTasks,
                    contactPerson: item.contact_person
                };
            });
            setJobs(mappedJobs);
        }
        setIsLoaded(true);
    }, [supabase]);

    const fetchTemplates = useCallback(async () => {
        const { data, error } = await supabase
            .from('email_templates')
            .select('*')
            .order('is_default', { ascending: false });

        if (error) {
            console.error('Error fetching templates:', error);
        } else if (data) {
            setTemplates(data.map(t => ({
                id: t.id,
                name: t.name,
                subject: t.subject,
                body: (t.body as string).replace(/\\n/g, '\n'),
                isDefault: t.is_default
            })));
        }
    }, [supabase]);

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchJobs();
                fetchTemplates();
            } else {
                setJobs([]);
                setTemplates([]);
                setIsLoaded(true);
            }
        });

        return () => subscription.unsubscribe();
    }, [supabase.auth, fetchJobs, fetchTemplates]);

    const addJob = async (newJob: Omit<Job, 'id' | 'lastUpdate'>) => {
        if (!user) return;

        const { data, error } = await supabase
            .from('jobs')
            .insert([{
                user_id: user.id,
                title: newJob.title,
                company: newJob.company,
                location: newJob.location,
                status: newJob.status,
                priority: newJob.priority,
                next_step: newJob.nextStep,
                date: newJob.date,
                notes: newJob.notes,
                prep_tasks: newJob.prepTasks,
                contact_person: newJob.contactPerson,
                last_update: new Date().toISOString().split('T')[0]
            }])
            .select()
            .single();

        if (error) {
            console.error('Error adding job:', error);
        } else if (data) {
            fetchJobs();
        }
    };

    const updateJob = async (updatedJob: Job) => {
        if (!user) return;

        const { error } = await supabase
            .from('jobs')
            .update({
                title: updatedJob.title,
                company: updatedJob.company,
                location: updatedJob.location,
                status: updatedJob.status,
                priority: updatedJob.priority,
                next_step: updatedJob.nextStep,
                date: updatedJob.date,
                notes: updatedJob.notes,
                prep_tasks: updatedJob.prepTasks,
                contact_person: updatedJob.contactPerson,
                last_update: new Date().toISOString().split('T')[0]
            })
            .eq('id', updatedJob.id);

        if (error) {
            console.error('Error updating job:', error);
        } else {
            fetchJobs();
        }
    };

    const deleteJob = async (id: string) => {
        if (!user) return;

        const { error } = await supabase
            .from('jobs')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting job:', error);
        } else {
            fetchJobs();
        }
    };

    const archiveJob = async (id: string) => {
        if (!user) return;

        const { error } = await supabase
            .from('jobs')
            .update({
                status: 'Archiv',
                last_update: new Date().toISOString().split('T')[0]
            })
            .eq('id', id);

        if (error) {
            console.error('Error archiving job:', error);
        } else {
            fetchJobs();
        }
    };

    const restoreJob = async (id: string) => {
        if (!user) return;

        const { error } = await supabase
            .from('jobs')
            .update({
                status: 'Merkliste',
                last_update: new Date().toISOString().split('T')[0]
            })
            .eq('id', id);

        if (error) {
            console.error('Error restoring job:', error);
        } else {
            fetchJobs();
        }
    };

    const addTemplate = async (template: Omit<EmailTemplate, 'id'>) => {
        if (!user) return;
        const { error } = await supabase
            .from('email_templates')
            .insert([{
                name: template.name,
                subject: template.subject,
                body: template.body,
                is_default: template.isDefault,
                user_id: user.id
            }]);
        if (error) console.error('Error adding template:', error);
        else fetchTemplates();
    };

    const updateTemplate = async (template: EmailTemplate) => {
        if (!user) return;
        const { error } = await supabase
            .from('email_templates')
            .update({
                name: template.name,
                subject: template.subject,
                body: template.body,
                is_default: template.isDefault
            })
            .eq('id', template.id)
            .eq('user_id', user.id);
        if (error) console.error('Error updating template:', error);
        else fetchTemplates();
    };

    const deleteTemplate = async (id: string) => {
        if (!user) return;
        const { error } = await supabase
            .from('email_templates')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);
        if (error) console.error('Error deleting template:', error);
        else fetchTemplates();
    };

    const importJobs = (_newJobs: Job[]) => {
        console.warn('Bulk import not yet implemented for Supabase');
    };

    return (
        <JobsContext.Provider value={{
            jobs,
            templates,
            addJob,
            updateJob,
            deleteJob,
            archiveJob,
            restoreJob,
            importJobs,
            addTemplate,
            updateTemplate,
            deleteTemplate,
            fetchJobs,
            fetchTemplates,
            isLoaded,
            user
        }}>
            {children}
        </JobsContext.Provider>
    );
}
