import type { ReactNode } from "react";
import clsx from "clsx";

export function DocH2({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} className="scroll-mt-24 border-b border-slate-200 pb-2 text-xl font-semibold text-kbio-navy">
      {children}
    </h2>
  );
}

export function DocH3({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h3 id={id} className="scroll-mt-24 text-lg font-semibold text-slate-900">
      {children}
    </h3>
  );
}

export function DocTable({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={clsx("overflow-x-auto rounded-lg border border-slate-200", className)}>
      <table className="w-full min-w-[520px] text-left text-sm">{children}</table>
    </div>
  );
}

export function DocTh({ children }: { children: ReactNode }) {
  return <th className="border-b border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-slate-700">{children}</th>;
}

export function DocTd({ children }: { children?: ReactNode }) {
  return <td className="border-b border-slate-100 px-3 py-2 text-slate-700 align-top">{children ?? "—"}</td>;
}

export function DocUl({ children }: { children: ReactNode }) {
  return <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">{children}</ul>;
}

export function DocOl({ children }: { children: ReactNode }) {
  return <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-700">{children}</ol>;
}

export function DocP({ children }: { children: ReactNode }) {
  return <p className="text-sm leading-relaxed text-slate-700">{children}</p>;
}
