import { notFound, redirect } from "next/navigation";

type Props = {
  params: Promise<{ id: string; tab: string }>;
};

const tabs = ["overview", "gmao", "project-tracking", "documents", "history"] as const;

export default async function ProjectTabPage({ params }: Props) {
  const { id, tab } = await params;
  if (!tabs.includes(tab as (typeof tabs)[number])) {
    notFound();
  }
  if (tab === "overview" || tab === "history" || tab === "documents") {
    redirect(`/portal/projects/${id}`);
  }
  if (tab === "gmao") {
    redirect(`/portal/projects/${id}/assets`);
  }
  redirect(`/portal/projects/${id}/tasks`);
}
