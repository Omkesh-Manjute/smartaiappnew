import { useState, useEffect } from 'react';
import { SystemSettingsService, type AISettings } from '@/services/SystemSettingsService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  Brain, 
  Mic, 
  Key, 
  Save, 
  RefreshCcw, 
  Radio, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';

const AdminAISettingsPage = () => {
  const [settings, setSettings] = useState<AISettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    const data = await SystemSettingsService.getSettings();
    setSettings(data);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    const success = await SystemSettingsService.updateSettings(settings);
    if (success) {
      toast.success('AI Settings updated successfully!');
    } else {
      toast.error('Failed to update settings');
    }
    setIsSaving(false);
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <RefreshCcw className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">AI & Speech Configuration</h1>
        <p className="text-muted-foreground mt-2">Manage your platform's AI brain, TTS voices, and API integrations.</p>
      </div>

      <div className="grid gap-8">
        {/* --- AI PROVIDER SETTINGS --- */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
              <Brain className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">AI Intelligence Mode</h2>
          </div>
          
          <Card className="border-blue-100 shadow-sm bg-white/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Tutor Provider</CardTitle>
              <CardDescription>Choose which AI model powers the AI Tutor explanations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 {[
                   { id: 'gemini', name: 'Google Gemini', desc: 'Fast & Rich Explanations', icon: Sparkles, color: 'text-indigo-600' },
                   { id: 'groq', name: 'Groq (Llama 3)', desc: 'Ultrafast Performance', icon: Radio, color: 'text-orange-600' },
                   { id: 'openai', name: 'OpenAI GPT', desc: 'High Reasoning (Coming Soon)', icon: Brain, color: 'text-emerald-600', disabled: true }
                 ].map((provider) => (
                   <div 
                     key={provider.id}
                     onClick={() => !provider.disabled && setSettings({ ...settings!, ai_provider: provider.id as any })}
                     className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                       settings?.ai_provider === provider.id 
                         ? 'border-blue-500 bg-blue-50/50 shadow-md' 
                         : 'border-gray-100 bg-white hover:border-blue-200'
                     } ${provider.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                   >
                     <div className="flex justify-between items-start mb-2">
                       <provider.icon className={`w-5 h-5 ${provider.color}`} />
                       {settings?.ai_provider === provider.id && (
                         <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <ShieldCheck className="w-3 h-3 text-white" />
                         </div>
                       )}
                     </div>
                     <p className="font-bold text-gray-800">{provider.name}</p>
                     <p className="text-xs text-gray-500">{provider.desc}</p>
                   </div>
                 ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                   <Label>Gemini Model</Label>
                   <Select 
                     value={settings?.gemini_model} 
                     onValueChange={(val) => setSettings({ ...settings!, gemini_model: val })}
                   >
                     <SelectTrigger>
                       <SelectValue placeholder="Select Model" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash (Balanced)</SelectItem>
                       <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Reasoning)</SelectItem>
                     </SelectContent>
                   </Select>
                </div>
                <div className="space-y-2">
                   <Label>Groq Model</Label>
                   <Select 
                     value={settings?.groq_model} 
                     onValueChange={(val) => setSettings({ ...settings!, groq_model: val })}
                   >
                     <SelectTrigger>
                       <SelectValue placeholder="Select Model" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="llama-3.1-70b-versatile">Llama 3.1 70B (Versatile)</SelectItem>
                       <SelectItem value="llama-3.1-8b-instant">Llama 3.1 8B (Instant)</SelectItem>
                       <SelectItem value="mixtral-8x7b-32768">Mixtral 8x7B</SelectItem>
                     </SelectContent>
                   </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* --- SPEECH SETTINGS --- */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
              <Mic className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Advanced Speech Engine</h2>
          </div>

          <Card className="border-purple-100 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Sarvam AI Premium Voice</CardTitle>
              <CardDescription>Configure the high-quality Indian TTS engine (Bulbul V2).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Primary Speaker (V2)</Label>
                  <Select 
                    value={settings?.sarvam_speaker} 
                    onValueChange={(val) => setSettings({ ...settings!, sarvam_speaker: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Speaker" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="anushka">Anushka (Professional Female)</SelectItem>
                      <SelectItem value="rupali">Rupali (Kind Teacher)</SelectItem>
                      <SelectItem value="manish">Manish (Calm Male)</SelectItem>
                      <SelectItem value="abhilash">Abhilash (Structured Male)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>TTS Model</Label>
                  <Select 
                    value={settings?.sarvam_model} 
                    onValueChange={(val) => setSettings({ ...settings!, sarvam_model: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bulbul:v2">Bulbul V2 (Recommended)</SelectItem>
                      <SelectItem value="bulbul:v1">Bulbul V1 (Legacy)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* --- API KEYS --- */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
              <Key className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">API Access & Keys</h2>
          </div>

          <Card className="border-orange-100 shadow-sm">
            <CardContent className="pt-6 space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Gemini API Key</Label>
                  <Input 
                    type="password" 
                    placeholder="sk-gemini-..." 
                    value={settings?.gemini_api_key || ''}
                    onChange={(e) => setSettings({ ...settings!, gemini_api_key: e.target.value })}
                  />
                  <p className="text-[10px] text-muted-foreground">Used for intelligence, test generation, and tutoring.</p>
                </div>
                <div className="space-y-2">
                  <Label>Sarvam API Key (Subscription Key)</Label>
                  <Input 
                    type="password" 
                    placeholder="Enter Sarvam Subscription Key" 
                    value={settings?.sarvam_api_key || ''}
                    onChange={(e) => setSettings({ ...settings!, sarvam_api_key: e.target.value })}
                  />
                  <p className="text-[10px] text-muted-foreground">Required for premium Bulbul V2 Hindi speech.</p>
                </div>
                <div className="space-y-2">
                  <Label>Groq API Key (Optional)</Label>
                  <Input 
                    type="password" 
                    placeholder="gsk_..." 
                    value={settings?.groq_api_key || ''}
                    onChange={(e) => setSettings({ ...settings!, groq_api_key: e.target.value })}
                  />
                  <p className="text-[10px] text-muted-foreground">Used if you switch the Tutor Provider to Groq.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* --- DATABASE MANAGEMENT --- */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
              <RefreshCcw className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">System & Database</h2>
          </div>

          <Card className="border-red-100 shadow-sm border-2">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Database Synchronization</CardTitle>
              <CardDescription>Restore missing subjects and tests by syncing sample data to Supabase.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-red-50/50 rounded-xl border border-red-100">
                <div className="space-y-1">
                  <p className="font-bold text-red-900">Restore Sample Data</p>
                  <p className="text-xs text-red-700">This will push the initial Class 5 Subjects and Tests to your database.</p>
                </div>
                <Button 
                  variant="destructive" 
                  className="w-full sm:w-auto font-bold shadow-md"
                  onClick={async () => {
                    const confirm = window.confirm('Bhai, kya aap sure ho? Ye sabhi sample subjects aur tests ko Supabase me sync kar dega.');
                    if (!confirm) return;
                    
                    const loadingToast = toast.loading('Syncing sample data to Supabase...');
                    try {
                      const { seedSampleData } = await import('@/services/supabaseDB');
                      const stats = await seedSampleData();
                      
                      const totalFail = stats.subjects.fail + stats.chapters.fail + stats.mcqs.fail + stats.tests.fail;
                      if (totalFail > 0) {
                        toast.error(`Partial success: ${stats.subjects.success} subjects, ${stats.tests.success} tests. (${totalFail} items failed - check console)`, { id: loadingToast, duration: 5000 });
                      } else {
                        toast.success(`Restored: ${stats.subjects.success} subjects, ${stats.chapters.success} chapters, ${stats.mcqs.success} MCQs, ${stats.tests.success} tests!`, { id: loadingToast, duration: 5000 });
                      }
                    } catch (error) {
                      console.error('Seed error:', error);
                      toast.error('Failed to restore sample data. Check console for details.', { id: loadingToast });
                    }
                  }}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Restore Now
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto font-bold"
                  onClick={async () => {
                    const loadingToast = toast.loading('Running database health check...');
                    try {
                      const { supabase } = await import('@/services/supabase');
                      
                      // Test 1: Connection & Auth
                      const { error: userError } = await supabase.from('users').select('id').limit(1);
                      if (userError) throw new Error('Users table check failed: ' + userError.message);
                      
                      // Test 2: Subjects Table
                      const { error: subError } = await supabase.from('subjects').select('id').limit(1);
                      if (subError) throw new Error('Subjects table check failed: ' + subError.message);
                      
                      toast.success('Database is healthy and reachable!', { id: loadingToast });
                    } catch (error: any) {
                      console.error('Health check failed:', error);
                      toast.error('Health Check Failed: ' + (error.message || 'Check console'), { id: loadingToast, duration: 8000 });
                    }
                  }}
                >
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Health Check
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* --- ACTIONS --- */}
        <div className="flex items-center justify-between p-6 bg-white rounded-2xl border shadow-lg sticky bottom-4 z-10">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                <ShieldCheck className="w-6 h-6" />
             </div>
             <div>
                <p className="font-bold text-gray-800">Configurations Verified</p>
                <p className="text-xs text-gray-500">Settings will take effect immediately after saving.</p>
             </div>
          </div>
          <Button 
            size="lg" 
            className="rounded-xl px-8 gradient-primary font-bold shadow-lg h-12"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Configuration
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminAISettingsPage;
