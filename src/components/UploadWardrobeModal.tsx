import { useState, useRef } from 'react';
import { X, Upload, Camera } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const CATEGORIES = ['Tops', 'Bottoms', 'Dresses', 'Shoes', 'Accessories', 'Outerwear', 'Other'];

interface UploadWardrobeModalProps {
  open: boolean;
  onClose: () => void;
  onUploaded: () => void;
}

const UploadWardrobeModal = ({ open, onClose, onUploaded }: UploadWardrobeModalProps) => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [category, setCategory] = useState('Tops');
  const [name, setName] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleUpload = async () => {
    if (!file || !user) return;
    setUploading(true);

    const ext = file.name.split('.').pop();
    const filePath = `${user.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage.from('wardrobe').upload(filePath, file);
    if (uploadError) {
      toast.error('Failed to upload image');
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('wardrobe').getPublicUrl(filePath);

    const { error: dbError } = await supabase.from('wardrobe_items').insert({
      user_id: user.id,
      image_url: publicUrl,
      category,
      name: name.trim() || null,
    });

    setUploading(false);
    if (dbError) {
      toast.error('Failed to save item');
    } else {
      toast.success('Item added to wardrobe!');
      setFile(null);
      setPreview(null);
      setName('');
      setCategory('Tops');
      onUploaded();
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-background rounded-t-2xl p-5 pb-8 animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-bold text-foreground">Add to Wardrobe</h2>
          <button onClick={onClose} className="text-muted-foreground p-1">
            <X size={20} />
          </button>
        </div>

        {/* Image picker */}
        {preview ? (
          <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-4">
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            <button
              onClick={() => { setFile(null); setPreview(null); }}
              className="absolute top-2 right-2 bg-foreground/60 text-background rounded-full p-1"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-[4/3] rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 mb-4 text-muted-foreground hover:border-primary transition"
          >
            <Camera size={32} />
            <span className="text-sm font-body">Tap to add photo</span>
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {/* Name */}
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Item name (optional)"
          className="w-full px-4 py-2.5 rounded-lg bg-secondary text-foreground text-sm font-body placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary transition mb-3"
        />

        {/* Category chips */}
        <div className="flex flex-wrap gap-2 mb-5">
          {CATEGORIES.map(cat => (
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

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full py-3 rounded-lg bg-primary text-primary-foreground text-sm font-body font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Upload size={16} />
          {uploading ? 'Uploading...' : 'Add Item'}
        </button>
      </div>
    </div>
  );
};

export default UploadWardrobeModal;
