import AppLayout from "@/components/layout/app-layout";
import KnowledgeList from "@/components/knowledge/knowledge-list";

export default function KnowledgePage() {
  return (
    <AppLayout>
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold font-headline mb-6">Knowledge Library</h1>
        <KnowledgeList />
      </div>
    </AppLayout>
  );
}
