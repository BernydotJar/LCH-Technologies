
'use client';

import type { FormEvent } from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { askRpaLowcodeBot } from '@/app/actions/chatbot';
import { Bot, User, Loader2, SendHorizonal } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  initialMessage?: string;
}

export default function ChatInterface({ initialMessage }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const addMessage = useCallback((sender: 'user' | 'bot', text: string) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { id: crypto.randomUUID(), sender, text, timestamp: new Date() },
    ]);
  }, []);

  useEffect(() => {
    if (initialMessage && messages.length === 0) {
      addMessage('bot', initialMessage);
    }
    // Scroll to bottom when messages change
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages, initialMessage, addMessage]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    addMessage('user', userInput);
    const currentInput = userInput;
    setUserInput('');
    setIsLoading(true);

    try {
      const result = await askRpaLowcodeBot({ userInput: currentInput });
      if (result.success && result.response) {
        addMessage('bot', result.response);
      } else {
        addMessage('bot', result.error || 'Sorry, I could not process your request.');
      }
    } catch (error) {
      addMessage('bot', 'An unexpected error occurred. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <ScrollArea className="h-full p-4 flex-grow" ref={scrollAreaRef}>
          <div className="space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'bot' && (
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback><Bot size={18}/></AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 shadow ${
                    msg.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground text-left'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                 {msg.sender === 'user' && (
                  <Avatar className="h-8 w-8 shrink-0">
                     <AvatarFallback><User size={18}/></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-end gap-2 justify-start">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback><Bot size={18}/></AvatarFallback>
                </Avatar>
                <div className="max-w-[70%] rounded-lg px-4 py-2 shadow bg-secondary text-secondary-foreground">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-4 border-t bg-background">
          <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
            <Input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-grow"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              disabled={isLoading || !userInput.trim()} 
              size="icon" 
              aria-label="Send message"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <SendHorizonal className="h-5 w-5" />}
            </Button>
          </form>
        </div>
    </>
  );
}

