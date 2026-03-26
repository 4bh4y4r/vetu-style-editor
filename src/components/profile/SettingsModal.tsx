import { useState, useEffect } from 'react';
import { X, LogOut, Save, Loader2, Ruler, UserCircle2, Palette } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Profile } from '@/types';

interface SettingsModalProps {
  open: boolean;
  profile: Profile | null;
  onClose: () => void;
  onUpdate: (updates: Partial<Profile>) => Promise<{ error: any }>;
}

const BODY_TYPES = ['Slim', 'Athletic', 'Average', 'Curvy', 'Plus Size'];
const SKIN_TONES = ['Very Light', 'Light', 'Medium', 'Olive', 'Dark', 'Very Dark'];

const SettingsModal = ({ open, profile, onClose, onUpdate }: SettingsModalProps) => {
  const { signOut } = useAuth();
  const [height, setHeight] = useState(profile?.height_cm || '');
  const [bodyType, setBodyType] = useState(profile?.body_type || '');
  const [skinTone, setSkinTone] = useState(profile?.skin_tone || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open && profile) {
      setHeight(profile.height_cm || '');
      setBodyType(profile.body_type || '');
      setSkinTone(profile.skin_tone || '');
    }
  }, [open, profile]);

  const handleSaveBodyProfile = async () => {
    setIsSaving(true);
    try {
      const { error } = await onUpdate({
        height_cm: height ? parseInt(height.toString()) : null,
        body_type: bodyType || null,
        skin_tone: skinTone || null,
      });

      if (error) throw new Error('Failed to update body profile');
      toast.success('Body profile updated!');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Error saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    onClose();
    await signOut();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center sm:items-end bg-foreground/40 backdrop-blur-sm p-4 sm:p-0" onClick={onClose}>
      <div
        className="w-full max-w-md bg-background rounded-2xl sm:rounded-b-none sm:rounded-t-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: 'calc(100vh - 2rem)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-3 shrink-0 border-b border-border/30">
          <h2 className="text-lg font-display font-bold text-foreground">Settings</h2>
          <button onClick={onClose} disabled={isSaving} className="text-muted-foreground hover:text-foreground p-1 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-8">
          
          {/* Body Profile Section */}
          <section>
            <div className="mb-4">
              <h3 className="text-sm border-b border-border pb-2 font-bold flex items-center gap-2 mb-4">
                <UserCircle2 size={16} className="text-primary" /> Body Profile
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                These details help the AI Stylist give you better and more personalized recommendations.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                  <Ruler size={12} /> Height (cm)
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="e.g. 175"
                  className="w-full px-4 py-2.5 rounded-xl bg-secondary text-foreground text-sm font-body outline-none focus:ring-2 focus:ring-primary/50 transition border border-transparent focus:border-primary/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                  Body Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {BODY_TYPES.map(type => (
                    <button
                      key={type}
                      onClick={() => setBodyType(type)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full transition border ${
                        bodyType === type 
                          ? 'bg-primary text-primary-foreground border-primary' 
                          : 'bg-secondary text-foreground border-transparent hover:border-border'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                  <Palette size={12} /> Skin Tone
                </label>
                <div className="flex flex-wrap gap-2">
                  {SKIN_TONES.map(tone => (
                    <button
                      key={tone}
                      onClick={() => setSkinTone(tone)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full transition border ${
                        skinTone === tone 
                          ? 'bg-primary text-primary-foreground border-primary' 
                          : 'bg-secondary text-foreground border-transparent hover:border-border'
                      }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSaveBodyProfile}
                disabled={isSaving}
                className="w-full mt-2 py-3 rounded-xl bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {isSaving ? 'Saving...' : 'Save Body Profile'}
              </button>
            </div>
          </section>

          {/* Account Section */}
          <section>
             <h3 className="text-sm border-b border-border pb-2 font-bold mb-4">Account</h3>
             <button
                onClick={handleLogout}
                className="w-full py-3.5 rounded-xl bg-destructive/10 text-destructive text-sm font-semibold hover:bg-destructive/20 transition flex items-center justify-center gap-2"
              >
                <LogOut size={16} /> Log Out
              </button>
          </section>

        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
