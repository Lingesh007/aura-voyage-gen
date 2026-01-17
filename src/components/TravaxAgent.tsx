import { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, Sparkles, Loader2, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
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
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Voice Error",
          description: "Could not recognize speech. Please try again.",
          variant: "destructive",
        });
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (currentAudio) {
        currentAudio.pause();
      }
    };
  }, []);

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

  // Text-to-Speech using Murf AI
  const speakText = useCallback(async (text: string) => {
    if (!voiceEnabled) return;
    
    // Stop any currently playing audio
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
    }
    
    setIsSpeaking(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke("murf-tts", {
        body: { 
          text: text.substring(0, 1000), // Limit text length
          voiceId: "en-US-natalie" 
        },
        headers: session?.access_token ? {
          Authorization: `Bearer ${session.access_token}`,
        } : undefined,
      });
      
      if (error) throw error;
      
      if (data.encodedAudio) {
        const audio = new Audio(`data:audio/mp3;base64,${data.encodedAudio}`);
        setCurrentAudio(audio);
        
        audio.onended = () => {
          setIsSpeaking(false);
          setCurrentAudio(null);
        };
        
        audio.onerror = () => {
          setIsSpeaking(false);
          setCurrentAudio(null);
        };
        
        await audio.play();
      } else if (data.audioFile) {
        const audio = new Audio(data.audioFile);
        setCurrentAudio(audio);
        
        audio.onended = () => {
          setIsSpeaking(false);
          setCurrentAudio(null);
        };
        
        audio.onerror = () => {
          setIsSpeaking(false);
          setCurrentAudio(null);
        };
        
        await audio.play();
      }
    } catch (error: any) {
      console.error("TTS Error:", error);
      setIsSpeaking(false);
    }
  }, [voiceEnabled, currentAudio]);

  // Toggle voice input
  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Not Supported",
        description: "Voice input is not supported in this browser.",
        variant: "destructive",
      });
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Stop speaking
  const stopSpeaking = () => {
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
    }
    setIsSpeaking(false);
  };

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
      // Get auth session to pass to the edge function for personalization
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke("travax-chat", {
        body: {
          messages: [...messages, userMessage],
          userName,
        },
        headers: session?.access_token ? {
          Authorization: `Bearer ${session.access_token}`,
        } : undefined,
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      
      // Speak the response if voice is enabled
      if (voiceEnabled) {
        speakText(data.message);
      }
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

  const handleBook = (content: string, messageIndex: number) => {
    // Only allow booking after first response (index 1)
    if (messageIndex < 1) return;
    
    // Determine booking type
    const flightMatch = content.match(/flight|airline|departure|arrival/i);
    const hotelMatch = content.match(/hotel|accommodation|stay|room/i);
    const activityMatch = content.match(/activity|activities|tour|experience/i);
    const visaMatch = content.match(/visa|travel document|entry permit/i);
    
    let bookingType = "";
    if (flightMatch) bookingType = "flights";
    else if (hotelMatch) bookingType = "hotels";
    else if (activityMatch) bookingType = "activities";
    else if (visaMatch) bookingType = "visas";
    
    if (bookingType) {
      // Extract structured booking information from AI response
      const bookingData = {
        type: bookingType,
        rawResponse: content,
        options: extractBookingOptions(content, bookingType),
        timestamp: Date.now()
      };
      
      // Store in sessionStorage for the booking page to access
      sessionStorage.setItem('agentBookingData', JSON.stringify(bookingData));
      
      window.location.href = `/booking/${bookingType}?fromAgent=true`;
    } else {
      toast({
        title: "Booking",
        description: "Please specify what you'd like to book (flight, hotel, activity, or visa)",
      });
    }
  };

  const extractBookingOptions = (content: string, type: string) => {
    const options: any[] = [];
    
    // Split content into lines and look for structured information
    const lines = content.split('\n').filter(line => line.trim());
    
    // Extract destinations, prices, and names from the content
    const priceRegex = /\$[\d,]+|\$\s*[\d,]+|USD\s*[\d,]+|[\d,]+\s*USD/gi;
    const prices = content.match(priceRegex) || [];
    
    // Extract potential destination names (capitalized words, city names)
    const destinations = content.match(/(?:to|in|at|visit)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g) || [];
    
    // Try to extract structured options based on type
    if (type === 'flights') {
      // Look for flight patterns like "City1 to City2"
      const routes = content.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:to|→)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/gi) || [];
      routes.forEach((route, idx) => {
        const [departure, arrival] = route.split(/\s+(?:to|→)\s+/i);
        options.push({
          departure: departure?.trim(),
          arrival: arrival?.trim(),
          price: prices[idx]?.replace(/[^\d]/g, '') || Math.floor(Math.random() * 500 + 200),
          destination: arrival?.trim(),
          date: extractDateFromText(content)
        });
      });
    } else if (type === 'hotels') {
      // Look for hotel names (often include "Hotel", "Resort", "Inn", etc.)
      const hotelNames = content.match(/([A-Z][a-zA-Z\s&]+(?:Hotel|Resort|Inn|Lodge|Suites|Grand|Palace))/g) || [];
      hotelNames.forEach((name, idx) => {
        options.push({
          name: name.trim(),
          price: prices[idx]?.replace(/[^\d]/g, '') || Math.floor(Math.random() * 300 + 100),
          destination: extractDestinationNear(content, name),
          rating: Math.floor(Math.random() * 2 + 4) // 4-5 stars
        });
      });
    } else if (type === 'activities') {
      // Look for activity descriptions
      const activities = content.match(/(?:\d+[\.)]\s+)?([A-Z][^.!?\n]+(?:tour|experience|visit|adventure|excursion|safari|cruise))/gi) || [];
      activities.forEach((activity, idx) => {
        options.push({
          name: activity.replace(/^\d+[\.)]\s*/, '').trim(),
          price: prices[idx]?.replace(/[^\d]/g, '') || Math.floor(Math.random() * 150 + 50),
          destination: extractDestinationFromActivity(activity),
          duration: extractDurationFromText(content)
        });
      });
    } else if (type === 'visas') {
      // Look for visa types and countries
      const visaTypes = content.match(/([A-Z][a-zA-Z\s]+(?:visa|Visa|entry permit))/gi) || [];
      visaTypes.forEach((visaType, idx) => {
        options.push({
          name: visaType.trim(),
          price: prices[idx]?.replace(/[^\d]/g, '') || Math.floor(Math.random() * 200 + 50),
          destination: extractCountryName(content),
          processing: '5-7 business days'
        });
      });
    }
    
    // If no structured options found, create a generic one from the full content
    if (options.length === 0 && prices.length > 0) {
      options.push({
        name: content.substring(0, 100).trim() + (content.length > 100 ? '...' : ''),
        price: prices[0]?.replace(/[^\d]/g, '') || Math.floor(Math.random() * 500 + 200),
        destination: destinations[0]?.replace(/(?:to|in|at|visit)\s+/i, '').trim() || 'Various',
        details: content
      });
    }
    
    return options.slice(0, 6); // Limit to 6 options
  };

  const extractDateFromText = (text: string) => {
    const dateMatch = text.match(/(?:on|from|starting)\s+([A-Z][a-z]+\s+\d{1,2}(?:st|nd|rd|th)?(?:,?\s+\d{4})?)/i);
    return dateMatch ? dateMatch[1] : new Date().toLocaleDateString();
  };

  const extractDestinationNear = (text: string, reference: string) => {
    const refIndex = text.indexOf(reference);
    const before = text.substring(Math.max(0, refIndex - 100), refIndex);
    const after = text.substring(refIndex, refIndex + 100);
    const combined = before + after;
    const destMatch = combined.match(/(?:in|at|near)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
    return destMatch ? destMatch[1] : 'International';
  };

  const extractDestinationFromActivity = (activity: string) => {
    const match = activity.match(/(?:in|at|of)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
    return match ? match[1] : 'Various Locations';
  };

  const extractCountryName = (text: string) => {
    const countries = text.match(/(?:for|to|in)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:visa|entry)/i);
    return countries ? countries[1] : 'International';
  };

  const extractDurationFromText = (text: string) => {
    const durationMatch = text.match(/(\d+)\s*(?:hours?|hrs?|days?)/i);
    return durationMatch ? durationMatch[0] : '4 hours';
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
                Travax AI Concierge
              </h2>
              <p className="text-sm text-muted-foreground">Voice-enabled travel assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Voice Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setVoiceEnabled(!voiceEnabled);
                if (isSpeaking) stopSpeaking();
              }}
              className={`hover:bg-primary/10 ${voiceEnabled ? 'text-primary' : 'text-muted-foreground'}`}
              title={voiceEnabled ? "Voice responses enabled" : "Voice responses disabled"}
            >
              {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-primary/10"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
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
                  
                  {message.role === "assistant" && index > 0 && (
                    <div className="flex gap-2 mt-3 px-4 pb-4 border-t border-border/30 pt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBook(message.content, index)}
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
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => speakText(message.content)}
                        disabled={isSpeaking}
                        className="text-xs"
                      >
                        {isSpeaking ? <Loader2 className="w-3 h-3 animate-spin" /> : <Volume2 className="w-3 h-3" />}
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
          {/* Speaking indicator */}
          {isSpeaking && (
            <div className="flex items-center justify-center gap-2 mb-3 text-primary">
              <div className="flex gap-1">
                <span className="w-1 h-4 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                <span className="w-1 h-4 bg-primary rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                <span className="w-1 h-4 bg-primary rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm">Speaking...</span>
              <Button size="sm" variant="ghost" onClick={stopSpeaking} className="text-xs h-6">
                Stop
              </Button>
            </div>
          )}
          
          <div className="flex gap-3">
            {/* Voice Input Button */}
            <Button
              variant={isListening ? "default" : "outline"}
              size="icon"
              onClick={toggleVoiceInput}
              disabled={loading}
              className={`shrink-0 ${isListening ? 'bg-red-500 hover:bg-red-600 animate-pulse' : ''}`}
              title={isListening ? "Stop listening" : "Start voice input"}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !loading && handleSend()}
              placeholder={isListening ? "Listening..." : "Ask me anything about your travel plans..."}
              className="flex-1 bg-card/80 backdrop-blur-sm border-border/50 focus:border-primary shadow-inner"
              disabled={loading || isListening}
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
            Voice-enabled AI • Powered by Murf AI & Gemini
          </p>
        </div>
      </div>
    </div>
  );
};

export default TravaxAgent;
