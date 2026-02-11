"use client";

import { useState, useEffect } from "react";
import type { Knowledge } from "@/types";
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
import { useAuth } from "@/components/auth-provider";
import { useFirestore, addDocumentNonBlocking, setDocumentNonBlocking } from "@/firebase";
import { collection, doc, serverTimestamp } from "firebase/firestore";

interface KnowledgeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  item: Knowledge | null;
}

export function KnowledgeDialog({ isOpen, onClose, item }: KnowledgeDialogProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<Knowledge["category"]>("SOP");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
        if (item) {
          setTitle(item.title);
          setContent(item.content);
          setCategory(item.category);
        } else {
          setTitle("");
          setContent("");
          setCategory("SOP");
        }
    }
  }, [item, isOpen]);

  const handleSubmit = async () => {
    if (!firestore || !user) {
        toast({ variant: "destructive", title: "Error", description: "Not authenticated." });
        return;
    }

    setLoading(true);
    
    const knowledgeData = {
      title,
      content,
      category,
      authorId: user.uid,
      updatedAt: serverTimestamp(),
    };

    try {
        if (item) {
          const docRef = doc(firestore, "knowledge", item.id);
          setDocumentNonBlocking(docRef, knowledgeData, { merge: true });
        } else {
          const colRef = collection(firestore, "knowledge");
          addDocumentNonBlocking(colRef, { ...knowledgeData, createdAt: serverTimestamp() });
        }
        
        toast({ title: "Success", description: `Item ${item ? 'updated' : 'created'} successfully.` });
        onClose();
    } catch (error: any) {
        toast({ variant: "destructive", title: "Error", description: error.message || "An unexpected error occurred." });
    } finally {
        setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">
            {item ? "Edit Knowledge Item" : "Create Knowledge Item"}
          </DialogTitle>
          <DialogDescription>
            {item ? "Update the details of the knowledge item." : "Add a new item to the knowledge base."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Select value={category} onValueChange={(value) => setCategory(value as Knowledge["category"])}>
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
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="content" className="text-right pt-2">
              Content
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="col-span-3"
              rows={5}
            />
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
