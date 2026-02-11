"use client";

import { useState, useMemo } from 'react';
import type { Knowledge } from '@/types';
import { KnowledgeCard } from './knowledge-card';
import { Skeleton } from '../ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';

const categories: Knowledge['category'][] = ['SOP', 'Product', 'Tacit'];

export default function KnowledgeList() {
  const firestore = useFirestore();

  const knowledgeQuery = useMemoFirebase(() => 
    firestore ? query(collection(firestore, 'knowledge'), orderBy('updatedAt', 'desc')) : null,
    [firestore]
  );
  
  const { data: knowledge, isLoading: loading } = useCollection<Knowledge>(knowledgeQuery);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-lg" />
        ))}
      </div>
    );
  }

  const filteredKnowledge = (category: Knowledge['category'] | 'all') => {
    if (!knowledge) return [];
    if (category === 'all') return knowledge;
    return knowledge.filter(item => item.category === category);
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
          {filteredKnowledge('all').map(item => (
            <KnowledgeCard key={item.id} item={item} />
          ))}
        </div>
      </TabsContent>
      
      {categories.map(category => (
        <TabsContent key={category} value={category}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredKnowledge(category).map(item => (
              <KnowledgeCard key={item.id} item={item} />
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
