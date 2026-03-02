import { GoogleGenerativeAI } from '@google/generative-ai';

// ⚠️ For hackathon demo only - in production, never expose API keys in frontend
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

const SYSTEM_PROMPT = `You are a Disaster Response AI.
Analyze the input (text description or image of disaster damage) and return ONLY a raw JSON object.
No markdown, no explanation, just valid JSON.
JSON format:
{
  "incident_type": "Flood" or "Fire" or "Earthquake" or "Medical" or "Collapse" or "Other",
  "severity_score": a number from 1 to 10,
  "casualties_suspected": true or false,
  "resources_required": ["list", "of", "resources"],
  "brief_summary": "one sentence description",
  "is_hoax": true or false
}`;

// Analyze text only
export async function analyzeWithGemini(userText) {
    if (!GEMINI_API_KEY) return null;
    try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const prompt = SYSTEM_PROMPT + '\nInput: ' + userText;
        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json|```/g, '').trim();
        return JSON.parse(text);
    } catch (error) {
        console.error('Gemini text call failed:', error);
        return null;
    }
}

// Analyze image + text (MULTIMODAL - the wow factor!)
export async function analyzeImageWithGemini(base64Data, mimeType, userText) {
    if (!GEMINI_API_KEY) return null;
    try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType: mimeType,
            },
        };

        const prompt = SYSTEM_PROMPT + '\nUser description: ' + (userText || 'Analyze this disaster image.');
        const result = await model.generateContent([prompt, imagePart]);
        const text = result.response.text().replace(/```json|```/g, '').trim();
        return JSON.parse(text);
    } catch (error) {
        console.error('Gemini image call failed:', error);
        return null;
    }
}
