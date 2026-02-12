"use client";

import { useState, useMemo, useCallback } from "react";
import type { Knowledge } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle } from "lucide-react";
import { columns } from "./columns";
import { KnowledgeDialog } from "./knowledge-dialog";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc, deleteDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useIsAdmin } from "@/hooks/use-is-admin";

export function KnowledgeDataTable() {
  const firestore = useFirestore();
  const isAdmin = useIsAdmin();
  const { toast } = useToast();
  const [filter, setFilter] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Knowledge | null>(null);

  const knowledgeQuery = useMemoFirebase(() => 
    firestore ? query(collection(firestore, 'knowledge'), orderBy('updatedAt', 'desc')) : null,
    [firestore]
  );
  
  const { data, isLoading: loading } = useCollection<Knowledge>(knowledgeQuery);

  const handleEdit = useCallback((item: Knowledge) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  }, []);
  
  const handleDelete = useCallback(async (id: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, "knowledge", id));
      toast({ title: "Success", description: "Item deleted successfully." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to delete item." });
    }
  }, [firestore, toast]);

  const handleCreate = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
  };
  
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
  };

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter(item =>
      item.title.toLowerCase().includes(filter.toLowerCase()) ||
      item.content.toLowerCase().includes(filter.toLowerCase())
    )
  }, [data, filter]);

  const tableColumns = useMemo(() => columns(isAdmin, handleEdit, handleDelete), [isAdmin, handleEdit, handleDelete]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Filter knowledge..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-sm"
        />
        {isAdmin && (
          <Button onClick={handleCreate}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New
          </Button>
        )}
      </div>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {tableColumns.map(col => (
                <TableHead key={col.header}>{col.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {tableColumns.map(col => (
                    <TableCell key={col.accessor}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filteredData.length > 0 ? (
              filteredData.map(item => (
                <TableRow key={item.id}>
                  {tableColumns.map(col => (
                    <TableCell key={col.accessor}>
                      {col.cell(item)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={tableColumns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <KnowledgeDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        item={editingItem}
      />
    </div>
  );
}
