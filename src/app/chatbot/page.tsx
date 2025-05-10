
import ChatInterface from "@/components/chatbot/chat-interface";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot } from "lucide-react";

export const metadata = {
  title: "RPA & Low-Code Chatbot - TechFront",
  description: "Ask our AI assistant about Robotic Process Automation and Low-Code/No-Code platforms.",
};

export default function ChatbotPage() {
  return (
    <div className="container mx-auto py-8 px-4 flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
      <Card className="w-full max-w-2xl mx-auto shadow-xl flex flex-col h-[70vh]">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            <span>RPA & Low-Code Assistant</span>
          </CardTitle>
          <CardDescription>Ask me anything about Robotic Process Automation or Low-Code/No-Code platforms.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 flex-grow overflow-hidden"> {/* Ensure ChatInterface can grow */}
          <ChatInterface initialMessage="Hello! I'm an expert in RPA and Low-Code/No-Code platforms. How can I help you today?" />
        </CardContent>
        {/* Footer is now part of ChatInterface's direct output */}
      </Card>
    </div>
  );
}
