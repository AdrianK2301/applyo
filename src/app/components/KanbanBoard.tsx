// src/app/components/KanbanBoard.tsx
'use client';

import React, { useState } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragEndEvent,
    useDroppable,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Job, Status, Priority } from '@/app/lib/data';
import { useJobs } from '@/app/hooks/useJobs';
import {
    MoreHorizontal,
    Building2,
    MapPin,
    Calendar,
    ArrowRight,
    Plus
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';


interface KanbanBoardProps {
    jobs: Job[];
    onJobClick: (job: Job) => void;
}

const COLUMNS: { id: string; title: string; statuses: Status[] }[] = [
    { id: 'draft', title: 'Entwurf', statuses: ['Merkliste', 'In Arbeit'] },
    { id: 'applied', title: 'Beworben', statuses: ['Beworben'] },
    { id: 'interview', title: 'Interview', statuses: ['Interview'] },
    { id: 'closed', title: 'Erledigt', statuses: ['Angebot', 'Absage'] },
];

export default function KanbanBoard({ jobs: initialJobs, onJobClick }: KanbanBoardProps) {
    const { updateJob } = useJobs();
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeJobId = active.id as string;
        const overId = over.id as string;

        const overJob = initialJobs.find(j => j.id === overId);
        let newStatus: Status | null = null;

        if (overJob) {
            newStatus = overJob.status;
        } else {
            const col = COLUMNS.find(c => c.id === overId);
            if (col) {
                newStatus = col.statuses[0];
            }
        }

        const activeJob = initialJobs.find(j => j.id === activeJobId);
        if (activeJob && newStatus && activeJob.status !== newStatus) {
            await updateJob({ ...activeJob, status: newStatus });
        }
    };

    const activeJob = activeId ? initialJobs.find(j => j.id === activeId) : null;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-8 overflow-x-auto pb-8 h-full min-h-[700px] custom-scrollbar">
                {COLUMNS.map((col) => {
                    const columnJobs = initialJobs.filter(j => col.statuses.includes(j.status));
                    return <KanbanColumn key={col.id} col={col} jobs={columnJobs} onJobClick={onJobClick} />;
                })}
            </div>

            <DragOverlay dropAnimation={{
                duration: 250,
                easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
            }}>
                {activeId && activeJob ? (
                    <div className="w-[288px] rotate-2 opacity-95">
                        <JobCardContent job={activeJob} isOverlay />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

function KanbanColumn({ col, jobs, onJobClick }: { col: { id: string; title: string; statuses: Status[] }, jobs: Job[], onJobClick: (job: Job) => void }) {
    const { setNodeRef } = useDroppable({
        id: col.id,
    });

    return (
        <div className="flex-shrink-0 w-[320px] flex flex-col group/col">
            <div className="flex items-center justify-between mb-5 px-3">
                <div className="flex items-center gap-3">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{col.title}</h3>
                    <span className="bg-blue-600/10 text-blue-600 text-[10px] font-black px-2 py-0.5 rounded-lg">
                        {jobs.length}
                    </span>
                </div>
                <button className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-white/10 rounded-xl opacity-0 group-hover/col:opacity-100 transition-all">
                    <Plus size={16} />
                </button>
            </div>

            <div ref={setNodeRef} className="flex-1 glass shadow-lg rounded-[2.5rem] p-4 border border-white/5 bg-white/5 group-hover/col:bg-white/10 transition-colors flex flex-col">
                <SortableContext items={jobs.map(j => j.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-4 flex-1">
                        <AnimatePresence>
                            {jobs.map((job) => (
                                <KanbanCard key={job.id} job={job} onClick={() => onJobClick(job)} />
                            ))}
                        </AnimatePresence>
                        {jobs.length === 0 && (
                            <div className="h-32 border-2 border-dashed border-white/5 rounded-[2rem] flex flex-col items-center justify-center text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
                                Leer
                            </div>
                        )}
                    </div>
                </SortableContext>
            </div>
        </div>
    );
}

function KanbanCard({ job, onClick }: { job: Job, onClick: () => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: job.id });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="h-32 bg-blue-600/5 rounded-[1.5rem] border-2 border-dashed border-blue-600/20"
            />
        );
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={onClick}
            className="cursor-pointer active:cursor-grabbing outline-none"
        >
            <JobCardContent job={job} />
        </motion.div>
    );
}

function JobCardContent({ job, isOverlay = false }: { job: Job; isOverlay?: boolean }) {
    const priorityStyles: Record<Priority, string> = {
        High: 'bg-rose-500',
        Medium: 'bg-amber-500',
        Low: 'bg-blue-500'
    };

    const priorityLabels: Record<Priority, string> = {
        High: 'Hoch',
        Medium: 'Mittel',
        Low: 'Niedrig'
    };

    return (
        <div className={clsx(
            "p-5 rounded-[1.8rem] border transition-all duration-300 relative overflow-hidden group/card",
            !isOverlay && "glass-card border-white/10 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10",
            isOverlay && "glass bg-blue-600/10 border-blue-500 shadow-2xl ring-4 ring-blue-500/10"
        )}>
            <div className="flex justify-between items-start mb-4">
                <div className={clsx("px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest text-white shadow-sm", priorityStyles[job.priority])}>
                    {priorityLabels[job.priority]}
                </div>
                <button className="text-gray-500 hover:text-white transition-colors">
                    <MoreHorizontal size={14} />
                </button>
            </div>

            <h4 className="font-black text-xs text-gray-900 dark:text-white line-clamp-2 leading-tight mb-2 group-hover/card:text-blue-500 transition-colors uppercase tracking-tight">{job.title}</h4>

            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-4">
                <Building2 size={12} className="text-blue-500" />
                <span className="truncate">{job.company}</span>
            </div>

            {job.location && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-black/5 dark:bg-white/5 rounded-xl text-[9px] font-black text-gray-500 dark:text-gray-400 mb-4 w-fit">
                    <MapPin size={10} className="text-orange-500" />
                    <span className="truncate">{job.location}</span>
                </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                <div className="flex items-center gap-1.5 text-[9px] text-gray-400 font-black uppercase tracking-widest">
                    <Calendar size={10} className="text-blue-500" />
                    {new Date(job.lastUpdate).toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })}
                </div>

                <div className="flex items-center justify-center w-7 h-7 bg-blue-600/10 rounded-lg text-blue-500 group-hover/card:bg-blue-600 group-hover/card:text-white transition-all shadow-sm">
                    <ArrowRight size={14} />
                </div>
            </div>
        </div>
    );
}
