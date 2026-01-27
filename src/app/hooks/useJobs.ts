// src/app/hooks/useJobs.ts
'use client';

import { useContext } from 'react';
import { JobsContext } from '@/app/providers/JobsProvider';

export function useJobs() {
  const context = useContext(JobsContext);

  if (context === undefined) {
    throw new Error('useJobs must be used within a JobsProvider');
  }

  return context;
}