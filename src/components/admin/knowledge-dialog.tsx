"use client";

import { useState, useEffect } from "react";
import type { ChatbotInteraction } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, addDocumentNonBlocking, setDocumentNonBlocking } from "@/firebase";
import { collection, doc, serverTimestamp } from "firebase/firestore";

interface KnowledgeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  item: ChatbotInteraction | null;
}

export function KnowledgeDialog({ isOpen, onClose, item }: KnowledgeDialogProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState<ChatbotInteraction["category"]>("SOP");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();

  useEffect(() => {
    if (isOpen) {
        if (item) {
          setQuestion(item.question);
          setAnswer(item.answer);
          setCategory(item.category);
        } else {
          setQuestion("");
          setAnswer("");
          setCategory("SOP");
        }
    }
  }, [item, isOpen]);

  const handleSubmit = async () => {
    if (!firestore) {
        toast({ variant: "destructive", title: "Error", description: "Firestore not available." });
        return;
    }

    setLoading(true);
    
    const interactionData = {
      question,
      answer,
      category,
      updatedAt: serverTimestamp(),
    };

    try {
        if (item) {
          const docRef = doc(firestore, "chatbotInteractions", item.id);
          setDocumentNonBlocking(docRef, interactionData, { merge: true });
        } else {
          const colRef = collection(firestore, "chatbotInteractions");
          addDocumentNonBlocking(colRef, { ...interactionData, createdAt: serverTimestamp() });
        }
        
        toast({ title: "Success", description: `Q&A item ${item ? 'updated' : 'created'} successfully.` });
        onClose();
    } catch (error: any) {
        toast({ variant: "destructive", title: "Error", description: error.message || "An unexpected error occurred." });
    } finally {
        setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-headline">
            {item ? "Edit Q&A Item" : "Create Q&A Item"}
          </DialogTitle>
          <DialogDescription>
            {item ? "Update the details of the stored Q&A." : "Add a new question and answer to the chatbot memory."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="question" className="text-right pt-2">
              Question
            </Label>
            <Textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="col-span-3"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="answer" className="text-right pt-2">
              Answer
            </Label>
            <Textarea
              id="answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="col-span-3"
              rows={5}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Select value={category} onValueChange={(value) => setCategory(value as ChatbotInteraction["category"])}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="SOP">SOP</SelectItem>
                    <SelectItem value="Product">Product</SelectItem>
                    <SelectItem value="Tacit">Tacit</SelectItem>
                </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onClose()} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
