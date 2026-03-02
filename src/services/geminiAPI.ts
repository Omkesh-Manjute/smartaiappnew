// Gemini Flash API Service for AI Test Generation and AI Tutor

const GEMINI_API_KEY = 'AIzaSyA1g5g1x8f0g8g0g0g0g0g0g0g0g0g0g0g0'; // User provided key
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export interface GeneratedQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface TestGenerationParams {
  subject: string;
  chapter: string;
  topic: string;
  numQuestions: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  questionTypes?: ('mcq' | 'truefalse' | 'fillblank')[];
}

export interface TutorMessage {
  role: 'user' | 'model';
  content: string;
}

// Generate test questions using Gemini Flash API
export const generateTestQuestions = async (
  params: TestGenerationParams
): Promise<GeneratedQuestion[]> => {
  try {
    const prompt = `
You are an expert educational content creator. Generate ${params.numQuestions} multiple choice questions for the following:

Subject: ${params.subject}
Chapter: ${params.chapter}
Topic: ${params.topic}
Difficulty Level: ${params.difficulty}

For each question, provide:
1. A clear, concise question
2. Exactly 4 answer options (A, B, C, D)
3. The correct answer index (0 for A, 1 for B, 2 for C, 3 for D)
4. A brief explanation of why the answer is correct
5. Difficulty level (easy, medium, or hard)

Format your response as a valid JSON array with this exact structure:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Explanation of the correct answer",
    "difficulty": "easy"
  }
]

Important: Return ONLY the JSON array, no markdown formatting, no additional text.
`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('No content generated');
    }

    // Extract JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Could not parse generated questions');
    }

    const questions: GeneratedQuestion[] = JSON.parse(jsonMatch[0]);
    
    // Validate and sanitize questions
    return questions.map((q, index) => ({
      question: q.question || `Question ${index + 1}`,
      options: q.options?.length === 4 ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: typeof q.correctAnswer === 'number' && q.correctAnswer >= 0 && q.correctAnswer <= 3 
        ? q.correctAnswer 
        : 0,
      explanation: q.explanation || 'No explanation provided',
      difficulty: ['easy', 'medium', 'hard'].includes(q.difficulty) ? q.difficulty : 'medium',
    }));
  } catch (error) {
    console.error('Error generating test questions:', error);
    // Return fallback questions if API fails
    return generateFallbackQuestions(params.numQuestions);
  }
};

// AI Tutor - Get response from Gemini
export const getTutorResponse = async (
  message: string,
  context?: {
    subject?: string;
    chapter?: string;
    previousMessages?: TutorMessage[];
  }
): Promise<string> => {
  try {
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

    // Include conversation history if available
    const contents: any[] = [];
    if (context?.previousMessages && context.previousMessages.length > 0) {
      for (const msg of context.previousMessages.slice(-5)) { // Last 5 messages for context
        contents.push({
          role: msg.role,
          parts: [{ text: msg.content }],
        });
      }
    }
    
    contents.push({
      role: 'user',
      parts: [{ text: prompt }],
    });

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
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

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('No response generated');
    }

    return text.trim();
  } catch (error) {
    console.error('Error getting tutor response:', error);
    return getFallbackTutorResponse(message);
  }
};

// Generate study plan using AI
export const generateStudyPlan = async (
  params: {
    subjects: string[];
    availableHoursPerDay: number;
    totalDays: number;
    goals: string;
    currentLevel: 'beginner' | 'intermediate' | 'advanced';
  }
): Promise<{
  title: string;
  description: string;
  dailySchedule: {
    day: number;
    subject: string;
    topics: string[];
    duration: number;
    activities: string[];
  }[];
}> => {
  try {
    const prompt = `
Create a personalized study plan with the following parameters:

Subjects: ${params.subjects.join(', ')}
Available Hours Per Day: ${params.availableHoursPerDay}
Total Days: ${params.totalDays}
Student's Goals: ${params.goals}
Current Level: ${params.currentLevel}

Generate a detailed study plan with daily schedules. Format as JSON:

{
  "title": "Study Plan Title",
  "description": "Brief description of the plan",
  "dailySchedule": [
    {
      "day": 1,
      "subject": "Subject Name",
      "topics": ["Topic 1", "Topic 2"],
      "duration": 60,
      "activities": ["Activity 1", "Activity 2"]
    }
  ]
}

Return ONLY the JSON object, no markdown formatting.
`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('No content generated');
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse study plan');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error generating study plan:', error);
    return generateFallbackStudyPlan(params);
  }
};

