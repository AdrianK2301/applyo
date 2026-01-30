-- Create email_templates table
CREATE TABLE IF NOT EXISTS public.email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    subject TEXT,
    body TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own templates" ON public.email_templates
    FOR SELECT USING (auth.uid() = user_id OR is_default = true);

CREATE POLICY "Users can insert their own templates" ON public.email_templates
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates" ON public.email_templates
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates" ON public.email_templates
    FOR DELETE USING (auth.uid() = user_id);

-- Insert some high-quality default templates
INSERT INTO public.email_templates (name, subject, body, is_default) VALUES
('Dankeschön nach Interview', 'Vielen Dank für das Gespräch - {job_title}', '{greeting},\n\nvielen Dank für das angenehme Gespräch heute Vormittag. Es war sehr interessant, mehr über das Team und die Projekte bei {company} zu erfahren.\n\nIch freue mich auf Ihre Rückmeldung.\n\nMit freundlichen Grüßen,\n{user_name}', true),
('Nachfassen (Follow-up)', 'Status meiner Bewerbung als {job_title}', '{greeting},\n\nich möchte mich kurz nach dem aktuellen Stand meiner Bewerbung erkundigen. Ich bin nach wie vor sehr an der Position bei {company} interessiert.\n\nBeste Grüße,\n{user_name}', true),
('Anfrage Networking', 'Vernetzung & Austausch über {company}', 'Hallo {contact_name},\n\nich bin auf Ihr Profil aufmerksam geworden und finde Ihre Arbeit bei {company} sehr spannend. Gerne würde ich mich mit Ihnen vernetzen.\n\nBeste Grüße,\n{user_name}', true);
