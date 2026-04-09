import Link from "next/link";
import { PlatformPage } from "@/components/platform/platform-shell";

export default function ProjectsPage() {
  return (
    <PlatformPage
      title="Projects"
      description="Initial scaffold for searchable project list with filters, sorting, and status badges."
    >
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
        Example detail route:{" "}
        <Link href="/projects/demo-project/overview" className="font-medium text-kbio-teal hover:underline">
          /projects/demo-project/overview
        </Link>
      </div>
    </PlatformPage>
  );
}
