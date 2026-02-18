'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

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

        console.log(`Analyzing URL:`, url); // Debug log

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

        if (!response.ok) {
            console.error('Fetch failed:', response.status, response.statusText);
            return { error: `Job-Portal blocked access (Status: ${response.status}). Try a different URL or copy details manually.` };
        }

        const html = await response.text();
        console.log('HTML fetched, length:', html.length);
        const $ = cheerio.load(html);

        // cleanup
        $('script').remove();
        $('style').remove();
        $('nav').remove();
        $('footer').remove();
        $('header').remove();
        $('noscript').remove();
        $('svg').remove();
        $('img').remove();
        $('video').remove();
        $('iframe').remove();
        $('button').remove();
        $('form').remove();
        $('[role="button"]').remove(); // Remove elements acting as buttons

        // extract text
        // Improve text extraction:
        // 1. Get text
        // 2. Collapse whitespace
        // 3. Trim
        // 4. Limit length (reduced from 20000 to 10000 for strict 10s limit)
        const text = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 10000);
        console.log('Cleaned text length:', text.length);

        if (text.length < 100) {
            return { error: 'Could not extract enough text. The site might block bots.' };
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
            You are a job extraction bot. Analyze the text and extract ALL relevant job details in JSON format.
            
            Return ONLY valid JSON.
            Do not wrap it in markdown block quotes.

            Required Fields:
            - title (string): Job title
            - company (string): Company name
            - location (string): Job location
            - contact_person (string): Name of the recruiter or hiring manager if found
            - contact_info (string): Email or phone number of the contact person if found
            - employmentType (string): One of 'Vollzeit', 'Teilzeit', 'Minijob', 'Werkstudent', 'Praktikum' (or null if not found)
            - description (string): General description of the role and the company. Do NOT include requirements, tasks, or benefits here.
            - summary (string): A short 2-3 sentence executive summary of the position.
            - requirements (array of strings): List of requirements, skills, and qualifications expected from the applicant.
            - benefits (array of strings): List of what the company offers (salary, perks, culture, etc.).
            - tasks (array of strings): List of responsibilities and daily tasks associated with the job.
            - skills (array of strings): List of specific technologies or hard skills mentioned (e.g., React, Python, English).

            Text to analyze:
            ${text}
            `;

        console.log('Sending to Gemini...');
        try {
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
                throw new Error('Failed to parse JSON response: ' + responseText);
            }
        } catch (innerError: any) {
            const logPath = path.join(process.cwd(), 'debug-error.log');
            // Helper to safely stringify circular objects if needed, but simple here
            const msg = innerError.message || 'Unknown error';
            fs.appendFileSync(logPath, `${new Date().toISOString()} - AI Error: ${msg}\n`);
            console.error("AI/JSON Error", innerError);
            return { error: 'Failed to process job details with AI. Check debug-error.log.' };
        }

    } catch (error: any) {
        const logPath = path.join(process.cwd(), 'debug-error.log');
        const msg = error.message || 'Unknown error';
        fs.appendFileSync(logPath, `${new Date().toISOString()} - General Error: ${msg}\n`);
        console.error('Error analyzing job:', error);
        return { error: 'Failed to analyze job posting. Please check the URL or try manually.' };
    }
}
