-- Add interview_date and contact_info columns to jobs table
ALTER TABLE jobs 
ADD COLUMN interview_date DATE,
ADD COLUMN contact_info TEXT;
