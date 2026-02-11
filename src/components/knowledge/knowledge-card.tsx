import type { Knowledge } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface KnowledgeCardProps {
  item: Knowledge;
}

const categoryColors: Record<Knowledge['category'], string> = {
    SOP: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-800',
    Product: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/50 dark:text-purple-200 dark:border-purple-800',
    Tacit: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-200 dark:border-green-800',
};

export function KnowledgeCard({ item }: KnowledgeCardProps) {
  const date = item.updatedAt?.toDate ? item.updatedAt.toDate() : new Date(item.updatedAt);
  
  return (
    <Link href={`/knowledge/${item.id}`} className="flex h-full">
      <Card className="flex flex-col h-full w-full transition-transform transform hover:-translate-y-1 hover:shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-start">
              <CardTitle className="font-headline text-lg mb-2">{item.title}</CardTitle>
              <Badge variant="outline" className={`${categoryColors[item.category]} shrink-0`}>{item.category}</Badge>
          </div>
          <CardDescription className="line-clamp-3">{item.content}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow"></CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground">
            Updated {formatDistanceToNow(date, { addSuffix: true })}
          </p>
        </CardFooter>
      </Card>
    </Link>
  );
}
