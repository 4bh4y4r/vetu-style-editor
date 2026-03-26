import { useState, useRef, useEffect } from 'react';
import { X, Camera, Save, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Profile } from '@/types';

interface EditProfileModalProps {
  open: boolean;
  profile: Profile | null;
  onClose: () => void;
  onUpdate: (updates: Partial<Profile>) => Promise<{ error: any }>;
}

const EditProfileModal = ({ open, profile, onClose, onUpdate }: EditProfileModalProps) => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar_url || null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && profile) {
      setDisplayName(profile.display_name || '');
      setBio(profile.bio || '');
      setAvatarPreview(profile.avatar_url || null);
      setAvatarFile(null);
    }
  }, [open, profile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      const url = URL.createObjectURL(file);
      if (avatarPreview && !profile?.avatar_url?.includes(avatarPreview)) {
        URL.revokeObjectURL(avatarPreview);
      }
      setAvatarPreview(url);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    let newAvatarUrl = profile?.avatar_url;

    try {
      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop();
        const filePath = `${user.id}/avatar_${Date.now()}.${ext}`;
        
        const { error: uploadError } = await supabase.storage
          .from('wardrobe') // Using correct bucket
          .upload(filePath, avatarFile);
          
        if (uploadError) throw new Error('Failed to upload profile picture');

        const { data: { publicUrl } } = supabase.storage
          .from('wardrobe')
          .getPublicUrl(filePath);
          
        newAvatarUrl = publicUrl;
      }

      const { error } = await onUpdate({
        display_name: displayName.trim(),
        bio: bio.trim(),
        avatar_url: newAvatarUrl,
      });

      if (error) throw new Error('Failed to update profile');
      toast.success('Profile updated successfully!');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Error saving profile');
    } finally {
      setIsSaving(false);
    }
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
          <h2 className="text-lg font-display font-bold text-foreground">Edit Profile</h2>
          <button onClick={onClose} disabled={isSaving} className="text-muted-foreground hover:text-foreground p-1 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6">
          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-3">
              <img
                src={avatarPreview || `https://ui-avatars.com/api/?name=${displayName || 'User'}&background=F5E6F0&color=D4648A`}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover border-4 border-secondary shadow-sm"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center border-2 border-background shadow-sm hover:scale-105 transition"
              >
                <Camera size={16} />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <p className="text-xs text-muted-foreground">Tap to change profile picture</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-2.5 rounded-xl bg-secondary text-foreground text-sm font-body outline-none focus:ring-2 focus:ring-primary/50 transition border border-transparent focus:border-primary/30"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write something about yourself"
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl bg-secondary text-foreground text-sm font-body outline-none focus:ring-2 focus:ring-primary/50 transition border border-transparent focus:border-primary/30 resize-none"
              />
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-border/50 shrink-0">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {isSaving ? 'Saving changes...' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
