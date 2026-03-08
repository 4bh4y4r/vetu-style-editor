import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Board {
  id: string;
  name: string;
}

interface SaveToBoardModalProps {
  open: boolean;
  imageUrl: string;
  title?: string;
  onClose: () => void;
}

const SaveToBoardModal = ({ open, imageUrl, title, onClose }: SaveToBoardModalProps) => {
  const { user } = useAuth();
  const [boards, setBoards] = useState<Board[]>([]);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [newBoardName, setNewBoardName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!open || !user) return;
    supabase
      .from('boards')
      .select('id, name')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setBoards(data);
      });
    setSaved(null);
  }, [open, user]);

  if (!open) return null;

  const handleSave = async (boardId: string) => {
    if (!user) return;
    setSaving(boardId);
    await supabase.from('board_pins').insert({
      board_id: boardId,
      user_id: user.id,
      image_url: imageUrl,
      title: title || null,
    });
    setSaving(null);
    setSaved(boardId);
    setTimeout(onClose, 600);
  };

  const handleCreateAndSave = async () => {
    if (!user || !newBoardName.trim()) return;
    setCreating(true);
    const { data } = await supabase
      .from('boards')
      .insert({ user_id: user.id, name: newBoardName.trim() })
      .select('id, name')
      .single();
    if (data) {
      setBoards((prev) => [data, ...prev]);
      setNewBoardName('');
      setCreating(false);
      await handleSave(data.id);
    } else {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={onClose}>
      <div className="w-full max-w-lg bg-card rounded-t-2xl p-5 animate-fade-in max-h-[70vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-bold text-foreground">Save to Board</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition">
            <X size={20} />
          </button>
        </div>

        {/* Quick create */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.target.value)}
            placeholder="New board name..."
            className="flex-1 px-3 py-2 rounded-lg bg-secondary text-foreground text-sm font-body placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary transition"
          />
          <button
            onClick={handleCreateAndSave}
            disabled={!newBoardName.trim() || creating}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-body font-semibold disabled:opacity-50 transition"
          >
            {creating ? '...' : 'Create & Save'}
          </button>
        </div>

        {/* Board list */}
        <div className="overflow-y-auto flex-1 space-y-1">
          {boards.map((board) => (
            <button
              key={board.id}
              onClick={() => handleSave(board.id)}
              disabled={saving === board.id || saved === board.id}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-secondary transition text-left"
            >
              <span className="text-sm font-body font-medium text-foreground">{board.name}</span>
              {saved === board.id ? (
                <Check size={16} className="text-green-500" />
              ) : saving === board.id ? (
                <span className="text-xs text-muted-foreground">Saving...</span>
              ) : null}
            </button>
          ))}
          {boards.length === 0 && (
            <p className="text-sm font-body text-muted-foreground text-center py-6">
              No boards yet. Create one above!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SaveToBoardModal;
