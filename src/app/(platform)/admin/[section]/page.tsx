import { notFound } from "next/navigation";
import { PlatformPage } from "@/components/platform/platform-shell";

type Props = {
  params: Promise<{ section: string }>;
};

const allowed = ["clients", "projects", "users", "documents"] as const;

export default async function AdminSectionPage({ params }: Props) {
  const { section } = await params;
  if (!allowed.includes(section as (typeof allowed)[number])) {
    notFound();
  }

  return (
    <PlatformPage
      title={`Admin / ${section}`}
      description="Initial scaffold for internal operations (K'BIO-only): management and governance screens."
    />
  );
}
