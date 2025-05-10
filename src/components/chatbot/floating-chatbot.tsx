
'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, X, Zap, Bot } from 'lucide-react';
import ChatInterface from './chat-interface';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const FUNNY_MESSAGE = "Psst... heard you're into RPA and low-code? So am I! 😉 Ask me anything!";

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [showTeaser, setShowTeaser] = useState(false);
  const [hasBeenOpened, setHasBeenOpened] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen && !hasBeenOpened) { // Only show teaser if chat hasn't been opened yet at all
        setShowTeaser(true);
      }
    }, 15000); // 15 seconds

    return () => clearTimeout(timer);
  }, [isOpen, hasBeenOpened]);

  const toggleChat = () => {
    const newIsOpenState = !isOpen;
    setIsOpen(newIsOpenState);
    setShowTeaser(false); 
    if (newIsOpenState && !hasBeenOpened) {
        setHasBeenOpened(true); 
    }
  };

  const openChatFromTeaser = () => {
    setIsOpen(true);
    setShowTeaser(false);
    if(!hasBeenOpened) {
        setHasBeenOpened(true);
    }
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-20 right-4 z-[60] w-full max-w-sm md:max-w-md flex flex-col shadow-xl h-[calc(100vh-12rem)] max-h-[500px] sm:max-h-[550px] rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between p-3 border-b">
            <div className="flex items-center gap-2">
              <Bot className="h-6 w-6 text-primary" />
              <CardTitle className="text-lg">RPA & Low-Code Assistant</CardTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={toggleChat} aria-label="Close chat">
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent className="p-0 flex-grow overflow-hidden">
            <ChatInterface initialMessage={!hasBeenOpened || messages.length === 0 ? "Hello! I'm your RPA & Low-Code expert. How can I assist you today?" : undefined} />
          </CardContent>
        </Card>
      )}

      {/* Teaser Message */}
      {!isOpen && showTeaser && (
        <div
          className="fixed bottom-24 right-4 z-[60] p-3 rounded-lg bg-accent text-accent-foreground shadow-lg cursor-pointer w-auto max-w-[280px] animate-in fade-in-0 slide-in-from-bottom-5"
          onClick={openChatFromTeaser}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openChatFromTeaser(); }}
        >
          <div className="flex items-start gap-2">
            <Zap className="h-5 w-5 mt-0.5 shrink-0" />
            <p className="text-sm">{FUNNY_MESSAGE}</p>
            <button onClick={(e) => { e.stopPropagation(); setShowTeaser(false); }} className="ml-auto shrink-0" aria-label="Dismiss teaser">
                <X className="h-4 w-4 opacity-70 hover:opacity-100"/>
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <Button
        variant="default" // Changed to default for primary color
        size="lg"
        className="fixed bottom-4 right-4 z-[60] rounded-full p-0 h-16 w-16 shadow-xl flex items-center justify-center"
        onClick={toggleChat}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? <X className="h-7 w-7" /> : <MessageSquare className="h-7 w-7" />}
      </Button>
    </>
  );
}
