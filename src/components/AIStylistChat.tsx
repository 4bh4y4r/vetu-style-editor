import { useState, useRef, useEffect, useMemo } from 'react';
import { Send, Sparkles, Shirt, ImageIcon, Loader2, Plus, SlidersHorizontal, MapPin, Calendar, Sun, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import type { WardrobeItem, ChatMessage } from '@/types';
import { AI_QUICK_PROMPTS, AI_IMAGE_PROMPTS, getEdgeFunctionUrl } from '@/constants';

const CHAT_URL = getEdgeFunctionUrl('ai-stylist');
const IMAGE_URL = getEdgeFunctionUrl('generate-outfit-image');

export interface StyleContext {
  location: string;
  occasion: string;
  eventType: string;
  comfort: string;
}

const OCCASIONS = ['Casual', 'Work / Office', 'Date Night', 'Wedding', 'Party', 'Travel', 'Interview', 'Gym / Active'] as const;
const COMFORT_LEVELS = ['Prioritize comfort', 'Balanced', 'Prioritize style'] as const;

interface BodyProfile {
  height_cm: number | null;
  body_type: string | null;
  skin_tone: string | null;
}

interface AIStylistChatProps {
  wardrobeItems: WardrobeItem[];
  bodyProfile?: BodyProfile | null;
  initialMessages?: ChatMessage[];
  conversationId?: string | null;
  onNewConversation?: (firstMessage: string) => Promise<string | null>;
  onSaveMessage?: (conversationId: string, msg: ChatMessage) => Promise<void>;
}

const AIStylistChat = ({
  wardrobeItems,
  bodyProfile,
  initialMessages,
  conversationId,
  onNewConversation,
  onSaveMessage,
}: AIStylistChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages || []);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [showContext, setShowContext] = useState(false);
  const [activeConvId, setActiveConvId] = useState<string | null>(conversationId || null);
  const [styleContext, setStyleContext] = useState<StyleContext>({
    location: '',
    occasion: 'Casual',
    eventType: '',
    comfort: 'Balanced',
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialMessages) setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    setActiveConvId(conversationId || null);
  }, [conversationId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const ensureConversation = async (firstMessage: string): Promise<string | null> => {
    if (activeConvId) return activeConvId;
    if (onNewConversation) {
      const id = await onNewConversation(firstMessage);
      if (id) setActiveConvId(id);
      return id;
    }
    return null;
  };

  const persistMessage = async (msg: ChatMessage) => {
    const convId = activeConvId;
    if (convId && onSaveMessage) {
      await onSaveMessage(convId, msg);
    }
  };

  const generateImage = async (prompt: string) => {
    const cleanPrompt = prompt.replace(/^🎨\s*Generate\s*/i, '');
    const userMsg: ChatMessage = { role: 'user', content: prompt };

    const convId = await ensureConversation(prompt);
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsGeneratingImage(true);

    if (convId && onSaveMessage) await onSaveMessage(convId, userMsg);

    try {
      const resp = await fetch(IMAGE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ prompt: cleanPrompt }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to generate image');
      }

      const data = await resp.json();
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: data.imageUrl
          ? data.text || "Here's your generated outfit!"
          : data.text || data.error || 'Could not generate an image. Try a different description!',
        imageUrl: data.imageUrl || undefined,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      if (convId && onSaveMessage) await onSaveMessage(convId, assistantMsg);
    } catch (e: any) {
      toast.error(e.message || 'Image generation failed');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading || isGeneratingImage) return;

    if (text.startsWith('🎨')) {
      return generateImage(text);
    }

    const userMsg: ChatMessage = { role: 'user', content: text.trim() };
    const convId = await ensureConversation(text.trim());

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setShowContext(false);

    if (convId && onSaveMessage) await onSaveMessage(convId, userMsg);

    let assistantSoFar = '';

    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: 'assistant', content: assistantSoFar }];
      });
    };

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMsg]
            .filter((m) => !m.imageUrl)
            .map((m) => ({ role: m.role, content: m.content })),
          wardrobeItems: wardrobeItems.map((i) => ({ category: i.category, name: i.name, image_url: i.image_url })),
          styleContext,
          bodyProfile: bodyProfile || undefined,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to get response');
      }

      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          const json = line.slice(6).trim();
          if (json === '[DONE]') break;
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) upsertAssistant(content);
          } catch {
            /* partial JSON */
          }
        }
      }

      if (convId && onSaveMessage && assistantSoFar) {
        await onSaveMessage(convId, { role: 'assistant', content: assistantSoFar });
      }
    } catch (e: any) {
      toast.error(e.message || 'Something went wrong');
      setMessages((prev) => prev.filter((m) => !(m.role === 'assistant' && m.content === '')));
    } finally {
      setIsLoading(false);
    }
  };

  const isBusy = isLoading || isGeneratingImage;

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pb-2">
        {messages.length === 0 ? (
          <EmptyState wardrobeCount={wardrobeItems.length} onSend={sendMessage} />
        ) : (
          <div className="space-y-4 py-4">
            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} wardrobeItems={wardrobeItems} />
            ))}
          </div>
        )}

        {isGeneratingImage && <ImageLoadingIndicator />}
        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && <TypingIndicator />}
      </div>

      {/* Context panel (slides up from input) */}
      {showContext && (
        <ContextPanel
          styleContext={styleContext}
          onChange={setStyleContext}
          onClose={() => setShowContext(false)}
        />
      )}

      {/* Minimal input bar */}
      <div className="px-4 pb-4 pt-2">
        <div className="flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-2 py-1.5">
          <button
            onClick={() => setShowContext(!showContext)}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              showContext ? 'text-foreground bg-secondary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
            aria-label="Style context"
          >
            <SlidersHorizontal size={16} strokeWidth={1.8} />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
            placeholder="Ask anything"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none py-1"
            disabled={isBusy}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isBusy}
            className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center disabled:opacity-30 transition-opacity"
            aria-label="Send"
          >
            <Send size={14} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Context Panel ───────────────────────────────────────────────

