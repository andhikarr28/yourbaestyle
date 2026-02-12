"use client";

import type { ChatbotInteraction } from "@/types";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
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

export const columns = (
    isAdmin: boolean,
    onEdit: (item: ChatbotInteraction) => void,
    onDelete: (id: string) => Promise<void>
) => {
  const baseColumns = [
    {
      header: 'Question',
      accessor: 'question',
      cell: (item: ChatbotInteraction) => <div className="font-medium line-clamp-2">{item.question}</div>
    },
    {
      header: 'Answer',
      accessor: 'answer',
      cell: (item: ChatbotInteraction) => <div className="text-sm text-muted-foreground line-clamp-2">{item.answer}</div>
    },
    {
      header: 'Category',
      accessor: 'category',
      cell: (item: ChatbotInteraction) => <Badge variant="secondary">{item.category}</Badge>
    },
    {
      header: 'Created At',
      accessor: 'createdAt',
      cell: (item: ChatbotInteraction) => {
        if (!item.createdAt) return null;
        const date = item.createdAt?.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
        return <div className="text-sm">{format(date, 'PPp')}</div>
      }
    },
  ];

  if (isAdmin) {
    return [
        ...baseColumns,
        {
          header: 'Actions',
          accessor: 'actions',
          cell: (item: ChatbotInteraction) => (
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
                      This action cannot be undone. This will permanently delete the Q&A item.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(item.id)} className="bg-destructive hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
          )
        }
    ]
  }

  return baseColumns;
};
