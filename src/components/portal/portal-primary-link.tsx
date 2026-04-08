import Link from "next/link";

/** Lien CTA visible sans dependre du bundle Tailwind (styles inline). */
const style: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px 20px",
  borderRadius: 9999,
  backgroundColor: "#0369a1",
  color: "#ffffff",
  fontSize: 14,
  fontWeight: 600,
  textDecoration: "none",
  boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
  border: "none",
  cursor: "pointer",
};

type Props = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

export function PortalPrimaryLink({ href, children, className }: Props) {
  return (
    <Link href={href} prefetch={false} style={style} className={className}>
      {children}
    </Link>
  );
}
