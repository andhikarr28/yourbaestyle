"use client";

import type { Knowledge } from "@/types";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useFirestore } from "@/firebase";
import { doc, deleteDoc } from "firebase/firestore";

export const columns = (
    onEdit: (item: Knowledge) => void
) => {
  const { toast } = useToast();
  const firestore = useFirestore();
    
  const handleDelete = async (id: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, "knowledge", id));
      toast({ title: "Success", description: "Item deleted successfully." });
      // Real-time listener in data-table will handle UI update.
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to delete item." });
    }
  };

  return [
    {
      header: 'Title',
      accessor: 'title',
      cell: (item: Knowledge) => <div className="font-medium">{item.title}</div>
    },
    {
      header: 'Category',
      accessor: 'category',
      cell: (item: Knowledge) => <Badge variant="secondary">{item.category}</Badge>
    },
    {
      header: 'Content',
      accessor: 'content',
      cell: (item: Knowledge) => <div className="text-sm text-muted-foreground line-clamp-2">{item.content}</div>
    },
    {
      header: 'Last Updated',
      accessor: 'updatedAt',
      cell: (item: Knowledge) => {
        const date = item.updatedAt?.toDate ? item.updatedAt.toDate() : new Date(item.updatedAt);
        return <div className="text-sm">{format(date, 'PPp')}</div>
      }
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (item: Knowledge) => (
        <AlertDialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(item)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                </DropdownMenuItem>
              </AlertDialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
          <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the knowledge item.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-destructive hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      )
    }
  ];
};
