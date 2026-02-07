'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import * as cheerio from 'cheerio';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function analyzeJob(url: string) {
    if (!url) {
        return { error: 'URL is required' };
    }

    try {
        // Add simple validation for URL
        if (!url.startsWith('http')) {
            return { error: 'Invalid URL format' };
        }

        console.log('Analyzing URL:', url); // Debug log

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7',
                'Referer': 'https://www.google.com/'
            }
        });
        clearTimeout(timeoutId);

        // ... existing code ...

        if (!response.ok) {
            console.error('Fetch failed:', response.status, response.statusText);
            return { error: `Job-Portal blocked access (Status: ${response.status}). Try a different URL or copy details manually.` };
        }

        const html = await response.text();
        console.log('HTML fetched, length:', html.length);
        const $ = cheerio.load(html);

        // cleanup (keep existing cleanup)
        $('script').remove();
        $('style').remove();
        $('nav').remove();
        $('footer').remove();
        $('header').remove();
        $('noscript').remove();

        // extract text
        const text = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 30000); // Limit processing size
        console.log('Cleaned text length:', text.length);

        if (text.length < 100) {
            return { error: 'Could not extract enough text. The site might block bots.' };
        }

        // Use the alias that explicitly appeared in your "Available Models" list
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `
      You are a job extraction bot. Analyze the following text from a job posting website and extract the job details in JSON format.
      
      Return ONLY valid JSON.
      Do not wrap it in markdown block quotes.
      
      Extract the following fields. If a field is not found or not explicitly named in the text, leave it as null or an empty array.
      
      Required Fields:
      - title (string): Job title
      - company (string): Company name
      - location (string): Job location
      - description (string): General description of the role and the company. Do NOT include requirements, tasks, or benefits here.
      - summary (string): A short 2-3 sentence executive summary of the position.
      - requirements (array of strings): List of requirements, skills, and qualifications expected from the applicant.
      - benefits (array of strings): List of what the company offers (salary, perks, culture, etc.).
      - tasks (array of strings): List of responsibilities and daily tasks associated with the job.
      - skills (array of strings): List of specific technologies or hard skills mentioned (e.g., React, Python, English).
      - contact_person (string): Name of the recruiter or hiring manager if found
      - contact_info (string): Email or phone number of the contact person if found
      - employmentType (string): One of 'Vollzeit', 'Teilzeit', 'Minijob', 'Werkstudent', 'Praktikum' (or null if not found)
      
      Text to analyze:
      ${text}
    `;

        console.log('Sending to Gemini...');
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        console.log('Gemini Response:', responseText);

        // Clean up potential markdown formatting if the model adds it
        const jsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            const data = JSON.parse(jsonString);
            return { data };
        } catch (e) {
            console.error("JSON Parse Error", e);
            console.error("Raw Response:", responseText);
            return { error: 'Failed to parse AI response' };
        }

    } catch (error) {
        console.error('Error analyzing job:', error);
        return { error: 'Failed to analyze job posting. Please check the URL or try manually.' };
    }
}
