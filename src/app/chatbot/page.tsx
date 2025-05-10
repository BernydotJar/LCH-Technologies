
import ChatInterface from "@/components/chatbot/chat-interface";

export const metadata = {
  title: "RPA & Low-Code Chatbot - TechFront",
  description: "Ask our AI assistant about Robotic Process Automation and Low-Code/No-Code platforms.",
};

export default function ChatbotPage() {
  return (
    <div className="container mx-auto py-8 px-4 flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
       {/* Removed title and description from here as they are in ChatInterface CardHeader */}
      <ChatInterface />
    </div>
  );
}
