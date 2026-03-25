import { useState, useRef } from 'react';
import { X, Upload, Eye, EyeOff, Camera } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface UploadOutfitModalProps {
  open: boolean;
  date: Date;
  onClose: () => void;
  onUploaded: () => void;
}

const UploadOutfitModal = ({ open, date, onClose, onUploaded }: UploadOutfitModalProps) => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const handleUpload = async () => {
    if (!file || !user) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/outfits/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('wardrobe').upload(path, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('wardrobe').getPublicUrl(path);

      const { error: insertError } = await supabase.from('outfit_posts').insert({
        user_id: user.id,
        image_url: urlData.publicUrl,
        outfit_date: format(date, 'yyyy-MM-dd'),
        is_public: isPublic,
        notes: notes.trim() || null,
      });
      if (insertError) throw insertError;

      toast.success('Outfit saved!');
      onUploaded();
      onClose();
      setFile(null);
      setPreview(null);
      setNotes('');
      setIsPublic(false);
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center sm:items-end bg-black/60 p-4 sm:p-0" onClick={onClose}>
      <div
        className="w-full max-w-md bg-card rounded-2xl sm:rounded-b-none sm:rounded-t-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: 'calc(100vh - 2rem)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 shrink-0 border-b border-border/30">
          <h3 className="text-base font-display font-bold text-foreground">
            Log Outfit — {format(date, 'MMM d, yyyy')}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
          {/* Upload area */}
          {preview ? (
            <div className="relative rounded-xl overflow-hidden mb-4" style={{ maxHeight: '35vh' }}>
              <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-xl" style={{ maxHeight: '35vh' }} />
              <button
                onClick={() => { setFile(null); setPreview(null); }}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full aspect-[3/4] max-h-[35vh] rounded-xl border-2 border-dashed border-border bg-secondary/30 flex flex-col items-center justify-center gap-2 mb-4 hover:border-primary/40 transition"
            >
              <Camera size={32} className="text-muted-foreground" />
              <span className="text-sm font-body text-muted-foreground">Tap to add outfit photo</span>
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

          {/* Notes */}
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add a note (optional)"
            className="w-full px-3 py-2 rounded-lg bg-secondary text-foreground text-sm font-body placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition mb-3"
          />

          {/* Visibility toggle */}
          <button
            onClick={() => setIsPublic(!isPublic)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg w-full text-sm font-body font-medium transition ${
              isPublic ? 'bg-accent/15 text-accent' : 'bg-secondary text-muted-foreground'
            }`}
          >
            {isPublic ? <Eye size={16} /> : <EyeOff size={16} />}
            {isPublic ? 'Public — visible on your feed' : 'Private — only you can see this'}
          </button>
        </div>

        {/* Fixed button at bottom */}
        <div className="px-5 py-4 border-t border-border/50 shrink-0">
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-body font-semibold text-sm disabled:opacity-50 transition hover:brightness-110"
          >
            {uploading ? 'Saving...' : 'Save Outfit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadOutfitModal;
