import { cn } from "@/lib/utils";
import { type ChatMessage } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Bot, User } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

interface ChatMessageBubbleProps {
  message: ChatMessage;
  isLoading?: boolean;
}

export function ChatMessageBubble({ message, isLoading }: ChatMessageBubbleProps) {
  const isUser = message.role === 'user';
  
  return (
    <div className={cn("flex items-start gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback>
            <Bot className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}
      
      <div 
        className={cn(
          "max-w-md rounded-lg px-4 py-3 text-sm",
          isUser 
            ? "bg-primary text-primary-foreground" 
            : "bg-card border"
        )}
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-3 rounded-full" />
          </div>
        ) : (
          <p className="whitespace-pre-wrap">{message.content}</p>
        )}
      </div>
      
      {isUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback>
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
