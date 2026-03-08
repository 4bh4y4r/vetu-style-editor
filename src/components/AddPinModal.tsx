import { useState } from 'react';
import { X, ImagePlus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface AddPinModalProps {
  open: boolean;
  boardId: string;
  onClose: () => void;
  onAdded: () => void;
}

const AddPinModal = ({ open, boardId, onClose, onAdded }: AddPinModalProps) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setImageUrl('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    let finalUrl = imageUrl;

    if (file) {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/pins/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('wardrobe').upload(path, file);
      if (error) {
        setLoading(false);
        return;
      }
      const { data: urlData } = supabase.storage.from('wardrobe').getPublicUrl(path);
      finalUrl = urlData.publicUrl;
    }

    if (!finalUrl) {
      setLoading(false);
      return;
    }

    await supabase.from('board_pins').insert({
      board_id: boardId,
      user_id: user.id,
      image_url: finalUrl,
      title: title.trim() || null,
    });

    setTitle('');
    setImageUrl('');
    setFile(null);
    setPreview(null);
    setLoading(false);
    onAdded();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-card rounded-t-2xl p-5 animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-bold text-foreground">Add Pin</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Image upload */}
          <label className="flex flex-col items-center justify-center w-full h-32 rounded-xl bg-secondary border-2 border-dashed border-border cursor-pointer hover:border-primary transition overflow-hidden">
            {preview ? (
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <>
                <ImagePlus size={24} className="text-muted-foreground mb-1" />
                <span className="text-xs font-body text-muted-foreground">Upload image</span>
              </>
            )}
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>

          <div className="text-center text-xs font-body text-muted-foreground">or paste URL</div>

          <input
            type="url"
            value={imageUrl}
            onChange={e => { setImageUrl(e.target.value); setFile(null); setPreview(null); }}
            placeholder="https://example.com/image.jpg"
            className="w-full px-4 py-2.5 rounded-xl bg-secondary text-foreground text-sm font-body placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary transition"
          />

          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Pin title (optional)"
            className="w-full px-4 py-2.5 rounded-xl bg-secondary text-foreground text-sm font-body placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary transition"
          />

          <button
            type="submit"
            disabled={(!file && !imageUrl) || loading}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-body font-semibold disabled:opacity-50 transition"
          >
            {loading ? 'Adding...' : 'Add Pin'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddPinModal;
