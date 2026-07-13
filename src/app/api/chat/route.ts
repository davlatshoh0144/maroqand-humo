import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { shouldUseSupabase } from '@/lib/config/runtime';
import { getBearerToken, getSupabaseUserClient } from '@/lib/supabase/server';

const SYSTEM_PROMPT = `You are Dispatch Buddy, a helpful AI assistant for Marokand Humo Academy students. You help with questions about USA truck dispatch, load boards, broker communication, HOS/ELD compliance, DOT/FMCSA regulations, rate negotiations, and logistics career advice. Be concise, professional, and encouraging. Use specific examples when possible. If asked about something outside trucking/dispatch, politely redirect to dispatch topics. Keep responses under 200 words unless the question requires detailed explanation.`;

// Fallback responses for when the AI API is unavailable
function getFallbackResponse(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes('load board') || lower.includes('find load') || lower.includes('best load')) {
    return "Major load boards are essential tools for finding freight in the industry. Major platforms offer real-time availability, rate benchmarks, and broker credit tools. For beginners, I recommend starting with a major load board — look for loads with competitive per-mile rates, check the lane history, and always verify the broker's credit score before booking. Pro tip: Set up load alerts for your preferred lanes so you get notified instantly!";
  }

  if (lower.includes('broker') && (lower.includes('email') || lower.includes('write') || lower.includes('message') || lower.includes('contact'))) {
    return "When emailing brokers, always include: 1) Your MC/DOT number, 2) Equipment type and availability, 3) Preferred lanes, 4) A professional subject line like 'Available Equipment — [Lane] — [Date]'. Keep it concise — brokers get hundreds of emails daily. Always follow up with a phone call if you don't hear back within 24 hours.";
  }

  if (lower.includes('rate') || lower.includes('rpm') || lower.includes('per mile') || lower.includes('pricing') || lower.includes('negotiat')) {
    return "Rate per mile (RPM) is calculated by dividing the total rate by the total miles. For example, a $2,500 load going 1,000 miles = $2.50/mile. When negotiating rates: 1) Know your break-even RPM, 2) Check the lane average using industry rate tools, 3) Start high and negotiate down, 4) Never accept below your minimum. Current national average for dry van — rates vary by region and market conditions.";
  }

  if (lower.includes('hos') || lower.includes('hour') || lower.includes('eld') || lower.includes('drive time') || lower.includes('log')) {
    return "Hours of Service (HOS) regulations limit drivers to: 11 hours of driving after 10 consecutive hours off duty, 14-hour on-duty window, 30-minute break required after 8 hours of driving, and 60/70-hour limits in 7/8 days. ELD is mandatory for most CMVs. Key tips: Plan trips around HOS limits, use the 'sleeper berth' provision for split breaks, and always leave a 15-minute buffer.";
  }

  return "Great question! In dispatch, this typically involves understanding the freight lifecycle — from booking to delivery. The key is to always have a plan: know your lanes, maintain broker relationships, and stay on top of compliance. I'd recommend checking out our courses on Load Board Mastery and Broker Communication for a deep dive.";
}

interface ChatMessageInput {
  role: 'user' | 'assistant';
  content: string;
}

const chatRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string().trim().min(1).max(1200),
    })
  ).min(1).max(10),
});

export async function POST(request: NextRequest) {
  try {
    if (shouldUseSupabase()) {
      const token = getBearerToken(request);
      if (!token) {
        return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
      }

      const { data, error } = await getSupabaseUserClient().auth.getUser(token);
      if (error || !data.user) {
        return NextResponse.json({ error: 'Invalid session.' }, { status: 401 });
      }
    }

    const parsed = chatRequestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Messages array is invalid.' }, { status: 400 });
    }

    const messages: ChatMessageInput[] = parsed.data.messages;

    // Try using the AI SDK
    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default;
      const zai = await ZAI.create();

      const apiMessages = [
        { role: 'system' as const, content: SYSTEM_PROMPT },
        ...messages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      ];

      const completion = await zai.chat.completions.create({
        messages: apiMessages,
        model: 'glm-4.1-flash',
      });

      const assistantMessage =
        completion.choices?.[0]?.message?.content ||
        completion.choices?.[0]?.text ||
        '';

      if (assistantMessage) {
        return NextResponse.json({ message: assistantMessage });
      }
    } catch (aiError) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('AI SDK unavailable, using fallback response.');
      }
    }

    // Fallback to local responses
    const lastUserMessage = messages.filter((m) => m.role === 'user').pop();
    const fallbackMessage = lastUserMessage
      ? getFallbackResponse(lastUserMessage.content)
      : "Hello! I'm Dispatch Buddy, your AI logistics assistant. How can I help you today?";

    return NextResponse.json({ message: fallbackMessage });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Chat API error:', error);
    }
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}
