/**
 * Sarvam AI TTS Service
 * Documentation: https://www.sarvam.ai/
 */

const SARVAM_API_URL = 'https://api.sarvam.ai/text-to-speech';
const API_KEY = (import.meta.env.VITE_SARVAM_API_KEY || '').trim();

// Cleans and prepares text for a natural speaking voice
const prepareTextForSpeech = (text: string): string => {
  return text
    // 1. Phonetic fixes for common mispronunciations
    .replace(/\bHindi\b/g, 'हिन्दी')
    .replace(/\bhindi\b/g, 'हिन्दी')
    
    // 2. Remove brackets symbols (replace with comma for a natural pause)
    .replace(/\(/g, ', ')
    .replace(/\)/g, ', ')

    // 3. Remove Markdown-style symbols that shouldn't be spoken
    .replace(/[*_#~`]/g, ' ')
    .replace(/^\s*[-•]\s*/gm, ' ') 

    // 4. Handle math symbols naturally (ONLY IF SURROUNDED BY DIGITS)
    .replace(/(\d)\s*-\s*(\d)/g, '$1 minus $2') // Only minus if between numbers
    .replace(/(\d)\s*=\s*(\d)/g, '$1 equals $2')
    .replace(/(\d)\s*\+\s*(\d)/g, '$1 plus $2')
    .replace(/(\d)\s*\/\s*(\d)/g, '$1 divided by $2')
    .replace(/(\d)\s*\*\s*(\d)/g, '$1 multiplied by $2')
    
    // Fallback for standalone math symbols
    .replace(/\s=\s/g, ' equals ')
    .replace(/\s\+\s/g, ' plus ')
    .replace(/\s\/\s/g, ' divided by ')
    .replace(/\s\*\s/g, ' multiplied by ')
    .replace(/%/g, ' percent ')
    .replace(/\^/g, ' to the power of ')
    
    // 5. Cleanup whitespace
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
): Promise<string[] | null> => {
  const currentKey = (config?.apiKey || API_KEY || '').trim();
  if (!currentKey) return null;

  try {
    const formattedText = prepareTextForSpeech(text);
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
    return audioChunks;
  } catch (error) {
    console.error('Error in Sarvam Service:', error);
    return null;
  }
};
