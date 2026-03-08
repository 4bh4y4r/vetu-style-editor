import { useState } from 'react';
import { X } from 'lucide-react';

interface CreateBoardModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (name: string) => void;
}

const CreateBoardModal = ({ open, onClose, onCreated }: CreateBoardModalProps) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    await onCreated(name.trim());
    setName('');
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-card rounded-t-2xl p-5 animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-bold text-foreground">Create Board</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Board name (e.g. Summer Vibes)"
            className="w-full px-4 py-3 rounded-xl bg-secondary text-foreground text-sm font-body placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary transition mb-4"
            autoFocus
          />
          <button
            type="submit"
            disabled={!name.trim() || loading}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-body font-semibold disabled:opacity-50 transition"
          >
            {loading ? 'Creating...' : 'Create Board'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateBoardModal;
