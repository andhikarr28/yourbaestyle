"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { chatbotAnswersQuestions, type ChatbotAnswersQuestionsOutput } from "@/ai/flows/chatbot-answers-questions";
import { useAuth } from "@/components/auth-provider";
import { type ChatMessage, type Knowledge } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizonal, Bot, HelpCircle } from "lucide-react";
import { ChatMessageBubble } from "./chat-message";
import { ScrollArea } from "../ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query } from "firebase/firestore";
import { useChat } from "./chat-provider";

export default function ChatView() {
  const { user } = useAuth();
  const firestore = useFirestore();
  const { messages, setMessages, isLoading, setIsLoading } = useChat();
  const [input, setInput] = useState("");
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
      setTimeout(() => {
        scrollAreaRef.current?.scrollTo({
          top: scrollAreaRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      if (!knowledgeBase || knowledgeBase.trim() === "") {
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Informasi belum tersedia. Silakan hubungi admin.",
        };
        setMessages((prev) => [...prev, aiMessage]);
        setIsLoading(false);
        return;
      }
      
      const { answer }: ChatbotAnswersQuestionsOutput = await chatbotAnswersQuestions({ 
        question: currentInput,
        knowledge: knowledgeBase,
      });

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: answer,
      };
      setMessages((prev) => [...prev, aiMessage]);
      
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
    <div className="h-full">
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
                {messages.length === 0 && (
                  <div className="text-center text-muted-foreground p-8 flex flex-col items-center justify-center h-full">
                      <HelpCircle className="mx-auto h-12 w-12" />
                      <h2 className="mt-4 text-lg font-medium">Selamat Datang!</h2>
                      <p className="mt-1">Ketik pertanyaan Anda di bawah untuk memulai.</p>
                  </div>
                )}
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
    </div>
  );
}
