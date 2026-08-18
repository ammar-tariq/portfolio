import { getSiteContent } from "@/lib/content";
import { ArchitectureForm } from "@/components/admin/architecture-form";

export default async function ArchitectureAdminPage() {
  const content = await getSiteContent();
  return (
    <div>
      <h1 className="font-serif text-3xl">Architecture</h1>
      <p className="mt-2 text-sm text-muted">Identity graph, system layers, AI pipeline, and concepts.</p>
      <div className="mt-8">
        <ArchitectureForm initial={content.architecture} />
      </div>
    </div>
  );
}
