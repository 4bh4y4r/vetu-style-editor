import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { ChatMessage } from '@/types';

export interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

export const useChatHistory = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [loadedMessages, setLoadedMessages] = useState<ChatMessage[]>([]);

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('chat_conversations')
      .select('id, title, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    if (data) setConversations(data);
  }, [user]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  const createConversation = async (firstMessage: string): Promise<string | null> => {
    if (!user) return null;
    const title = firstMessage.slice(0, 60) || 'New Chat';
    const { data, error } = await supabase
      .from('chat_conversations')
      .insert({ user_id: user.id, title })
      .select('id')
      .single();
    if (error || !data) return null;
    setActiveConversationId(data.id);
    fetchConversations();
    return data.id;
  };

  const saveMessage = async (conversationId: string, msg: ChatMessage) => {
    if (!user) return;
    await supabase.from('chat_messages').insert({
      conversation_id: conversationId,
      user_id: user.id,
      role: msg.role,
      content: msg.content,
      image_url: msg.imageUrl || null,
    });
    // Update conversation title & timestamp
    await supabase
      .from('chat_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);
  };

  const loadConversation = async (conversationId: string) => {
    if (!user) return;
    const { data } = await supabase
      .from('chat_messages')
      .select('role, content, image_url')
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    if (data) {
      setLoadedMessages(
        data.map((m: any) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
          imageUrl: m.image_url || undefined,
        }))
      );
    }
    setActiveConversationId(conversationId);
  };

  const deleteConversation = async (conversationId: string) => {
    await supabase.from('chat_conversations').delete().eq('id', conversationId);
    if (activeConversationId === conversationId) {
      setActiveConversationId(null);
      setLoadedMessages([]);
    }
    fetchConversations();
  };

  const startNewChat = () => {
    setActiveConversationId(null);
    setLoadedMessages([]);
  };

  return {
    conversations,
    activeConversationId,
    loadedMessages,
    createConversation,
    saveMessage,
    loadConversation,
    deleteConversation,
    startNewChat,
    fetchConversations,
  };
};
