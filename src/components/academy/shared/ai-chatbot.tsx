'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { MessageCircle, Send, X, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/lib/store/app-store';
import { shouldUseSupabase } from '@/lib/config/runtime';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

// ── Types ───────────────────────────────────────────────────────
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// ── Fallback responses ──────────────────────────────────────────
function getFallbackResponse(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes('load board') || lower.includes('find load') || lower.includes('best load')) {
    return "Load boards are essential tools for finding freight in the industry. Major platforms offer real-time availability, rate benchmarks, and broker credit tools. For beginners, I recommend starting with a major load board — look for loads with competitive per-mile rates, check the lane history, and always verify the broker's credit score before booking. Pro tip: Set up load alerts for your preferred lanes so you get notified instantly!";
  }

  if (lower.includes('broker') && (lower.includes('email') || lower.includes('write') || lower.includes('message') || lower.includes('contact'))) {
    return "When emailing brokers, always include: 1) Your MC/DOT number, 2) Equipment type and availability, 3) Preferred lanes, 4) A professional subject line like 'Available Equipment — [Lane] — [Date]'. Keep it concise — brokers get hundreds of emails daily. Example: 'Hi [Broker Name], I have a dry van available in the Chicago area starting Monday. MC# 123456. Interested in loads heading Southeast. Looking forward to working with you.' Always follow up with a phone call if you don't hear back within 24 hours.";
  }

  if (lower.includes('rate') || lower.includes('rpm') || lower.includes('per mile') || lower.includes('pricing') || lower.includes('negotiat')) {
    return "Rate per mile (RPM) is calculated by dividing the total rate by the total miles. For example, a $2,500 load going 1,000 miles = $2.50/mile. When negotiating rates: 1) Know your break-even RPM (include fuel, insurance, maintenance, driver pay), 2) Check the lane average on industry rate tools, 3) Start high and negotiate down, 4) Never accept below your minimum — deadhead to a better lane instead. Current national average for dry van varies by region and market conditions.";
  }

  if (lower.includes('hos') || lower.includes('hour') || lower.includes('eld') || lower.includes('drive time') || lower.includes('log')) {
    return "Hours of Service (HOS) regulations limit drivers to: 11 hours of driving after 10 consecutive hours off duty, 14-hour on-duty window, 30-minute break required after 8 hours of driving, and 60/70-hour limits in 7/8 days. ELD (Electronic Logging Device) automatically records driving time and is mandatory for most CMVs. Key tips: Plan your trips around HOS limits, use the 'sleeper berth' provision for split breaks, and always leave a 15-minute buffer — violations can result in $1,000-$16,000 fines and CSA points!";
  }

  if (lower.includes('compliance') || lower.includes('dot') || lower.includes('fmcsa') || lower.includes('safety') || lower.includes('regulation')) {
    return "DOT/FMCSA compliance is crucial for any dispatch operation. Key requirements include: 1) Valid MC/DOT authority, 2) Minimum $750K liability insurance, 3) Drug & alcohol testing program, 4) Vehicle maintenance records, 5) Driver qualification files. CSA scores impact your ability to get loads — keep your BASICs scores low. FMCSA conducts random audits, so maintain organized records at all times. The new FMCSA Clearinghouse also requires checking driver drug/alcohol history before hiring.";
  }

  if (lower.includes('dispatch') || lower.includes('career') || lower.includes('job') || lower.includes('start') || lower.includes('become')) {
    return "Starting a dispatch career? Here's your roadmap: 1) Learn the fundamentals — freight types, equipment, lanes, and rates, 2) Master load board navigation, 3) Build relationships with 10-15 reliable brokers, 4) Understand HOS/ELD compliance inside and out, 5) Start as an in-house dispatcher to gain experience, then consider going independent. Independent dispatchers can build income by managing multiple carrier accounts. Our courses cover these skills with practice exercises.";
  }

  return "Great question! In dispatch, this typically involves understanding the freight lifecycle — from booking to delivery. The key is to always have a plan: know your lanes, maintain broker relationships, and stay on top of compliance. I'd recommend checking out our courses on Load Board Mastery and Broker Communication for a deep dive. Is there a specific aspect you'd like me to explain in more detail?";
}

// ── Suggested questions ──────────────────────────────────────────
const SUGGESTED_QUESTIONS = [
  'How do I find the best loads?',
  'What should I include in a broker email?',
  'Explain rate per mile',
  'HOS rules for new drivers',
];

// ── Chat panel animation variants ───────────────────────────────
const panelVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
  exit: {
    opacity: 0,
    y: 20,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

const messageVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: 'easeOut' },
  },
};

