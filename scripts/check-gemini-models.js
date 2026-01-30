const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

// Quick and dirty env loader since we might not have dotenv installed for standalone scripts
function loadEnv() {
    try {
        const envPath = path.resolve(__dirname, '../.env.local');
        const envFile = fs.readFileSync(envPath, 'utf8');
        const lines = envFile.split('\n');
        for (const line of lines) {
            const parts = line.split('=');
            if (parts.length >= 2) {
                const key = parts[0].trim();
                const value = parts.slice(1).join('=').trim();
                if (key && !key.startsWith('#')) {
                    process.env[key] = value;
                }
            }
        }
    } catch (e) {
        console.error("Could not read .env.local", e.message);
    }
}

loadEnv();

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ No GEMINI_API_KEY found in .env.local");
        return;
    }

    console.log("Checking available models with API Key ending in...", apiKey.slice(-4));

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        // We can't list models directly with the basic SDK easily in all versions, 
        // but we can try to run a dummy prompt to see if it works, or catch the specific error which lists models.

        // Actually, let's just try to generate content with the problematic model and see the full error,
        // OR if there is a listModels method exposed in the version we installed.
        // The error message said "Call ListModels". 
        // Use the API directly for listing models if SDK doesn't expose it easily.

        // Using fetch for direct API call to list models
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            console.log("\n✅ Available Models:");
            data.models.forEach(m => {
                if (m.name.includes('gemini')) {
                    console.log(`- ${m.name.replace('models/', '')} (${m.supportedGenerationMethods.join(', ')})`);
                }
            });
        } else {
            console.error("Detailed Error:", JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

listModels();
