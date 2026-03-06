type PreviousMessage = {
  role: 'user' | 'model';
  content: string;
};

type TutorRequestBody = {
  message?: string;
  context?: {
    subject?: string;
    chapter?: string;
    previousMessages?: PreviousMessage[];
  };
};

const readJsonBody = (req: any): TutorRequestBody => {
  if (!req?.body) return {};
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body) as TutorRequestBody;
    } catch {
      return {};
    }
  }
  return req.body as TutorRequestBody;
};

const buildTutorPrompt = (
  message: string,
  context?: TutorRequestBody['context']
): string => {
  let prompt = `You are an expert AI tutor named "EduAI" helping students learn. `;

  if (context?.subject) {
    prompt += `The student is asking about ${context.subject}`;
    if (context.chapter) {
      prompt += `, specifically the chapter "${context.chapter}"`;
    }
    prompt += `. `;
  }

  prompt += `
Your role is to:
1. Explain concepts clearly and concisely
2. Use examples when helpful
3. Encourage critical thinking
4. Be supportive and encouraging
5. If the student seems confused, break down the explanation further
6. Use appropriate formatting (bullet points, bold text) for clarity

Respond in a friendly, educational tone. Keep responses concise but informative (2-4 paragraphs maximum).

Student's message: ${message}
`;

  return prompt;
};

const callGeminiTutor = async (
  apiKey: string,
  prompt: string,
  previousMessages: PreviousMessage[] = []
): Promise<string> => {
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const contents = previousMessages.slice(-5).map((msg) => ({
    role: msg.role === 'model' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));

  contents.push({
    role: 'user',
    parts: [{ text: prompt }],
  });

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 2048,
      },
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

const callGroqTutor = async (
  apiKey: string,
  prompt: string,
  previousMessages: PreviousMessage[] = []
): Promise<string> => {
  const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
  const endpoint = 'https://api.groq.com/openai/v1/chat/completions';

  const messages = [
    {
      role: 'system',
      content:
        'You are EduAI, a concise and supportive tutor. Explain clearly and provide actionable learning guidance.',
    },
    ...previousMessages.slice(-5).map((msg) => ({
      role: msg.role === 'model' ? 'assistant' : 'user',
      content: msg.content,
    })),
    {
      role: 'user',
      content: prompt,
    },
  ];

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.8,
      max_tokens: 1024,
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
  const message = (body.message || '').trim();
  const context = body.context;
  const previousMessages = context?.previousMessages || [];

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const prompt = buildTutorPrompt(message, context);

  const geminiKey =
    process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
  const groqKey =
    process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY || '';

  let lastError: string | null = null;

  if (geminiKey) {
    try {
      const text = await callGeminiTutor(geminiKey, prompt, previousMessages);
      return res.status(200).json({ provider: 'gemini', text });
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      console.error('Gemini tutor call failed:', lastError);
    }
  }

  if (groqKey) {
    try {
      const text = await callGroqTutor(groqKey, prompt, previousMessages);
      return res.status(200).json({ provider: 'groq', text });
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      console.error('Groq tutor call failed:', lastError);
    }
  }

  return res.status(500).json({
    error:
      lastError ||
      'No AI provider configured. Set GEMINI_API_KEY or GROQ_API_KEY in Vercel.',
  });
}
