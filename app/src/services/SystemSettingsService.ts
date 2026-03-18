import { supabase } from './supabase';

export interface AISettings {
  id?: string;
  ai_provider: 'gemini' | 'groq' | 'openai';
  gemini_model: string;
  groq_model: string;
  sarvam_speaker: string;
  sarvam_model: string;
  sarvam_api_key?: string;
  gemini_api_key?: string;
  groq_api_key?: string;
  updated_at?: string;
}

const DEFAULT_SETTINGS: AISettings = {
  id: '00000000-0000-0000-0000-000000000001',
  ai_provider: 'gemini',
  gemini_model: 'gemini-1.5-flash',
  groq_model: 'llama-3.1-70b-versatile',
  sarvam_speaker: 'anushka',
  sarvam_model: 'bulbul:v2'
};

export class SystemSettingsService {
  private static table = 'system_settings';

  static async getSettings(): Promise<AISettings> {
    try {
      const { data, error } = await supabase
        .from(this.table)
        .select('*')
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // Record not found
          return DEFAULT_SETTINGS;
        }
        console.warn('Error fetching system settings from DB:', error);
        return DEFAULT_SETTINGS;
      }

      return data as AISettings;
    } catch (err) {
      console.error('Fatal error in getSettings:', err);
      return DEFAULT_SETTINGS;
    }
  }

  static async updateSettings(settings: Partial<AISettings>): Promise<boolean> {
    try {
      // We only ever want one row for global settings (id: '1')
      const current = await this.getSettings();
      const payload = { 
        ...current, 
        ...settings, 
        id: current.id || '00000000-0000-0000-0000-000000000001',
        updated_at: new Date().toISOString() 
      };
      
      console.log('Upserting settings payload:', payload);

      const { error } = await supabase
        .from(this.table)
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.error('Error updating system settings:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Fatal error in updateSettings:', err);
      return false;
    }
  }
}
