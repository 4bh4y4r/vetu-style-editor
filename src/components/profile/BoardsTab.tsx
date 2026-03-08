import { Search, FolderPlus, LayoutGrid } from 'lucide-react';
import { useState } from 'react';
import type { Board } from '@/types';
import CreateBoardModal from '@/components/CreateBoardModal';

interface BoardsTabProps {
  boards: Board[];
  onSelectBoard: (board: Board) => void;
  onCreateBoard: (name: string) => void;
}

const BoardsTab = ({ boards, onSelectBoard, onCreateBoard }: BoardsTabProps) => {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="px-4">
      {/* Search + create */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search boards..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-secondary text-foreground text-sm font-body placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-gold transition"
          />
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="p-2 rounded-lg bg-secondary text-primary hover:bg-muted transition"
        >
          <FolderPlus size={18} />
        </button>
      </div>

      {/* Board grid */}
      <div className="grid grid-cols-2 gap-3">
        {boards.map((board) => (
          <button
            key={board.id}
            onClick={() => onSelectBoard(board)}
            className="rounded-xl overflow-hidden bg-card border border-border text-left hover:border-gold/40 transition"
          >
            <div className="grid grid-cols-2 gap-0.5 aspect-square">
              {board.pins.slice(0, 4).map((pin, i) => (
                <div key={i} className="overflow-hidden bg-secondary">
                  <img
                    src={pin.image_url}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
              {Array.from({ length: Math.max(0, 4 - board.pins.length) }).map((_, i) => (
                <div key={`empty-${i}`} className="bg-secondary" />
              ))}
            </div>
            <div className="px-3 py-2.5">
              <p className="text-sm font-body font-semibold text-foreground truncate">
                {board.name}
              </p>
              <p className="text-xs font-body text-muted-foreground">{board.pins.length} Pins</p>
            </div>
          </button>
        ))}
      </div>

      {/* Empty state */}
      {boards.length === 0 && (
        <div className="py-12 text-center">
          <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3">
            <LayoutGrid size={24} className="text-muted-foreground" />
          </div>
          <p className="text-sm font-body font-medium text-foreground">No boards yet</p>
          <p className="text-xs font-body text-muted-foreground mt-1">
            Create a board to start pinning your interests
          </p>
        </div>
      )}

      <CreateBoardModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={onCreateBoard}
      />
    </div>
  );
};

export default BoardsTab;
