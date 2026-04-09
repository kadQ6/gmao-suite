import { notFound } from "next/navigation";
import Link from "next/link";
import { PlatformPage } from "@/components/platform/platform-shell";

type Props = {
  params: Promise<{ id: string; tab: string }>;
};

const tabs = ["overview", "gmao", "project-tracking", "documents", "history"] as const;

export default async function ProjectTabPage({ params }: Props) {
  const { id, tab } = await params;
  if (!tabs.includes(tab as (typeof tabs)[number])) {
    notFound();
  }

  return (
    <PlatformPage
      title={`Project ${id} / ${tab}`}
      description="Initial scaffold for project detail tabs. Next step: connect real data and role-based visibility."
    >
      <nav className="flex flex-wrap gap-2">
        {tabs.map((item) => (
          <Link
            key={item}
            href={`/projects/${id}/${item}`}
            className={`rounded-full px-4 py-2 text-sm ${
              item === tab ? "bg-kbio-navy text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {item}
          </Link>
        ))}
      </nav>
    </PlatformPage>
  );
}