// ── Component ────────────────────────────────────────────────────
export function AIChatbot() {
  const { user } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Generate unique ID
  const genId = () => `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  // Send message handler
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: genId(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      // Build conversation history (last 10 messages)
      const history = [...messages, userMessage]
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }));

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (shouldUseSupabase()) {
        const { data } = await getSupabaseBrowserClient().auth.getSession();
        if (data.session?.access_token) {
          headers.Authorization = `Bearer ${data.session.access_token}`;
        }
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({ messages: history }),
      });

      if (!res.ok) throw new Error('API request failed');

      const data = await res.json();
      const botMessage: ChatMessage = {
        id: genId(),
        role: 'assistant',
        content: data.message || data.content || 'Sorry, I couldn\'t process that. Please try again.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch {
      // Fallback to local response
      const fallbackContent = getFallbackResponse(text);
      const fallbackMessage: ChatMessage = {
        id: genId(),
        role: 'assistant',
        content: fallbackContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [messages]);

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputText);
  };

  // Handle suggested question click
  const handleSuggestionClick = (question: string) => {
    sendMessage(question);
  };

  // Get user initials
  const getUserInitials = () => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Don't render if user is not logged in
  if (!user) return null;

  const showSuggestions = messages.length === 0;

  return (
    <>
      {/* Floating Chat Bubble */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl flex items-center justify-center transition-shadow duration-200 focus-ring"
            aria-label="Open chat assistant"
          >
            <MessageCircle className="h-6 w-6" />
            {/* Unread indicator dot */}
            {messages.length === 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-background" />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed bottom-16 right-0 left-0 md:bottom-6 md:right-6 md:left-auto z-50 flex flex-col rounded-t-2xl md:rounded-2xl border border-border/50 glass-card shadow-2xl overflow-hidden md:w-[380px] h-[70vh] md:h-[500px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-primary/5">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground leading-tight">
                    Dispatch Buddy 🤖
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    AI logistics assistant
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-muted"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {/* Welcome message */}
                {showSuggestions && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="h-8 w-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm">🤖</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="rounded-2xl rounded-tl-sm bg-muted/60 px-3.5 py-2.5">
                          <p className="text-sm text-foreground leading-relaxed">
                            Hey there! 👋 I&apos;m Dispatch Buddy, your AI logistics assistant. Ask me anything about truck dispatch, load boards, broker communication, HOS rules, and more!
                          </p>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1 ml-1">
                          Just now
                        </p>
                      </div>
                    </div>

                    {/* Suggested Questions */}
                    <div className="space-y-1.5 pl-10.5">
                      <p className="text-xs text-muted-foreground font-medium mb-2">
                        Try asking:
                      </p>
                      {SUGGESTED_QUESTIONS.map((q, i) => (
                        <motion.button
                          key={q}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + i * 0.05 }}
                          onClick={() => handleSuggestionClick(q)}
                          className="block w-full text-left text-sm px-3 py-2 rounded-xl bg-primary/5 hover:bg-primary/10 border border-primary/10 hover:border-primary/20 text-primary transition-colors duration-150"
                        >
                          {q}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Chat Messages */}
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    variants={messageVariants}
                    initial="hidden"
                    animate="visible"
                    className={`flex items-start gap-2.5 ${
                      msg.role === 'user' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-xs font-semibold ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-primary/10 text-primary'
                      }`}
                    >
                      {msg.role === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <span className="text-sm">🤖</span>
                      )}
                    </div>

                    {/* Message bubble */}
                    <div
                      className={`flex-1 min-w-0 max-w-[85%] ${
                        msg.role === 'user' ? 'flex flex-col items-end' : ''
                      }`}
                    >
                      <div
                        className={`rounded-2xl px-3.5 py-2.5 inline-block ${
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground rounded-tr-sm'
                            : 'bg-muted/60 text-foreground rounded-tl-sm'
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {msg.content}
                        </p>
                      </div>
                      <p
                        className={`text-[10px] text-muted-foreground mt-1 ${
                          msg.role === 'user' ? 'mr-1' : 'ml-1'
                        }`}
                      >
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </motion.div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2.5"
                  >
                    <div className="h-8 w-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm">🤖</span>
                    </div>
                    <div className="rounded-2xl rounded-tl-sm bg-muted/60 px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-muted-foreground/50" />
                        <span className="h-2 w-2 rounded-full bg-muted-foreground/50" />
                        <span className="h-2 w-2 rounded-full bg-muted-foreground/50" />
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t border-border/50 p-3 bg-background/80">
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <Input
                  ref={inputRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask about dispatch, loads, rates..."
                  className="flex-1 h-10 text-sm rounded-xl border-border/50 focus-visible:ring-primary/30"
                  disabled={isTyping}
                  aria-label="Chat message input"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!inputText.trim() || isTyping}
                  className="h-10 w-10 rounded-xl shrink-0"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
              <p className="text-[10px] text-muted-foreground/60 text-center mt-1.5">
                AI may produce inaccurate info. Verify important details.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
