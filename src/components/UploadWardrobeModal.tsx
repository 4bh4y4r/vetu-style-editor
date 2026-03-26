import { useState, useRef } from 'react';
import { X, Upload, Camera } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { WARDROBE_CATEGORIES } from '@/constants';

interface UploadWardrobeModalProps {
  open: boolean;
  onClose: () => void;
  onUploaded: () => void;
}

const UploadWardrobeModal = ({ open, onClose, onUploaded }: UploadWardrobeModalProps) => {
  const { user } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [category, setCategory] = useState<string>(WARDROBE_CATEGORIES[0]);
  const [name, setName] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (selectedFiles: FileList | File[]) => {
    const newFiles = Array.from(selectedFiles).slice(0, 10);
    if (selectedFiles.length > 10) {
      toast.warning('Only up to 10 images can be uploaded at once. The first 10 were selected.');
    }
    setFiles(newFiles);
    previews.forEach((p) => URL.revokeObjectURL(p));
    setPreviews(newFiles.map((f) => URL.createObjectURL(f)));
  };

  const handleUpload = async () => {
    if (files.length === 0 || !user) return;
    setUploading(true);

    let successes = 0;

    for (const file of files) {
      const ext = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;

      const { error: uploadError } = await supabase.storage.from('wardrobe').upload(filePath, file);
      if (uploadError) {
        toast.error(`Failed to upload ${file.name}`);
        continue;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('wardrobe').getPublicUrl(filePath);

      const { error: dbError } = await supabase.from('wardrobe_items').insert({
        user_id: user.id,
        image_url: publicUrl,
        category,
        name: name.trim() || null,
      });

      if (dbError) {
        toast.error(`Failed to save ${file.name}`);
      } else {
        successes++;
      }
    }

    setUploading(false);
    if (successes > 0) {
      toast.success(`Successfully added ${successes} item${successes > 1 ? 's' : ''}!`);
      setFiles([]);
      previews.forEach((p) => URL.revokeObjectURL(p));
      setPreviews([]);
      setName('');
      setCategory(WARDROBE_CATEGORIES[0]);
      onUploaded();
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center sm:items-end bg-foreground/40 backdrop-blur-sm p-4 sm:p-0" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-background rounded-2xl sm:rounded-b-none sm:rounded-t-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: 'calc(100vh - 2rem)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 shrink-0 border-b border-border/30">
          <h2 className="text-lg font-display font-bold text-foreground">Add to Wardrobe</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
          {/* Image picker */}
          {previews.length > 0 ? (
            <div className="grid grid-cols-4 gap-2 mb-4">
              {previews.map((preview, idx) => (
                <div key={idx} className="relative aspect-square w-full rounded-lg overflow-hidden border border-border">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    onClick={() => {
                        const newFiles = [...files];
                        const newPreviews = [...previews];
                        newFiles.splice(idx, 1);
                        newPreviews.splice(idx, 1);
                        URL.revokeObjectURL(preview);
                        setFiles(newFiles);
                        setPreviews(newPreviews);
                    }}
                    className="absolute top-1 right-1 bg-foreground/60 text-background rounded-full p-0.5"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-[4/3] max-h-[35vh] rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 mb-4 text-muted-foreground hover:border-primary transition"
            >
              <Camera size={32} />
              <span className="text-sm font-body">Tap to add photo</span>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />

          {/* Name */}
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Item name (optional)"
            className="w-full px-4 py-2.5 rounded-lg bg-secondary text-foreground text-sm font-body placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary transition mb-3"
          />

          {/* Category chips */}
          <div className="flex flex-wrap gap-2">
            {WARDROBE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-body font-medium transition ${
                  category === cat
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Fixed button at bottom */}
        <div className="px-5 py-4 border-t border-border/50 shrink-0">
          <button
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground text-sm font-body font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Upload size={16} />
            {uploading ? 'Uploading...' : `Add ${files.length > 0 ? files.length : ''} Item${files.length > 1 ? 's' : ''}`.trim()}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadWardrobeModal;
