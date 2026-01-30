-- Migration to add contact_person to jobs table
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS contact_person TEXT;
