"use client";

import { useState, useEffect } from 'react';
import { getKnowledgeItems } from '@/services/knowledge-service';
import type { Knowledge } from '@/types';
import { KnowledgeCard } from './knowledge-card';
import { Skeleton } from '../ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const categories: Knowledge['category'][] = ['SOP', 'Product', 'Tacit'];

export default function KnowledgeList() {
  const [knowledge, setKnowledge] = useState<Knowledge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadKnowledge() {
      try {
        const items = await getKnowledgeItems();
        setKnowledge(items);
      } catch (error) {
        console.error('Failed to fetch knowledge items:', error);
      } finally {
        setLoading(false);
      }
    }
    loadKnowledge();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="all">All</TabsTrigger>
        {categories.map(category => (
          <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
        ))}
      </TabsList>
      
      <TabsContent value="all">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {knowledge.map(item => (
            <KnowledgeCard key={item.id} item={item} />
          ))}
        </div>
      </TabsContent>
      
      {categories.map(category => (
        <TabsContent key={category} value={category}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {knowledge.filter(item => item.category === category).map(item => (
              <KnowledgeCard key={item.id} item={item} />
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
