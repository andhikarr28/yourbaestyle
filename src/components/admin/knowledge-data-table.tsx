"use client";

import { useState, useEffect } from "react";
import type { Knowledge } from "@/types";
import { getKnowledgeItems } from "@/services/knowledge-service";
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

export function KnowledgeDataTable() {
  const [data, setData] = useState<Knowledge[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Knowledge | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const items = await getKnowledgeItems();
    setData(items);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (item: Knowledge) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };
  
  const handleCreate = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
  };
  
  const handleDialogClose = (refresh: boolean) => {
    setIsDialogOpen(false);
    setEditingItem(null);
    if (refresh) {
      fetchData();
    }
  };

  const filteredData = data.filter(item =>
    item.title.toLowerCase().includes(filter.toLowerCase()) ||
    item.content.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Filter knowledge..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={handleCreate}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {columns(handleEdit, fetchData).map(col => (
                <TableHead key={col.header}>{col.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={columns(handleEdit, fetchData).length}>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredData.length > 0 ? (
              filteredData.map(item => (
                <TableRow key={item.id}>
                  {columns(handleEdit, fetchData).map(col => (
                    <TableCell key={col.accessor}>
                      {col.cell(item)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns(handleEdit, fetchData).length} className="h-24 text-center">
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
