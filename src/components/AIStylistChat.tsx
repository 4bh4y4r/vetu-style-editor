import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Shirt, ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import type { WardrobeItem, ChatMessage } from '@/types';
import { AI_QUICK_PROMPTS, AI_IMAGE_PROMPTS, getEdgeFunctionUrl } from '@/constants';

// ─── API URLs ────────────────────────────────────────────────────
const CHAT_URL = getEdgeFunctionUrl('ai-stylist');
const IMAGE_URL = getEdgeFunctionUrl('generate-outfit-image');

interface AIStylistChatProps {
  wardrobeItems: WardrobeItem[];
}

const AIStylistChat = ({ wardrobeItems }: AIStylistChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  // ─── Image generation ─────────────────────────────────────────
  const generateImage = async (prompt: string) => {
    const cleanPrompt = prompt.replace(/^🎨\s*Generate\s*/i, '');
    const userMsg: ChatMessage = { role: 'user', content: prompt };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsGeneratingImage(true);

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

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.imageUrl
            ? data.text || 'Here\'s your generated outfit! ✨'
            : data.text || data.error || 'Could not generate an image. Try a different description!',
          imageUrl: data.imageUrl || undefined,
        },
      ]);
    } catch (e: any) {
      toast.error(e.message || 'Image generation failed');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // ─── Text chat (streaming) ────────────────────────────────────
  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading || isGeneratingImage) return;

    // Route image prompts to the image generator
    if (text.startsWith('🎨')) {
      return generateImage(text);
    }

    const userMsg: ChatMessage = { role: 'user', content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

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
          wardrobeItems: wardrobeItems.map((i) => ({ category: i.category, name: i.name })),
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
            /* partial JSON — wait for next chunk */
          }
        }
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
    <div className="flex flex-col h-[calc(100vh-280px)] px-4">
      {/* ─── Messages area ────────────────────────────────────── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pb-4">
        {messages.length === 0 ? (
          <EmptyState
            wardrobeCount={wardrobeItems.length}
            onSend={sendMessage}
          />
        ) : (
          messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} />
          ))
        )}

        {isGeneratingImage && <ImageLoadingIndicator />}
        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && <TypingIndicator />}
      </div>

      {/* ─── Input bar ────────────────────────────────────────── */}
      <div className="flex items-center gap-2 py-3 border-t border-border">
        <button
          onClick={() => {
            const prompt = window.prompt('Describe the outfit you want to generate:');
            if (prompt) sendMessage(`🎨 Generate ${prompt}`);
          }}
          disabled={isBusy}
          className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center disabled:opacity-50 transition hover:bg-accent/20 flex-shrink-0"
          aria-label="Generate outfit image"
        >
          <ImageIcon size={16} />
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
          placeholder="Ask your AI stylist..."
          className="flex-1 px-4 py-2.5 rounded-full bg-secondary text-foreground text-sm font-body placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition"
          disabled={isBusy}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || isBusy}
          className="w-10 h-10 rounded-full gradient-ai text-accent-foreground flex items-center justify-center disabled:opacity-50 transition hover:opacity-90"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};

// ─── Sub-components ──────────────────────────────────────────────

const EmptyState = ({
  wardrobeCount,
  onSend,
}: {
  wardrobeCount: number;
  onSend: (text: string) => void;
}) => (
  <div className="flex flex-col items-center justify-center h-full text-center">
    <div className="w-16 h-16 rounded-full gradient-ai-soft flex items-center justify-center mb-4">
      <Sparkles size={28} className="text-accent" />
    </div>
    <h3 className="text-base font-display font-bold text-foreground mb-1">AI Stylist</h3>
    <p className="text-xs font-body text-muted-foreground mb-4 max-w-[240px]">
      Get outfit suggestions, styling advice, and AI-generated outfit images
    </p>

    <SectionLabel>Ask a question</SectionLabel>
    <div className="flex flex-wrap gap-2 justify-center max-w-sm mb-4">
      {AI_QUICK_PROMPTS.map((p) => (
        <button
          key={p}
          onClick={() => onSend(p)}
          className="px-3 py-2 rounded-full bg-secondary text-secondary-foreground text-xs font-body hover:bg-muted transition"
        >
          {p}
        </button>
      ))}
    </div>

    <SectionLabel>Generate an image</SectionLabel>
    <div className="flex flex-wrap gap-2 justify-center max-w-sm">
      {AI_IMAGE_PROMPTS.map((p) => (
        <button
          key={p}
          onClick={() => onSend(p)}
          className="px-3 py-2 rounded-full bg-accent/10 text-accent text-xs font-body hover:bg-accent/20 transition border border-accent/20"
        >
          {p}
        </button>
      ))}
    </div>

    {wardrobeCount > 0 && (
      <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground font-body">
        <Shirt size={14} />
        <span>{wardrobeCount} items in your closet</span>
      </div>
    )}
  </div>
);

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] font-body font-semibold text-muted-foreground uppercase tracking-wider mb-2">
    {children}
  </p>
);

const MessageBubble = ({ message }: { message: ChatMessage }) => (
  <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
    <div
      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm font-body ${
        message.role === 'user'
          ? 'bg-primary text-primary-foreground rounded-br-md'
          : 'bg-secondary text-secondary-foreground rounded-bl-md'
      }`}
    >
      {message.role === 'assistant' ? (
        <div>
          {message.imageUrl && (
            <img
              src={message.imageUrl}
              alt="AI generated outfit"
              className="w-full rounded-xl mb-2 max-h-80 object-cover"
            />
          )}
          <div className="prose prose-sm max-w-none [&>p]:m-0 [&>ul]:my-1 [&>ol]:my-1">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        </div>
      ) : (
        message.content
      )}
    </div>
  </div>
);

const ImageLoadingIndicator = () => (
  <div className="flex justify-start">
    <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
      <Loader2 size={16} className="animate-spin text-accent" />
      <span className="text-xs font-body text-muted-foreground">Generating outfit image...</span>
    </div>
  </div>
);

const TypingIndicator = () => (
  <div className="flex justify-start">
    <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3">
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  </div>
);

export default AIStylistChat;
