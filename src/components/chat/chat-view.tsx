"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { chatbotAnswersQuestions } from "@/ai/flows/chatbot-answers-questions";
import { useAuth } from "@/components/auth-provider";
import { type ChatMessage, type Knowledge } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizonal, Bot } from "lucide-react";
import { ChatMessageBubble } from "./chat-message";
import { ScrollArea } from "../ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useFirestore, addDocumentNonBlocking, useCollection, useMemoFirebase } from "@/firebase";
import { collection, serverTimestamp, query } from "firebase/firestore";

export default function ChatView() {
  const { user } = useAuth();
  const firestore = useFirestore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Fetch all knowledge base articles
  const knowledgeQuery = useMemoFirebase(() => 
    firestore ? query(collection(firestore, 'knowledge')) : null,
    [firestore]
  );
  const { data: knowledgeData } = useCollection<Knowledge>(knowledgeQuery);

  const knowledgeBase = useMemo(() => {
    if (!knowledgeData) return "";
    return knowledgeData
      .map(item => `Judul: ${item.title}\nKategori: ${item.category}\nKonten: ${item.content}`)
      .join('\n\n---\n\n');
  }, [knowledgeData]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);
  
  const logInteraction = (userId: string, userMessage: string, botResponse: string) => {
    if (!firestore) return;
    const chatLogRef = collection(firestore, 'users', userId, 'chatLogs');
    const logEntry = {
      userId,
      userMessage,
      botResponse,
      timestamp: serverTimestamp(),
    };
    addDocumentNonBlocking(chatLogRef, logEntry);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user || !knowledgeBase) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { answer } = await chatbotAnswersQuestions({ 
        question: input,
        knowledge: knowledgeBase,
      });
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: answer,
      };
      setMessages((prev) => [...prev, aiMessage]);
      logInteraction(user.uid, userMessage.content, aiMessage.content);
    } catch (error) {
      console.error("Error getting AI response:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Maaf, terjadi kesalahan. Silakan coba lagi nanti.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline text-xl flex items-center gap-2">
          <Bot />
          YourbAIstyle Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col p-0">
        <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <ChatMessageBubble key={message.id} message={message} />
            ))}
            {isLoading && (
              <ChatMessageBubble
                message={{
                  id: "loading",
                  role: "assistant",
                  content: "...",
                }}
                isLoading={true}
              />
            )}
          </div>
        </ScrollArea>
        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanyakan sesuatu dalam Bahasa Indonesia..."
              className="flex-grow resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              rows={1}
            />
            <Button type="submit" disabled={isLoading || !input.trim()} size="icon">
              <SendHorizonal />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
