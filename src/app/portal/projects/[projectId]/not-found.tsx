import Link from "next/link";

export default function ProjectNotFound() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
      <h1 className="text-lg font-semibold text-slate-900">Projet introuvable</h1>
      <p className="mt-2 text-sm text-slate-600">Ce projet n&apos;existe pas ou a ete supprime.</p>
      <Link href="/portal/projects" className="mt-6 inline-block text-sm font-medium text-kbio-teal hover:underline">
        Retour a la liste des projets
      </Link>
    </div>
  );
}
