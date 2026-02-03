'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { Job } from '@/app/lib/data';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function tailorDocument(job: Job, documentType: 'cv' | 'letter', masterContent: string, userName: string) {
    if (!masterContent) {
        return { error: 'Master content is required' };
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const docName = documentType === 'cv' ? 'Lebenslauf' : 'Anschreiben';

        const prompt = `
            Du bist ein Experte für Bewerbungsunterlagen und Karriere-Coaching.
            Deine Aufgabe ist es, den ${docName} eines Bewerbers (${userName}) an eine spezifische Stellenanzeige anzupassen.
            
            UNTERNEHMEN: ${job.company}
            POSITION: ${job.title}
            JOB-BESCHREIBUNG: ${job.description || job.summary}
            ANFORDERUNGEN: ${job.requirements?.join(', ')}
            GEWÜNSCHTE SKILLS: ${job.skills?.join(', ')}
            
            BASIS-TEXT (${docName}):
            ---
            ${masterContent}
            ---
            
            ANWEISUNGEN:
            1. Analysiere die Job-Beschreibung und hebe die Erfahrungen und Skills im ${docName} hervor, die für diese Stelle am relevantesten sind.
            2. Behalte den grundsätzlichen Wahrheitsgehalt bei, aber optimiere die Formulierungen für maximale Relevanz.
            3. Der Tonfall sollte professionell und passend zum Unternehmen sein.
            4. Wenn es ein Anschreiben ist, stelle sicher, dass die Motivation für genau dieses Unternehmen (${job.company}) deutlich wird.
            5. Wenn es ein Lebenslauf ist, optmiere die Stichpunkte der relevanten Stationen.
            6. Gib NUR den optimierten Text zurück, ohne Metadaten oder Einleitung.
            7. Antworte auf DEUTSCH.
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        return { data: responseText.trim() };

    } catch (error) {
        console.error('Error tailoring document:', error);
        return { error: 'Fehler bei der KI-Anpassung.' };
    }
}
