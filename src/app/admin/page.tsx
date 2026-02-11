import AppLayout from "@/components/layout/app-layout";
import { KnowledgeDataTable } from "@/components/admin/knowledge-data-table";
import { AdminGate } from "@/components/admin/admin-gate";

export default function AdminPage() {
  return (
    <AppLayout>
      <AdminGate>
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold font-headline mb-6">Content Management</h1>
          <KnowledgeDataTable />
        </div>
      </AdminGate>
    </AppLayout>
  );
}
