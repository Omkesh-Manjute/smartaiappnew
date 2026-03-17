/**
 * Sarvam AI TTS Service
 * Documentation: https://www.sarvam.ai/
 */

const SARVAM_API_URL = 'https://api.sarvam.ai/text-to-speech';
const API_KEY = (import.meta.env.VITE_SARVAM_API_KEY || '').trim();

// Improves reading of math formulas
const formatMathForSpeech = (text: string): string => {
  return text
    .replace(/=/g, ' equals ')
    .replace(/\+/g, ' plus ')
    .replace(/-/g, ' minus ')
    .replace(/\//g, ' divided by ')
    .replace(/\*/g, ' multiplied by ')
    .replace(/\(/g, ' bracket start ')
    .replace(/\)/g, ' bracket end ')
    .replace(/%/g, ' percent ')
    .replace(/\^/g, ' to the power of ')
    .replace(/\s+/g, ' ')
    .trim();
};

// Recursive text chunker (Sarvam has a 500 char limit)
const chunkText = (text: string, limit: number = 450): string[] => {
  if (text.length <= limit) return [text];
  
  const chunks: string[] = [];
  let currentPos = 0;
  
  while (currentPos < text.length) {
    let endPos = currentPos + limit;
    if (endPos >= text.length) {
      chunks.push(text.substring(currentPos));
      break;
    }
    
    // Look for last sentence break or space to avoid cutting words
    const lastSpace = text.lastIndexOf(' ', endPos);
    const lastFullStop = text.lastIndexOf('. ', endPos);
    const splitAt = lastFullStop > currentPos ? lastFullStop + 1 : (lastSpace > currentPos ? lastSpace : endPos);
    
    chunks.push(text.substring(currentPos, splitAt).trim());
    currentPos = splitAt;
  }
  
  return chunks;
};

export interface SarvamTTSResponse {
  audios: string[];
}

export const getSarvamAudio = async (
  text: string, 
  lang: 'hi' | 'en' = 'hi', 
  config?: { apiKey?: string; speaker?: string; model?: string }
): Promise<string | null> => {
  const currentKey = (config?.apiKey || API_KEY || '').trim();
  if (!currentKey) return null;

  try {
    const formattedText = formatMathForSpeech(text);
    const chunks = chunkText(formattedText);
    const audioChunks: string[] = [];

    const speaker = config?.speaker || 'anushka';
    const model = config?.model || 'bulbul:v2';

    console.log(`Processing Sarvam TTS (${model}/${speaker}) in ${chunks.length} chunks...`);

    for (const chunk of chunks) {
      const response = await fetch(SARVAM_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-subscription-key': currentKey,
        },
        body: JSON.stringify({
          inputs: [chunk],
          target_language_code: lang === 'hi' ? 'hi-IN' : 'en-IN',
          speaker: speaker,
          model: model
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Sarvam Chunk Error:', errorText);
        continue;
      }

      const data: SarvamTTSResponse = await response.json();
      if (data.audios && data.audios.length > 0) {
        audioChunks.push(data.audios[0]);
      }
    }

    if (audioChunks.length === 0) return null;
    return `data:audio/wav;base64,${audioChunks[0]}`;
  } catch (error) {
    console.error('Error in Sarvam Service:', error);
    return null;
  }
};
