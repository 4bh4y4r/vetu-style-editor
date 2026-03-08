import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, MoreVertical } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import AddPinModal from './AddPinModal';

interface Pin {
  id: string;
  image_url: string;
  title: string | null;
}

interface BoardDetailProps {
  boardId: string;
  boardName: string;
  onBack: () => void;
  onDeleteBoard: () => void;
}

const BoardDetail = ({ boardId, boardName, onBack, onDeleteBoard }: BoardDetailProps) => {
  const { user } = useAuth();
  const [pins, setPins] = useState<Pin[]>([]);
  const [showAddPin, setShowAddPin] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const fetchPins = async () => {
    const { data } = await supabase
      .from('board_pins')
      .select('id, image_url, title')
      .eq('board_id', boardId)
      .order('created_at', { ascending: false });
    if (data) setPins(data);
  };

  useEffect(() => {
    fetchPins();
  }, [boardId]);

  const deletePin = async (pinId: string) => {
    await supabase.from('board_pins').delete().eq('id', pinId);
    setPins((prev) => prev.filter((p) => p.id !== pinId));
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={onBack} className="text-foreground hover:text-muted-foreground transition">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-base font-display font-bold text-foreground">{boardName}</h2>
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="text-muted-foreground hover:text-foreground transition">
            <MoreVertical size={20} />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-8 bg-card border border-border rounded-xl shadow-lg py-1 z-50 min-w-[140px]">
              <button
                onClick={() => {
                  setShowMenu(false);
                  onDeleteBoard();
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-body text-destructive hover:bg-secondary transition"
              >
                <Trash2 size={14} /> Delete Board
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Pin grid */}
      <div className="columns-2 gap-3 px-4">
        {pins.map((pin) => (
          <div
            key={pin.id}
            className="break-inside-avoid mb-3 rounded-xl overflow-hidden bg-card border border-border group relative"
          >
            <img src={pin.image_url} alt={pin.title || ''} className="w-full object-cover" loading="lazy" />
            {pin.title && (
              <p className="px-2.5 py-2 text-xs font-body text-foreground truncate">{pin.title}</p>
            )}
            <button
              onClick={() => deletePin(pin.id)}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {pins.length === 0 && (
        <div className="py-16 text-center px-4">
          <p className="text-sm font-body font-medium text-foreground">No pins yet</p>
          <p className="text-xs font-body text-muted-foreground mt-1">Tap + to add your first pin</p>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setShowAddPin(true)}
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center z-40 hover:scale-105 transition-transform"
        aria-label="Add pin"
      >
        <Plus size={24} />
      </button>

      <AddPinModal
        open={showAddPin}
        boardId={boardId}
        onClose={() => setShowAddPin(false)}
        onAdded={fetchPins}
      />
    </div>
  );
};

export default BoardDetail;