const ContextPanel = ({
  styleContext,
  onChange,
  onClose,
}: {
  styleContext: StyleContext;
  onChange: (ctx: StyleContext) => void;
  onClose: () => void;
}) => (
  <div className="mx-4 mb-2 rounded-2xl border border-border bg-secondary/40 overflow-hidden">
    <div className="flex items-center justify-between px-4 py-2.5">
      <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
        <Sun size={13} className="text-muted-foreground" />
        Style Context
      </span>
      <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
        <ChevronUp size={14} />
      </button>
    </div>
    <div className="px-4 pb-3 space-y-3">
      <div>
        <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">
          <MapPin size={9} className="inline mr-1" />Location
        </label>
        <input
          type="text"
          value={styleContext.location}
          onChange={(e) => onChange({ ...styleContext, location: e.target.value })}
          placeholder="e.g. Mumbai, New York"
          className="w-full px-3 py-2 rounded-lg bg-background text-foreground text-xs placeholder:text-muted-foreground/50 outline-none focus:ring-1 focus:ring-border transition"
        />
      </div>
      <div>
        <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
          <Calendar size={9} className="inline mr-1" />Occasion
        </label>
        <div className="flex flex-wrap gap-1.5">
          {OCCASIONS.map((o) => (
            <button
              key={o}
              onClick={() => onChange({ ...styleContext, occasion: o })}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition ${
                styleContext.occasion === o
                  ? 'bg-foreground text-background'
                  : 'bg-background text-muted-foreground hover:bg-muted'
              }`}
            >
              {o}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Event Details</label>
        <input
          type="text"
          value={styleContext.eventType}
          onChange={(e) => onChange({ ...styleContext, eventType: e.target.value })}
          placeholder="e.g. outdoor brunch, evening gala"
          className="w-full px-3 py-2 rounded-lg bg-background text-foreground text-xs placeholder:text-muted-foreground/50 outline-none focus:ring-1 focus:ring-border transition"
        />
      </div>
      <div>
        <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Comfort</label>
        <div className="flex gap-1.5">
          {COMFORT_LEVELS.map((c) => (
            <button
              key={c}
              onClick={() => onChange({ ...styleContext, comfort: c })}
              className={`flex-1 px-2 py-1.5 rounded-lg text-[11px] font-medium transition ${
                styleContext.comfort === c
                  ? 'bg-foreground text-background'
                  : 'bg-background text-muted-foreground hover:bg-muted'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// ─── Empty State ─────────────────────────────────────────────────

const EmptyState = ({ wardrobeCount, onSend }: { wardrobeCount: number; onSend: (text: string) => void }) => (
  <div className="flex flex-col h-full">
    <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
      <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4">
        <Sparkles size={20} className="text-foreground" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-1">AI Stylist</h3>
      <p className="text-xs text-muted-foreground max-w-[260px]">
        Your personal fashion assistant. Ask for outfit advice or generate looks.
      </p>
      {wardrobeCount > 0 && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground/70">
          <Shirt size={13} />
          <span>{wardrobeCount} items in closet</span>
        </div>
      )}
    </div>

    {/* Quick prompts at bottom */}
    <div className="px-2 pb-3">
      <div className="flex flex-wrap gap-2 justify-center">
        {AI_QUICK_PROMPTS.slice(0, 3).map((p) => (
          <button
            key={p}
            onClick={() => onSend(p)}
            className="px-3 py-2 rounded-xl bg-secondary/60 border border-border/50 text-xs text-foreground hover:bg-secondary transition-colors"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  </div>
);

// ─── Message Bubble ──────────────────────────────────────────────

const MessageBubble = ({ message, wardrobeItems }: { message: ChatMessage; wardrobeItems: WardrobeItem[] }) => {
  const matchedItems = useMemo(() => {
    if (message.role !== 'assistant' || !wardrobeItems.length) return [];
    const content = message.content.toLowerCase();
    return wardrobeItems
      .filter((item) => {
        if (item.name && item.name.trim() !== '') {
          return content.includes(item.name.toLowerCase().trim());
        }
        return content.includes(item.category.toLowerCase().trim());
      });
  }, [message, wardrobeItems]);

  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
          isUser
            ? 'bg-foreground text-background rounded-br-sm'
            : 'bg-secondary/70 text-foreground rounded-bl-sm'
        }`}
      >
        {!isUser ? (
          <div>
            {message.imageUrl && (
              <img src={message.imageUrl} alt="AI generated outfit" className="w-full rounded-xl mb-2 max-h-80 object-cover" />
            )}

            {matchedItems.length > 0 && (
              <div className="mb-3">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Shirt size={10} /> From your closet
                </p>
                <div className={`grid gap-1.5 ${matchedItems.length === 1 ? 'grid-cols-1' : matchedItems.length <= 4 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                  {matchedItems.map((item) => (
                    <div key={item.id} className="rounded-lg overflow-hidden border border-border">
                      <img src={item.image_url} alt={item.name || item.category} className="w-full aspect-square object-cover" />
                      <div className="px-1.5 py-1 bg-secondary">
                        <p className="text-[9px] font-medium text-foreground truncate">{item.name || item.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="prose prose-sm max-w-none [&>p]:m-0 [&>ul]:my-1 [&>ol]:my-1 [&_strong]:font-semibold [&_li]:marker:text-muted-foreground [&_h3]:text-xs [&_h3]:mt-2 [&_h2]:text-sm [&_h2]:mt-2 [&_blockquote]:border-l-border [&_blockquote]:bg-secondary [&_blockquote]:rounded-r-lg [&_blockquote]:py-1 [&_blockquote]:px-3 [&_blockquote]:text-xs">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          </div>
        ) : (
          message.content
        )}
      </div>
    </div>
  );
};

const ImageLoadingIndicator = () => (
  <div className="flex justify-start py-2">
    <div className="bg-secondary/70 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
      <Loader2 size={14} className="animate-spin text-muted-foreground" />
      <span className="text-xs text-muted-foreground">Generating outfit...</span>
    </div>
  </div>
);

const TypingIndicator = () => (
  <div className="flex justify-start py-2">
    <div className="bg-secondary/70 rounded-2xl rounded-bl-sm px-4 py-3">
      <div className="flex gap-1">
        <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  </div>
);

export default AIStylistChat;
