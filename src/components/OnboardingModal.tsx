import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Ruler, User, Palette, ArrowRight, Check } from 'lucide-react';

const BODY_TYPES = ['Slim', 'Athletic', 'Average', 'Curvy', 'Plus Size'] as const;
const SKIN_TONES = [
  { label: 'Fair', color: '#FDEBD0' },
  { label: 'Light', color: '#F5CBA7' },
  { label: 'Medium', color: '#E0AC69' },
  { label: 'Olive', color: '#C68642' },
  { label: 'Brown', color: '#8D5524' },
  { label: 'Dark', color: '#5C3317' },
] as const;

interface OnboardingModalProps {
  open: boolean;
  onComplete: () => void;
}

const OnboardingModal = ({ open, onComplete }: OnboardingModalProps) => {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [height, setHeight] = useState('');
  const [bodyType, setBodyType] = useState('');
  const [skinTone, setSkinTone] = useState('');
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const steps = [
    { icon: Ruler, title: "What's your height?", subtitle: 'Helps us recommend the right fits' },
    { icon: User, title: "What's your body type?", subtitle: 'For better silhouette suggestions' },
    { icon: Palette, title: "What's your skin tone?", subtitle: 'So we can suggest flattering colors' },
  ];

  const canNext =
    (step === 0 && height.trim() !== '') ||
    (step === 1 && bodyType !== '') ||
    (step === 2 && skinTone !== '');

  const handleNext = async () => {
    if (step < 2) {
      setStep(step + 1);
      return;
    }

    // Final step — save to DB
    if (!user) return;
    setSaving(true);
    const heightNum = parseInt(height);

    const { error } = await supabase
      .from('profiles')
      .update({
        height_cm: isNaN(heightNum) ? null : heightNum,
        body_type: bodyType || null,
        skin_tone: skinTone || null,
        onboarding_complete: true,
      })
      .eq('user_id', user.id);

    if (error) {
      toast.error('Failed to save profile');
      console.error(error);
    } else {
      toast.success('Profile set up! 🎉');
      onComplete();
    }
    setSaving(false);
  };

  const handleSkip = async () => {
    if (!user) return;
    await supabase
      .from('profiles')
      .update({ onboarding_complete: true })
      .eq('user_id', user.id);
    onComplete();
  };

  const CurrentIcon = steps[step].icon;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Progress bar */}
      <div className="flex gap-1.5 px-6 pt-6">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all ${
              i <= step ? 'bg-primary' : 'bg-muted'
            }`}
          />
        ))}
      </div>

      {/* Skip */}
      <div className="flex justify-end px-6 pt-3">
        <button
          onClick={handleSkip}
          className="text-xs font-body text-muted-foreground hover:text-foreground transition"
        >
          Skip for now
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-5">
          <CurrentIcon size={24} className="text-primary" />
        </div>
        <h2 className="text-xl font-display font-bold text-foreground text-center mb-1">
          {steps[step].title}
        </h2>
        <p className="text-sm font-body text-muted-foreground text-center mb-8">
          {steps[step].subtitle}
        </p>

        {/* Step 0: Height */}
        {step === 0 && (
          <div className="w-full max-w-xs">
            <div className="relative">
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="170"
                min={100}
                max={250}
                className="w-full text-center text-3xl font-display font-bold px-4 py-4 rounded-2xl bg-secondary text-foreground placeholder:text-muted-foreground/40 outline-none focus:ring-2 focus:ring-primary/30 transition"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-body text-muted-foreground">
                cm
              </span>
            </div>
            <p className="text-xs font-body text-muted-foreground text-center mt-2">
              Enter your height in centimeters
            </p>
          </div>
        )}

        {/* Step 1: Body Type */}
        {step === 1 && (
          <div className="w-full max-w-xs space-y-2">
            {BODY_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setBodyType(type)}
                className={`w-full px-4 py-3 rounded-xl text-sm font-body font-medium transition flex items-center justify-between ${
                  bodyType === type
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-foreground hover:bg-muted'
                }`}
              >
                {type}
                {bodyType === type && <Check size={16} />}
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Skin Tone */}
        {step === 2 && (
          <div className="w-full max-w-xs">
            <div className="grid grid-cols-3 gap-3">
              {SKIN_TONES.map((tone) => (
                <button
                  key={tone.label}
                  onClick={() => setSkinTone(tone.label)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl transition ${
                    skinTone === tone.label
                      ? 'bg-primary/10 ring-2 ring-primary'
                      : 'bg-secondary hover:bg-muted'
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-full border-2 border-border shadow-sm"
                    style={{ backgroundColor: tone.color }}
                  />
                  <span className="text-xs font-body font-medium text-foreground">
                    {tone.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom button */}
      <div className="px-6 pb-8">
        <button
          onClick={handleNext}
          disabled={!canNext || saving}
          className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-body font-semibold text-sm disabled:opacity-40 transition hover:brightness-110 flex items-center justify-center gap-2"
        >
          {saving ? 'Saving...' : step < 2 ? 'Continue' : 'Finish Setup'}
          {!saving && (step < 2 ? <ArrowRight size={16} /> : <Check size={16} />)}
        </button>
      </div>
    </div>
  );
};

export default OnboardingModal;
