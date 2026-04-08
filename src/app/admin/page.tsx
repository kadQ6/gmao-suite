import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Administration</h2>
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-600">Connecte en tant que: {session.user.email}</p>
        <p className="mt-1 text-sm text-slate-600">Role: {session.user.role}</p>
      </div>
    </section>
  );
}
