'use client';

import { useParams, useRouter } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Knowledge } from '@/types';
import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';

const categoryColors: Record<Knowledge['category'], string> = {
    SOP: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-800',
    Product: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/50 dark:text-purple-200 dark:border-purple-800',
    Tacit: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-200 dark:border-green-800',
};

export default function KnowledgeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const firestore = useFirestore();
  const id = params.id as string;

  const knowledgeRef = useMemoFirebase(
    () => (firestore && id ? doc(firestore, 'knowledge', id) : null),
    [firestore, id]
  );

  const { data: item, isLoading } = useDoc<Knowledge>(knowledgeRef);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto">
            <div className="mb-4">
                <Skeleton className="h-10 w-40" />
            </div>
          <Card>
            <CardHeader>
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/4" />
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (!item) {
    return (
      <AppLayout>
        <div className="container mx-auto text-center">
          <h1 className="text-2xl font-bold font-headline">Knowledge Not Found</h1>
          <p className="text-muted-foreground mt-2">The requested knowledge item could not be found.</p>
          <Button onClick={() => router.push('/knowledge')} className="mt-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Library
          </Button>
        </div>
      </AppLayout>
    );
  }
  
  const date = item.updatedAt?.toDate ? item.updatedAt.toDate() : new Date(item.updatedAt);

  return (
    <AppLayout>
      <div className="container mx-auto">
        <Button variant="ghost" onClick={() => router.push('/knowledge')} className="mb-4 -ml-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Library
        </Button>
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start gap-4">
              <CardTitle className="font-headline text-3xl">{item.title}</CardTitle>
              <Badge variant="outline" className={`${categoryColors[item.category]} shrink-0`}>{item.category}</Badge>
            </div>
            <CardDescription>
              Last updated: {format(date, 'PPp')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap">{item.content}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
