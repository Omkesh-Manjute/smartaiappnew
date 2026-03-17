/**
 * Sarvam AI TTS Service
 * Documentation: https://www.sarvam.ai/
 */

const SARVAM_API_URL = 'https://api.sarvam.ai/text-to-speech';
const API_KEY = (import.meta.env.VITE_SARVAM_API_KEY || '').trim();

export interface SarvamTTSRequest {
  inputs: string[];
  target_language_code: string;
  speaker?: string;
  pitch?: number;
  pace?: number;
  loudness?: number;
  speech_sample_rate?: number;
  model?: string;
}

export const getSarvamAudio = async (text: string, lang: 'hi' | 'en' = 'hi'): Promise<string | null> => {
  const hasKey = !!API_KEY;
  console.log('Sarvam TTS Service Call:', { 
    text: text.substring(0, 50) + '...', 
    lang, 
    hasKey, 
    keyLength: API_KEY?.length 
  });
  
  if (!API_KEY) {
    console.warn('Sarvam API key (VITE_SARVAM_API_KEY) missing in .env');
    return null;
  }

  try {
    const response = await fetch(SARVAM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': API_KEY,
      },
      body: JSON.stringify({
        inputs: [text],
        target_language_code: lang === 'hi' ? 'hi-IN' : 'en-IN',
        speaker: lang === 'hi' ? 'hi-IN-female-1' : 'en-IN-female-1', // Default high-quality voices
        pitch: 0,
        pace: 1.0,
        loudness: 1.5,
        speech_sample_rate: 22050,
        model: 'bulbul:v1'
      } as SarvamTTSRequest),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Sarvam API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Sarvam API Response:', data);
    
    // The API returns a base64 encoded string in the 'audios' array
    if (data.audios && data.audios.length > 0) {
      return `data:audio/wav;base64,${data.audios[0]}`;
    }

    console.warn('Sarvam API returned no audio data');
    return null;
  } catch (error) {
    console.error('Error fetching audio from Sarvam AI:', error);
    return null;
  }
};
