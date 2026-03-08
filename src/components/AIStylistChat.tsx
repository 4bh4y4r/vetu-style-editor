import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Shirt, ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

interface WardrobeItem {
  id: string;
  image_url: string;
  category: string;
  name: string | null;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-stylist`;
const IMAGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-outfit-image`;

const QUICK_PROMPTS = [
  "Suggest an outfit for a date night",
  "What goes well together from my closet?",
  "Help me dress for a job interview",
  "Create a weekend casual look",
];

const IMAGE_PROMPTS = [
  "🎨 Generate a casual streetwear outfit",
  "🎨 Generate an elegant evening look",
  "🎨 Generate a boho summer outfit",
];

const AIStylistChat = ({ wardrobeItems }: { wardrobeItems: WardrobeItem[] }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const generateImage = async (prompt: string) => {
    const cleanPrompt = prompt.replace(/^🎨\s*Generate\s*/i, '');
    const userMsg: Message = { role: 'user', content: prompt };
    setMessages(prev => [...prev, userMsg]);
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

      if (data.imageUrl) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.text || 'Here\'s your generated outfit! ✨',
          imageUrl: data.imageUrl,
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.text || data.error || 'Could not generate an image. Try a different description!',
        }]);
      }
    } catch (e: any) {
      toast.error(e.message || 'Image generation failed');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading || isGeneratingImage) return;

    // Route image generation requests
    if (text.startsWith('🎨')) {
      return generateImage(text);
    }

    const userMsg: Message = { role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    let assistantSoFar = '';

    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
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
          messages: [...messages, userMsg].filter(m => !m.imageUrl).map(m => ({ role: m.role, content: m.content })),
          wardrobeItems: wardrobeItems.map(i => ({ category: i.category, name: i.name })),
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
          } catch { /* partial */ }
        }
      }
    } catch (e: any) {
      toast.error(e.message || 'Something went wrong');
      setMessages(prev => prev.filter(m => !(m.role === 'assistant' && m.content === '')));
    } finally {
      setIsLoading(false);
    }
  };

  const isBusy = isLoading || isGeneratingImage;

  return (
    <div className="flex flex-col h-[calc(100vh-280px)] px-4">
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pb-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full gradient-ai-soft flex items-center justify-center mb-4">
              <Sparkles size={28} className="text-accent" />
            </div>
            <h3 className="text-base font-display font-bold text-foreground mb-1">AI Stylist</h3>
            <p className="text-xs font-body text-muted-foreground mb-4 max-w-[240px]">
              Get outfit suggestions, styling advice, and AI-generated outfit images
            </p>

            <p className="text-[10px] font-body font-semibold text-muted-foreground uppercase tracking-wider mb-2">Ask a question</p>
            <div className="flex flex-wrap gap-2 justify-center max-w-sm mb-4">
              {QUICK_PROMPTS.map(p => (
                <button
                  key={p}
                  onClick={() => sendMessage(p)}
                  className="px-3 py-2 rounded-full bg-secondary text-secondary-foreground text-xs font-body hover:bg-muted transition"
                >
                  {p}
                </button>
              ))}
            </div>

            <p className="text-[10px] font-body font-semibold text-muted-foreground uppercase tracking-wider mb-2">Generate an image</p>
            <div className="flex flex-wrap gap-2 justify-center max-w-sm">
              {IMAGE_PROMPTS.map(p => (
                <button
                  key={p}
                  onClick={() => sendMessage(p)}
                  className="px-3 py-2 rounded-full bg-accent/10 text-accent text-xs font-body hover:bg-accent/20 transition border border-accent/20"
                >
                  {p}
                </button>
              ))}
            </div>

            {wardrobeItems.length > 0 && (
              <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground font-body">
                <Shirt size={14} />
                <span>{wardrobeItems.length} items in your closet</span>
              </div>
            )}
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm font-body ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-secondary text-secondary-foreground rounded-bl-md'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <div>
                    {msg.imageUrl && (
                      <img
                        src={msg.imageUrl}
                        alt="AI generated outfit"
                        className="w-full rounded-xl mb-2 max-h-80 object-cover"
                      />
                    )}
                    <div className="prose prose-sm max-w-none [&>p]:m-0 [&>ul]:my-1 [&>ol]:my-1">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))
        )}
        {isGeneratingImage && (
          <div className="flex justify-start">
            <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-accent" />
              <span className="text-xs font-body text-muted-foreground">Generating outfit image...</span>
            </div>
          </div>
        )}
        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex justify-start">
            <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

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
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
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

export default AIStylistChat;
