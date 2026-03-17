type BlueprintRequestBody = {
  prompt?: string;
  sourceText?: string;
};

const readJsonBody = (req: any): BlueprintRequestBody => {
  if (!req?.body) return {};
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body) as BlueprintRequestBody;
    } catch {
      return {};
    }
  }
  return req.body as BlueprintRequestBody;
};

const buildPrompt = (prompt: string, sourceText?: string): string => `
You are an academic curriculum designer.

Teacher/Admin instruction:
${prompt}

Reference text extracted from uploaded material:
${(sourceText || 'No extra source text provided.').slice(0, 12000)}

Generate a JSON object in this exact structure:
{
  "subjects": [
    {
      "name": "Subject Name",
      "description": "Short description",
      "grade": 10,
      "chapters": [
        {
          "name": "Chapter Name",
          "description": "Chapter description",
          "content": "High-level summary content"
        }
      ]
    }
  ]
}

Rules:
- 1 to 5 subjects
- Each subject should have 3 to 12 chapters
- Return JSON only, no markdown
`;

const callGemini = async (apiKey: string, prompt: string): Promise<string> => {
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 8192 },
    }),
  });

  const raw = await response.text();
  let data: any = {};
  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      throw new Error('Gemini returned invalid JSON');
    }
  }

  if (!response.ok) {
    throw new Error(data?.error?.message || `Gemini error ${response.status}`);
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Gemini returned empty response');
  }

  return String(text).trim();
};

const callGroq = async (apiKey: string, prompt: string): Promise<string> => {
  const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: 'Generate strictly valid JSON only. Do not include markdown.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 2048,
    }),
  });

  const raw = await response.text();
  let data: any = {};
  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      throw new Error('Groq returned invalid JSON');
    }
  }

  if (!response.ok) {
    throw new Error(data?.error?.message || `Groq error ${response.status}`);
  }

  const text = data?.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error('Groq returned empty response');
  }
  return String(text).trim();
};

const callSarvam = async (apiKey: string, prompt: string): Promise<string> => {
  const endpoint =
    process.env.SARVAM_API_URL || 'https://api.sarvam.ai/v1/chat/completions';
  const model = process.env.SARVAM_MODEL || 'sarvam-m';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'api-subscription-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: 'Generate strictly valid JSON only. Do not include markdown.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.2,
      max_tokens: 2048,
    }),
  });

  const raw = await response.text();
  let data: any = {};
  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      throw new Error('Sarvam returned invalid JSON');
    }
  }

  if (!response.ok) {
    throw new Error(data?.error?.message || `Sarvam error ${response.status}`);
  }

  const text = data?.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error('Sarvam returned empty response');
  }
  return String(text).trim();
};

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = readJsonBody(req);
  const prompt = (body.prompt || '').trim();
  const sourceText = body.sourceText || '';

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const finalPrompt = buildPrompt(prompt, sourceText);
  const geminiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GEMINI_KEY ||
    process.env.gemini_api_key ||
    process.env.gemini_key ||
    process.env.VITE_GEMINI_API_KEY ||
    '';
  const groqKey =
    process.env.GROQ_API_KEY ||
    process.env.GROQ_KEY ||
    process.env.groq_api_key ||
    process.env.groq_key ||
    process.env.VITE_GROQ_API_KEY ||
    '';
  const sarvamKey =
    process.env.SARVAM_API_KEY ||
    process.env.SARVAM_KEY ||
    process.env.sarvam_api_key ||
    process.env.sarvam_key ||
    process.env.VITE_SARVAM_API_KEY ||
    '';

  let lastError: string | null = null;

  if (geminiKey) {
    try {
      const text = await callGemini(geminiKey, finalPrompt);
      return res.status(200).json({ provider: 'gemini', text });
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      console.error('Gemini subject blueprint call failed:', lastError);
    }
  }

  if (groqKey) {
    try {
      const text = await callGroq(groqKey, finalPrompt);
      return res.status(200).json({ provider: 'groq', text });
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      console.error('Groq subject blueprint call failed:', lastError);
    }
  }

  if (sarvamKey) {
    try {
      const text = await callSarvam(sarvamKey, finalPrompt);
      return res.status(200).json({ provider: 'sarvam', text });
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      console.error('Sarvam subject blueprint call failed:', lastError);
    }
  }

  return res.status(500).json({
    error:
      lastError ||
      'No AI provider configured. Set GEMINI_API_KEY, GROQ_API_KEY, or SARVAM_API_KEY in Vercel.',
  });
}

