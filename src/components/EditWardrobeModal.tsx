import { useState, useRef, useEffect } from 'react';
import { X, Camera, Trash2, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { WARDROBE_CATEGORIES } from '@/constants';
import type { WardrobeItem } from '@/types';

interface EditWardrobeModalProps {
  open: boolean;
  item: WardrobeItem | null;
  onClose: () => void;
  onUpdated: () => void;
}

const EditWardrobeModal = ({ open, item, onClose, onUpdated }: EditWardrobeModalProps) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [newFile, setNewFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (item) {
      setName(item.name || '');
      setCategory(item.category);
      setPreview(item.image_url);
      setNewFile(null);
      setConfirmDelete(false);
    }
  }, [item]);

  const handleFile = (f: File) => {
    setNewFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSave = async () => {
    if (!item || !user) return;
    setSaving(true);

    let imageUrl = item.image_url;

    if (newFile) {
      const ext = newFile.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from('wardrobe').upload(filePath, newFile);
      if (uploadErr) {
        toast.error('Failed to upload new image');
        setSaving(false);
        return;
      }
      const { data: { publicUrl } } = supabase.storage.from('wardrobe').getPublicUrl(filePath);
      imageUrl = publicUrl;
    }

    const { error } = await supabase
      .from('wardrobe_items')
      .update({ name: name.trim() || null, category, image_url: imageUrl })
      .eq('id', item.id);

    setSaving(false);
    if (error) {
      toast.error('Failed to save changes');
    } else {
      toast.success('Item updated!');
      onUpdated();
      onClose();
    }
  };

  const handleDelete = async () => {
    if (!item) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    const { error } = await supabase.from('wardrobe_items').delete().eq('id', item.id);
    setDeleting(false);
    if (error) {
      toast.error('Failed to delete item');
    } else {
      toast.success('Item removed from wardrobe');
      onUpdated();
      onClose();
    }
  };

  if (!open || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg bg-background rounded-t-2xl p-5 pb-8 animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-bold text-foreground">Edit Item</h2>
          <button onClick={onClose} className="text-muted-foreground p-1"><X size={20} /></button>
        </div>

        {/* Image */}
        <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-4">
          <img src={preview || item.image_url} alt={item.category} className="w-full h-full object-cover" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-2 right-2 bg-foreground/70 text-background rounded-full p-2 hover:bg-foreground/90 transition"
          >
            <Camera size={16} />
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
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
        <div className="flex flex-wrap gap-2 mb-5">
          {WARDROBE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-body font-medium transition ${
                category === cat ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleDelete}
            disabled={saving || deleting}
            className={`flex-1 py-3 rounded-lg text-sm font-body font-semibold flex items-center justify-center gap-2 transition ${
              confirmDelete
                ? 'bg-destructive text-destructive-foreground'
                : 'bg-secondary text-destructive hover:bg-destructive/10'
            } disabled:opacity-50`}
          >
            <Trash2 size={16} />
            {deleting ? 'Deleting...' : confirmDelete ? 'Confirm Delete' : 'Delete'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || deleting}
            className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-body font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditWardrobeModal;
