import { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface TravaxAgentProps {
  onClose: () => void;
}

const TravaxAgent = ({ onClose }: TravaxAgentProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const name = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || "there";
      setUserName(name);
      
      setMessages([{
        role: "assistant",
        content: `Hello ${name}! I'm your Travax AI assistant. I can help you plan trips, find the best flights and hotels, optimize your budget, and book everything for you. What would you like to do today?`,
      }]);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || loading) return;

    const userMessage: Message = {
      role: "user",
      content: textToSend,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("travax-chat", {
        body: {
          messages: [...messages, userMessage],
          userName,
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to get response from AI. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (messages.length < 2) return;
    
    const lastUserMessage = messages
      .slice()
      .reverse()
      .find(m => m.role === "user");
    
    if (!lastUserMessage) return;
    
    setMessages(prev => prev.slice(0, -1));
    await handleSend(lastUserMessage.content);
  };

  const handleBook = (content: string) => {
    const flightMatch = content.match(/flight|airline|departure|arrival/i);
    const hotelMatch = content.match(/hotel|accommodation|stay|room/i);
    
    if (flightMatch) {
      window.location.href = "/booking/flights";
    } else if (hotelMatch) {
      window.location.href = "/booking/hotels";
    } else {
      toast({
        title: "Booking",
        description: "Please specify what you'd like to book (flight, hotel, etc.)",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-4xl h-[80vh] bg-gradient-to-br from-card via-card to-primary/5 rounded-2xl border-2 border-primary/30 shadow-2xl flex flex-col animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-secondary/5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 blur-xl bg-primary opacity-40 animate-pulse" />
              <Sparkles className="w-6 h-6 text-primary relative" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="font-luxury text-2xl font-bold text-gradient-pastel">
                Travax AI Agent
              </h2>
              <p className="text-sm text-muted-foreground">Your intelligent travel assistant</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-primary/10"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-6" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-slide-up`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className={`max-w-[80%] ${
                    message.role === "user"
                      ? "bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-lg p-4 rounded-2xl"
                      : "bg-card/80 backdrop-blur-sm text-foreground border border-border/50 shadow-md"
                  }`}
                >
                  <p className="whitespace-pre-wrap p-4">{message.content}</p>
                  
                  {message.role === "assistant" && (
                    <div className="flex gap-2 mt-3 px-4 pb-4 border-t border-border/30 pt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBook(message.content)}
                        className="text-xs"
                      >
                        Book
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleRegenerate}
                        className="text-xs"
                      >
                        Regenerate
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-card/80 backdrop-blur-sm text-foreground border border-border/50 p-4 rounded-2xl shadow-md">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-6 border-t border-border/50 bg-gradient-to-r from-secondary/5 to-primary/5">
          <div className="flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !loading && handleSend()}
              placeholder="Ask me anything about your travel plans..."
              className="flex-1 bg-card/80 backdrop-blur-sm border-border/50 focus:border-primary shadow-inner"
              disabled={loading}
            />
            <Button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground shadow-lg"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            AI-powered by Gemini • Personalized to your preferences
          </p>
        </div>
      </div>
    </div>
  );
};

export default TravaxAgent;
