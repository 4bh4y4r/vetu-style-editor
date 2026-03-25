import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, Plus, Trash2, Clock } from 'lucide-react';
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
    <div className="pb-20">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-bold text-foreground">AI Stylist</h1>
          <p className="text-xs font-body text-muted-foreground mt-0.5">
            Your personal fashion assistant
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              startNewChat();
              setShowHistory(false);
            }}
            className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition"
            title="New chat"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
              showHistory ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground hover:bg-muted'
            }`}
            title="Chat history"
          >
            <Clock size={16} />
          </button>
        </div>
      </div>

      {/* History panel */}
      {showHistory && (
        <div className="mx-4 mb-3 rounded-xl border border-border bg-secondary/50 max-h-64 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="py-8 text-center">
              <MessageSquare size={20} className="mx-auto text-muted-foreground mb-2" />
              <p className="text-xs font-body text-muted-foreground">No past chats yet</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={`flex items-center justify-between px-3 py-2.5 border-b border-border last:border-b-0 cursor-pointer transition hover:bg-muted/50 ${
                  activeConversationId === conv.id ? 'bg-primary/10' : ''
                }`}
                onClick={() => {
                  loadConversation(conv.id);
                  setShowHistory(false);
                }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-body font-medium text-foreground truncate">{conv.title}</p>
                  <p className="text-[10px] font-body text-muted-foreground">{formatDate(conv.updated_at)}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(conv.id);
                  }}
                  className="ml-2 p-1.5 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      <AIStylistChat
        wardrobeItems={wardrobeItems}
        bodyProfile={bodyProfile}
        initialMessages={loadedMessages}
        conversationId={activeConversationId}
        onNewConversation={createConversation}
        onSaveMessage={saveMessage}
      />
    </div>
  );
};

export default AIStylistPage;
