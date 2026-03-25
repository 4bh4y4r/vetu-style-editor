import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, SquarePen, Trash2, Menu } from 'lucide-react';
import AIStylistChat from '@/components/AIStylistChat';
import { useChatHistory } from '@/hooks/useChatHistory';
import type { WardrobeItem } from '@/types';

interface BodyProfile {
  height_cm: number | null;
  body_type: string | null;
  skin_tone: string | null;
}

const AIStylistPage = () => {
  const { user } = useAuth();
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [bodyProfile, setBodyProfile] = useState<BodyProfile | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const {
    conversations,
    activeConversationId,
    loadedMessages,
    createConversation,
    saveMessage,
    loadConversation,
    deleteConversation,
    startNewChat,
  } = useChatHistory();

  useEffect(() => {
    if (!user) return;
    supabase
      .from('wardrobe_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setWardrobeItems(data);
      });

    supabase
      .from('profiles')
      .select('height_cm, body_type, skin_tone')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data) setBodyProfile(data);
      });
  }, [user]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="pb-16 h-screen flex flex-col">
      {/* Minimal top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
            showHistory
              ? 'bg-foreground text-background'
              : 'text-foreground hover:bg-secondary'
          }`}
          aria-label="Chat history"
        >
          <Menu size={18} strokeWidth={1.8} />
        </button>

        <span className="text-sm font-medium text-foreground">AI Stylist</span>

        <button
          onClick={() => {
            startNewChat();
            setShowHistory(false);
          }}
          className="w-9 h-9 rounded-full flex items-center justify-center text-foreground hover:bg-secondary transition-colors"
          aria-label="New chat"
        >
          <SquarePen size={18} strokeWidth={1.8} />
        </button>
      </div>

      {/* Slide-down history panel */}
      {showHistory && (
        <div className="border-b border-border/50 bg-background max-h-72 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="py-10 text-center">
              <MessageSquare size={18} className="mx-auto text-muted-foreground/60 mb-2" />
              <p className="text-xs text-muted-foreground">No past chats</p>
            </div>
          ) : (
            <div className="py-1">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors hover:bg-secondary/60 ${
                    activeConversationId === conv.id ? 'bg-secondary' : ''
                  }`}
                  onClick={() => {
                    loadConversation(conv.id);
                    setShowHistory(false);
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{conv.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{formatDate(conv.updated_at)}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conv.id);
                    }}
                    className="ml-3 p-1.5 rounded-full text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Chat area */}
      <div className="flex-1 min-h-0">
        <AIStylistChat
          wardrobeItems={wardrobeItems}
          bodyProfile={bodyProfile}
          initialMessages={loadedMessages}
          conversationId={activeConversationId}
          onNewConversation={createConversation}
          onSaveMessage={saveMessage}
        />
      </div>
    </div>
  );
};

export default AIStylistPage;
