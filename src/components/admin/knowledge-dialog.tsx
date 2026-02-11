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
import { createItemAction, updateItemAction } from "@/app/admin/actions";
import { useToast } from "@/hooks/use-toast";

interface KnowledgeDialogProps {
  isOpen: boolean;
  onClose: (refresh: boolean) => void;
  item: Knowledge | null;
}

export function KnowledgeDialog({ isOpen, onClose, item }: KnowledgeDialogProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<Knowledge["category"]>("SOP");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setContent(item.content);
      setCategory(item.category);
    } else {
      setTitle("");
      setContent("");
      setCategory("SOP");
    }
  }, [item, isOpen]);

  const handleSubmit = async () => {
    setLoading(true);
    const data = { title, content, category };
    const result = item
      ? await updateItemAction(item.id, data)
      : await createItemAction(data);
    
    setLoading(false);
    if (result.success) {
      toast({ title: "Success", description: `Item ${item ? 'updated' : 'created'} successfully.` });
      onClose(true);
    } else {
      toast({ variant: "destructive", title: "Error", description: result.error });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose(false)}>
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
          <Button variant="outline" onClick={() => onClose(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