// Analyze weak areas based on test performance
export const analyzeWeakAreas = async (
  testResults: {
    subject: string;
    chapter: string;
    topic: string;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
  }[]
): Promise<{
  weakAreas: { subject: string; chapter: string; topic: string; mastery: number }[];
  recommendations: string[];
}> => {
  try {
    const prompt = `
Analyze the following test performance data and identify weak areas:

${JSON.stringify(testResults, null, 2)}

Provide:
1. A list of weak areas with mastery percentage (0-100)
2. Personalized recommendations for improvement

Format as JSON:
{
  "weakAreas": [
    { "subject": "Subject", "chapter": "Chapter", "topic": "Topic", "mastery": 45 }
  ],
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}

Return ONLY the JSON object.
`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('No analysis generated');
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse analysis');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error analyzing weak areas:', error);
    return generateFallbackWeakAreaAnalysis(testResults);
  }
};

// Fallback functions for when API fails
const generateFallbackQuestions = (count: number): GeneratedQuestion[] => {
  const questions: GeneratedQuestion[] = [];
  for (let i = 0; i < count; i++) {
    questions.push({
      question: `Sample Question ${i + 1}: What is the correct answer?`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 0,
      explanation: 'This is a sample explanation for the correct answer.',
      difficulty: 'medium',
    });
  }
  return questions;
};

const getFallbackTutorResponse = (_message: string): string => {
  const responses = [
    "That's a great question! Let me explain this concept in detail. The key to understanding this topic is to break it down into smaller, manageable parts. Start by identifying the main concepts and then explore how they connect to each other.",
    "I understand your question. This is an important topic that builds on several fundamental concepts. Let me walk you through it step by step. First, let's establish the basics, then we'll dive deeper into the more complex aspects.",
    "Excellent question! This concept can be tricky at first, but once you grasp the underlying principles, it becomes much clearer. Think of it this way: imagine you're building a house - you need a strong foundation before you can add the walls and roof.",
  ];
  return responses[Math.floor(Math.random() * responses.length)];
};

const generateFallbackStudyPlan = (params: any) => {
  const dailySchedule = [];
  for (let i = 1; i <= params.totalDays; i++) {
    const subject = params.subjects[i % params.subjects.length];
    dailySchedule.push({
      day: i,
      subject,
      topics: [`Topic ${i} for ${subject}`],
      duration: params.availableHoursPerDay * 60,
      activities: ['Read chapter', 'Practice problems', 'Review notes'],
    });
  }
  
  return {
    title: `Personalized ${params.totalDays}-Day Study Plan`,
    description: `A customized study plan focusing on ${params.subjects.join(', ')}`,
    dailySchedule,
  };
};

const generateFallbackWeakAreaAnalysis = (testResults: any[]) => {
  const weakAreas = testResults
    .filter(r => r.score < 70)
    .map(r => ({
      subject: r.subject,
      chapter: r.chapter,
      topic: r.topic,
      mastery: r.score,
    }));

  return {
    weakAreas,
    recommendations: [
      'Review the fundamental concepts in your weak areas',
      'Practice more problems from these topics',
      'Create flashcards for key terms and formulas',
      'Watch educational videos on these subjects',
      'Form a study group to discuss difficult concepts',
    ],
  };
};

export default {
  generateTestQuestions,
  getTutorResponse,
  generateStudyPlan,
  analyzeWeakAreas,
};
