-- Migration script for Interview Tracking
-- Run this in your Supabase SQL Editor

ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS prep_tasks JSONB DEFAULT '[]'::jsonb;
