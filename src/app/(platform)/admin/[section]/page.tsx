import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ section: string }>;
};

export default async function AdminSectionPage({ params }: Props) {
  const { section: _section } = await params;
  redirect("/portal/admin");
}
