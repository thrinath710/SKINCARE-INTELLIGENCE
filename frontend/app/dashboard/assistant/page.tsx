'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

import { chatWithAI } from '@/lib/api-client';
import { useAppStore } from '@/lib/store';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { Bot, User, Sparkles } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AssistantPage() {

  const profile = useAppStore((s) => s.profile);

  const [input, setInput] = useState('');

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Hi! I’m your AI Skin Assistant. Ask me anything about skincare, ingredients, acne, hyperpigmentation, routines, or products.',
    },
  ]);

  const mutation = useMutation({
    mutationFn: chatWithAI,

    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.response,
        },
      ]);
    },
  });

  const handleSend = () => {

    if (!input.trim()) return;

    const userMessage = input;

    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: userMessage,
      },
    ]);

    setInput('');

    mutation.mutate({
      message: userMessage,
      skin_type: profile?.skin_type,
      skin_concerns: profile?.skin_concerns,
      climate_zone: profile?.climate_zone,
      budget_range: profile?.budget_range,
    });
  };

  return (
    <div className="space-y-6">

      <div>
        <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <Sparkles className="h-6 w-6 text-slate-700" />
          AI Skin Assistant
        </h2>

        <p className="mt-1 text-slate-500">
          Ask skincare questions personalised to your skin profile.
        </p>
      </div>

      <Card className="border-slate-200">
        <CardContent className="space-y-4 p-4">

          <div className="max-h-[500px] space-y-4 overflow-y-auto">

            {messages.map((message, index) => (

              <div
                key={index}
                className={`flex ${
                  message.role === 'user'
                    ? 'justify-end'
                    : 'justify-start'
                }`}
              >

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                    message.role === 'user'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-900'
                  }`}
                >

                  <div className="mb-1 flex items-center gap-2 text-xs font-semibold opacity-70">
                    {message.role === 'user' ? (
                      <>
                        <User className="h-3 w-3" />
                        You
                      </>
                    ) : (
                      <>
                        <Bot className="h-3 w-3" />
                        AI Assistant
                      </>
                    )}
                  </div>

                  {message.content}

                </div>
              </div>
            ))}

            {mutation.isPending && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-500">
                  AI is thinking...
                </div>
              </div>
            )}

          </div>

          <div className="flex gap-2">

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about acne, ingredients, products, routines..."
              rows={2}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:border-slate-400 focus:outline-none"
            />

            <Button
              onClick={handleSend}
              disabled={mutation.isPending}
              className="bg-slate-900 text-white hover:bg-slate-700"
            >
              Send
            </Button>

          </div>

        </CardContent>
      </Card>

    </div>
  );
}