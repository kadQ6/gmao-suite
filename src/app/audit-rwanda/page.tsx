"use client";

import { useState, useEffect, useMemo } from "react";

/* ── Types ── */
type View = "DASHBOARD" | "BYUMBA" | "CHUK" | "KAGBAYI" | "PLAN" | "ACTIONS" | "ALERTES" | "CONTRATS";
type ContratType = "Maintenance" | "Garantie" | "Location" | "Service" | "Autre";
const CONTRAT_TYPES: ContratType[] = ["Maintenance", "Garantie", "Location", "Service", "Autre"];
interface ContratPartage {
  id: string;
  titre: string;
  fournisseur: string;
  type: ContratType;
  sites: SiteKey[];
  dateDebut: string;
  dateFin: string;
  montant?: number;
  contact?: string;
  notes?: string;
  createdAt: string;
}

type ActionStatut = "À faire" | "En cours" | "Bloqué" | "Terminé";
const ACTION_STATUTS: ActionStatut[] = ["À faire", "En cours", "Bloqué", "Terminé"];
type ActionViewMode = "liste" | "kanban";

interface ActionItem {
  id: string;
  titre: string;
  description?: string;
  dmId?: string;
  dmModele?: string;
  site: SiteKey;
  responsable?: string;
  dateDebut?: string;
  deadline?: string;
  statut: ActionStatut;
  budgetEstime?: number;
  budgetReel?: number;
  panneId?: string;
  createdAt: string;
}
type SiteKey = "BYUMBA" | "CHUK" | "KAGBAYI";
type Statut = "Fonctionnel" | "Hors service" | "En attente" | "Inutilisé";
type PanelTab = "details" | "pannes" | "historique" | "pieces" | "kits";

type PanneEtat = "Signalé" | "Diagnostiqué" | "En réparation" | "Test" | "Clôturé";
const PANNE_ETATS: PanneEtat[] = ["Signalé", "Diagnostiqué", "En réparation", "Test", "Clôturé"];

type CauseRacine =
  | "Usure normale"
  | "Défaut composant"
  | "Mauvaise utilisation"
  | "Défaut alimentation"
  | "Environnement (humidité, poussière, température)"
  | "Maintenance non effectuée"
  | "Pièce défectueuse d'origine"
  | "Autre";
const CAUSES_RACINE: CauseRacine[] = [
  "Usure normale",
  "Défaut composant",
  "Mauvaise utilisation",
  "Défaut alimentation",
  "Environnement (humidité, poussière, température)",
  "Maintenance non effectuée",
  "Pièce défectueuse d'origine",
  "Autre",
];

interface PanneEntry {
  id: string;
  etat: PanneEtat;
  dateSignalement: string;
  description: string;
  diagnostic?: string;
  causeRacine?: CauseRacine;
  causeLibre?: string;
  actionCorrective?: string;
  dateDebutIntervention?: string;
  dateFinIntervention?: string;
  resultatTest?: "Conforme" | "Non conforme" | "À revoir" | "";
  validationFinale?: boolean;
  validePar?: string;
  validationDate?: string;
  piecesRemplacees?: string[];
  coutTotal?: number;
  technicien?: string;
}
type SiteSubTab = "equipements" | "pieces" | "kits";

interface HistoriqueEntry {
  id: string;
  date: string;
  type: "PV préventif" | "PV correctif" | "Kit maintenance" | "Pièce remplacée" | "PV installation";
  description: string;
  technicien: string;
  pieces: string[];
  dureeHeures?: number;
  coutTotal?: number;
}

interface Piece {
  id: string;
  reference: string;
  designation: string;
  qte: number;
  prixUnit: number;
  urgence: "critique" | "normale" | "basse";
  fournisseur?: string;
}

interface Kit {
  id: string;
  reference: string;
  designation: string;
  contenu: string;
  qte: number;
  prixUnit: number;
  periodicite: "Annuel" | "Semestriel" | "Biennal" | "Triennal" | "Sur demande";
  fournisseur?: string;
  dernierUtilise?: string;
}

interface DM {
  id: string;
  modele: string;
  marque?: string;
  serie: string;
  statut: Statut;
  pms: string;
  actions: number;
  classe?: string;
  service?: string;
  localisation?: string;
  dateInstall?: string;
  fournisseur?: string;
  historique: HistoriqueEntry[];
  pieces: Piece[];
  kits: Kit[];
  pannes?: PanneEntry[];
  statutTechnique?: PanneEtat;
}

interface GNode { id: string; label: string; sublabel: string; x: number; y: number; color: string; r: number; icon?: "lightning" | "arrow-up" | "snowflake"; }
interface GEdge { from: string; to: string; label?: string; electric?: boolean; }

interface SiteData {
  titre: string;
  maj: string;
  dms: DM[];
  nodes: GNode[];
  edges: GEdge[];
}

/* ── Helpers ── */
function uid() { return Math.random().toString(36).slice(2, 10); }

function statutStyle(s: Statut) {
  if (s === "Fonctionnel") return { bg: "#dcfce7", text: "#15803d", border: "#bbf7d0", dot: "#22c55e" };
  if (s === "Hors service") return { bg: "#fee2e2", text: "#dc2626", border: "#fecaca", dot: "#ef4444" };
  if (s === "En attente") return { bg: "#fef3c7", text: "#d97706", border: "#fde68a", dot: "#f59e0b" };
  return { bg: "#f1f5f9", text: "#64748b", border: "#e2e8f0", dot: "#94a3b8" };
}

function statutToNodeColor(s: Statut): string {
  if (s === "Fonctionnel") return "#22c55e";
  if (s === "Hors service") return "#ef4444";
  if (s === "En attente") return "#f59e0b";
  return "#94a3b8";
}

function actionStatutStyle(s: ActionStatut) {
  if (s === "À faire")  return { bg: "#f1f5f9", text: "#475569", border: "#cbd5e1", dot: "#94a3b8" };
  if (s === "En cours") return { bg: "#dbeafe", text: "#1d4ed8", border: "#bfdbfe", dot: "#3b82f6" };
  if (s === "Bloqué")   return { bg: "#fee2e2", text: "#b91c1c", border: "#fecaca", dot: "#ef4444" };
  return                       { bg: "#dcfce7", text: "#15803d", border: "#bbf7d0", dot: "#22c55e" };
}

function criticiteFromClasse(classe?: string): "Critique" | "Élevée" | "Standard" {
  if (classe === "III" || classe === "IIb") return "Critique";
  if (classe === "IIa") return "Élevée";
  return "Standard";
}
function criticiteStyle(c: "Critique" | "Élevée" | "Standard") {
  if (c === "Critique") return { bg: "#fee2e2", text: "#b91c1c", border: "#fecaca", dot: "#ef4444" };
  if (c === "Élevée")   return { bg: "#fef3c7", text: "#b45309", border: "#fde68a", dot: "#f59e0b" };
  return                        { bg: "#dbeafe", text: "#1d4ed8", border: "#bfdbfe", dot: "#3b82f6" };
}

function dispoPct(dms: DM[]): number {
  if (dms.length === 0) return 0;
  const fonct = dms.filter(d => d.statut === "Fonctionnel").length;
  return Math.round((fonct / dms.length) * 100);
}

function panneEtatStyle(e: PanneEtat) {
  if (e === "Signalé")        return { bg: "#fee2e2", text: "#b91c1c", border: "#fecaca", dot: "#ef4444" };
  if (e === "Diagnostiqué")   return { bg: "#fef3c7", text: "#b45309", border: "#fde68a", dot: "#f59e0b" };
  if (e === "En réparation")  return { bg: "#dbeafe", text: "#1d4ed8", border: "#bfdbfe", dot: "#3b82f6" };
  if (e === "Test")           return { bg: "#ede9fe", text: "#6d28d9", border: "#ddd6fe", dot: "#8b5cf6" };
  return                             { bg: "#dcfce7", text: "#15803d", border: "#bbf7d0", dot: "#22c55e" };
}

function diffHours(a?: string, b?: string): number | null {
  if (!a || !b) return null;
  const da = new Date(a).getTime(); const db = new Date(b).getTime();
  if (isNaN(da) || isNaN(db) || db < da) return null;
  return (db - da) / 36e5;
}
function diffDays(a?: string, b?: string): number | null {
  const h = diffHours(a, b); return h === null ? null : h / 24;
}

/** MTTR — moyenne des durées (heures) d'intervention des pannes clôturées. */
function computeMTTR(pannes: PanneEntry[]): number | null {
  const durees = pannes
    .filter(p => p.etat === "Clôturé")
    .map(p => diffHours(p.dateDebutIntervention, p.dateFinIntervention))
    .filter((v): v is number => v !== null);
  if (durees.length === 0) return null;
  return durees.reduce((a, b) => a + b, 0) / durees.length;
}

/** MTBF — moyenne de l'écart (jours) entre dates de signalement successives. */
function computeMTBF(pannes: PanneEntry[]): number | null {
  const dates = pannes
    .map(p => p.dateSignalement)
    .filter(Boolean)
    .sort();
  if (dates.length < 2) return null;
  const ecarts: number[] = [];
  for (let i = 1; i < dates.length; i++) {
    const d = diffDays(dates[i - 1], dates[i]);
    if (d !== null) ecarts.push(d);
  }
  if (ecarts.length === 0) return null;
  return ecarts.reduce((a, b) => a + b, 0) / ecarts.length;
}

function computeCoutTotalMaintenance(dm: DM): number {
  const cPannes = (dm.pannes ?? []).reduce((a, p) => a + (p.coutTotal ?? 0), 0);
  const cHisto  = dm.historique.reduce((a, h) => a + (h.coutTotal ?? 0), 0);
  return cPannes + cHisto;
}

function computeNbPannes(dm: DM): number {
  return (dm.pannes ?? []).length;
}

function fmtHeures(h: number | null): string {
  if (h === null) return "—";
  if (h < 24) return h.toFixed(1).replace(".", ",") + " h";
  return (h / 24).toFixed(1).replace(".", ",") + " j";
}
function fmtJours(j: number | null): string {
  if (j === null) return "—";
  return j.toFixed(1).replace(".", ",") + " j";
}

function urgenceStyle(u: Piece["urgence"]) {
  if (u === "critique") return { bg: "#fee2e2", text: "#dc2626", border: "#fecaca" };
  if (u === "normale") return { bg: "#fef3c7", text: "#d97706", border: "#fde68a" };
  return { bg: "#f0f9ff", text: "#0284c7", border: "#bae6fd" };
}

function fmtEur(n: number) {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " €";
}

function totalPieces(dms: DM[]) {
  return dms.reduce((acc, dm) => acc + dm.pieces.reduce((a, p) => a + p.qte * p.prixUnit, 0), 0);
}

function totalKits(dms: DM[]) {
  return dms.reduce((acc, dm) => acc + (dm.kits ?? []).reduce((a, k) => a + k.qte * k.prixUnit, 0), 0);
}

function periodStyle(p: Kit["periodicite"]) {
  if (p === "Annuel") return { bg: "#dcfce7", text: "#15803d", border: "#bbf7d0" };
  if (p === "Semestriel") return { bg: "#dbeafe", text: "#1d4ed8", border: "#bfdbfe" };
  if (p === "Biennal") return { bg: "#fef3c7", text: "#d97706", border: "#fde68a" };
  if (p === "Triennal") return { bg: "#fce7f3", text: "#be185d", border: "#fbcfe8" };
  return { bg: "#f1f5f9", text: "#64748b", border: "#e2e8f0" };
}

function contratStatut(dateFin: string): { label: string; bg: string; text: string; border: string } {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const fin = new Date(dateFin); fin.setHours(0, 0, 0, 0);
  const diff = Math.round((fin.getTime() - today.getTime()) / 86400000);
  if (diff < 0) return { label: "Expiré", bg: "#fee2e2", text: "#b91c1c", border: "#fecaca" };
  if (diff <= 30) return { label: `J-${diff}`, bg: "#fef3c7", text: "#b45309", border: "#fde68a" };
  if (diff <= 90) return { label: `J-${diff}`, bg: "#dbeafe", text: "#1d4ed8", border: "#bfdbfe" };
  return { label: "Actif", bg: "#dcfce7", text: "#15803d", border: "#bbf7d0" };
}
function contratTypeStyle(t: ContratType) {
  if (t === "Maintenance") return { bg: "#dbeafe", text: "#1d4ed8" };
  if (t === "Garantie") return { bg: "#dcfce7", text: "#15803d" };
  if (t === "Location") return { bg: "#fef3c7", text: "#d97706" };
  if (t === "Service") return { bg: "#ede9fe", text: "#6d28d9" };
  return { bg: "#f1f5f9", text: "#475569" };
}

const SITE_KEYS: SiteKey[] = ["BYUMBA", "CHUK", "KAGBAYI"];
const URGENCE_ORDER: Record<Piece["urgence"], number> = { critique: 0, normale: 1, basse: 2 };
const STATUTS: Statut[] = ["Fonctionnel", "Hors service", "En attente", "Inutilisé"];
const CLASSES = ["I", "IIa", "IIb", "III"];
const HISTO_TYPES: HistoriqueEntry["type"][] = ["PV préventif", "PV correctif", "Kit maintenance", "Pièce remplacée", "PV installation"];
const KIT_PERIODICITE: Kit["periodicite"][] = ["Annuel", "Semestriel", "Biennal", "Triennal", "Sur demande"];
const inputCls = "w-full rounded border border-slate-200 px-2 py-1.5 text-xs focus:outline-none focus:border-blue-400";
const labelCls = "block text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-0.5";
const btnSm = "rounded px-2.5 py-1 text-xs font-semibold";

/* ── Icônes (SVG inline, stroke currentColor) ── */
const IconEye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>
);
const IconPencil = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"/></svg>
);
const IconTrash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
);
const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
);
const IconWrench = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a4 4 0 0 0 5 5l-8.5 8.5a2.5 2.5 0 0 1-3.5-3.5l8.5-8.5-1.5-1.5Z"/></svg>
);
const IconDashboard = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>
);

type IconButtonVariant = "neutral" | "edit" | "danger" | "primary";
function IconButton({ children, title, onClick, variant = "neutral" }: { children: React.ReactNode; title: string; onClick: () => void; variant?: IconButtonVariant }) {
  const palette: Record<IconButtonVariant, { bg: string; fg: string; bd: string; bgH: string }> = {
    neutral: { bg: "#ffffff", fg: "#475569", bd: "#e2e8f0", bgH: "#f1f5f9" },
    edit:    { bg: "#ffffff", fg: "#2563eb", bd: "#bfdbfe", bgH: "#eff6ff" },
    danger:  { bg: "#ffffff", fg: "#dc2626", bd: "#fecaca", bgH: "#fef2f2" },
    primary: { bg: "#2563eb", fg: "#ffffff", bd: "#2563eb", bgH: "#1d4ed8" },
  };
  const p = palette[variant];
  return (
    <button type="button" title={title} aria-label={title} onClick={onClick}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors"
      style={{ backgroundColor: p.bg, color: p.fg, border: `1px solid ${p.bd}` }}
      onMouseEnter={e => (e.currentTarget.style.backgroundColor = p.bgH)}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = p.bg)}>
      {children}
    </button>
  );
}

/* ── Default Dataset ── */
const DEFAULT_DATA: Record<SiteKey, SiteData> = {
  BYUMBA: {
    titre: "BYUMBA — Audit maintenance biomédicale",
    maj: "11/04/2026 10:15:46",
    dms: [
      { id: "hp-i80", modele: "HP I80 compresseur", serie: "20221118221F04", statut: "Hors service", pms: "2026-05-10", actions: 3, classe: "IIb", service: "Laboratoire", localisation: "Bâtiment A", dateInstall: "2022-11-18", fournisseur: "HP Medical", historique: [{ id: "h1", date: "2025-03-10", type: "PV préventif", description: "Révision générale annuelle, remplacement filtre air", technicien: "J. Nkusi", pieces: ["Filtre air FA-001"] }, { id: "h2", date: "2025-08-22", type: "PV correctif", description: "Panne soupape haute pression — équipement mis en arrêt", technicien: "A. Uwimana", pieces: [] }, { id: "h3", date: "2026-01-15", type: "Pièce remplacée", description: "Tentative remplacement joint torique — panne persistante", technicien: "J. Nkusi", pieces: ["Joint torique JO-002"] }], pieces: [{ id: "p1", reference: "FHP-001", designation: "Filtre haute pression HP I80", qte: 1, prixUnit: 85, urgence: "critique", fournisseur: "HP Medical" }, { id: "p2", reference: "JO-002", designation: "Joint torique compresseur", qte: 2, prixUnit: 12, urgence: "normale", fournisseur: "Techni-Gaz" }, { id: "p3", reference: "SV-003", designation: "Soupape de sécurité HP", qte: 1, prixUnit: 145, urgence: "critique", fournisseur: "HP Medical" }], kits: [] },
      { id: "edc", modele: "EDC", serie: "—", statut: "Fonctionnel", pms: "2026-07-15", actions: 0, classe: "IIa", service: "Stérilisation", localisation: "Bâtiment B", dateInstall: "2021-06-01", fournisseur: "Steris", historique: [{ id: "h1", date: "2025-07-01", type: "PV préventif", description: "Entretien périodique, vérification circuits", technicien: "A. Uwimana", pieces: [] }, { id: "h2", date: "2026-01-20", type: "Kit maintenance", description: "Kit maintenance annuel appliqué", technicien: "J. Nkusi", pieces: ["Kit M-001"] }], pieces: [], kits: [] },
      { id: "vl5590", modele: "VL5590-2RN-P", serie: "109713", statut: "Fonctionnel", pms: "2026-05-10", actions: 0, classe: "IIa", service: "Urgences", localisation: "Bâtiment C", dateInstall: "2022-03-15", historique: [{ id: "h1", date: "2025-05-10", type: "PV préventif", description: "Vérification pression, test sécurités", technicien: "J. Nkusi", pieces: [] }, { id: "h2", date: "2025-11-12", type: "PV préventif", description: "Contrôle semestiel, pas d’anomalie", technicien: "A. Uwimana", pieces: [] }], pieces: [], kits: [] },
      { id: "atlas-sf4", modele: "Compresseur Atlas Copco SF4", serie: "ATC-SF4-0887", statut: "En attente", pms: "2026-06-01", actions: 2, classe: "IIb", service: "Bloc opératoire", localisation: "Local technique", dateInstall: "2020-09-10", fournisseur: "Atlas Copco", historique: [{ id: "h1", date: "2024-09-10", type: "PV préventif", description: "Révision 4 ans — courroie usée détectée", technicien: "M. Bizimana", pieces: [] }, { id: "h2", date: "2025-02-14", type: "PV correctif", description: "Arrêt sur défaut thermique — filtre colmaté", technicien: "J. Nkusi", pieces: [] }, { id: "h3", date: "2025-06-30", type: "PV correctif", description: "En attente pièces — compresseur hors service partiel", technicien: "M. Bizimana", pieces: [] }], pieces: [{ id: "p1", reference: "CC-101", designation: "Courroie trapézoïdale SF4", qte: 2, prixUnit: 38, urgence: "critique", fournisseur: "Atlas Copco" }, { id: "p2", reference: "FA-102", designation: "Filtre à air SF4", qte: 1, prixUnit: 65, urgence: "normale", fournisseur: "Atlas Copco" }], kits: [] },
      { id: "sd4", modele: "Sécheur réfrigérant SD4", serie: "SDR-2021-044", statut: "Fonctionnel", pms: "2026-08-20", actions: 0, classe: "I", service: "Bloc opératoire", localisation: "Local technique", dateInstall: "2021-09-10", historique: [{ id: "h1", date: "2025-08-20", type: "PV préventif", description: "Entretien annuel condenseur et filtre déshydrateur", technicien: "J. Nkusi", pieces: [] }], pieces: [], kits: [] },
      { id: "cgm-byu", modele: "Centrale gaz médicaux", serie: "CGM-BYU-2020", statut: "Fonctionnel", pms: "2026-04-30", actions: 0, classe: "IIb", service: "Central technique", localisation: "Local gaz", dateInstall: "2020-05-01", historique: [{ id: "h1", date: "2025-04-28", type: "PV préventif", description: "Inspection annuelle, contrôle alarmes", technicien: "A. Uwimana", pieces: [] }, { id: "h2", date: "2025-10-10", type: "PV préventif", description: "Contrôle semestriel pression réseau OK", technicien: "M. Bizimana", pieces: [] }], pieces: [], kits: [] },
      { id: "mano-o2", modele: "Manodétendeur O₂ x2", serie: "MDO2-BYU-01/02", statut: "Fonctionnel", pms: "2026-06-15", actions: 0, classe: "IIa", service: "Central technique", localisation: "Local gaz", dateInstall: "2020-05-01", historique: [{ id: "h1", date: "2025-06-15", type: "PV préventif", description: "Contrôle étanchéité et pression sortie", technicien: "J. Nkusi", pieces: [] }], pieces: [], kits: [] },
      { id: "rampe-n2o", modele: "Rampe bouteilles N₂O", serie: "RN2O-BYU-2020", statut: "Inutilisé", pms: "—", actions: 0, classe: "IIb", service: "Anesthésie", localisation: "Local gaz", dateInstall: "2020-05-01", historique: [{ id: "h1", date: "2022-03-01", type: "PV installation", description: "Installation initiale — N₂O non utilisé au bloc, rampe consignée", technicien: "A. Uwimana", pieces: [] }], pieces: [], kits: [] },
      { id: "groupe-elec", modele: "Groupe électrogène secours", serie: "GEN-BYU-2019", statut: "Fonctionnel", pms: "2026-05-01", actions: 0, classe: "I", service: "Électricité", localisation: "Cour technique", dateInstall: "2019-11-01", historique: [{ id: "h1", date: "2025-05-01", type: "PV préventif", description: "Révision annuelle huile moteur et filtre — test OK 4h", technicien: "M. Bizimana", pieces: ["Filtre huile FH-001", "Huile moteur 15W40"] }, { id: "h2", date: "2025-11-01", type: "PV préventif", description: "Test mensuel 30 min — démarrage OK", technicien: "J. Nkusi", pieces: [] }], pieces: [], kits: [] },
    ],
    nodes: [
      { id: "edc", label: "", sublabel: "EDC", x: 55, y: 200, color: "#22c55e", r: 22, icon: "lightning" },
      { id: "atlas-sf4", label: "C", sublabel: "Comp 1", x: 145, y: 130, color: "#f59e0b", r: 22 },
      { id: "hp-i80", label: "C", sublabel: "Comp 2", x: 145, y: 275, color: "#ef4444", r: 22 },
      { id: "sd4", label: "", sublabel: "Dry 1", x: 232, y: 108, color: "#22c55e", r: 22, icon: "snowflake" },
      { id: "dry2-byu", label: "", sublabel: "Dry 2", x: 232, y: 290, color: "#94a3b8", r: 22, icon: "snowflake" },
      { id: "cu1-byu", label: "Cu1", sublabel: "Cu1", x: 315, y: 88, color: "#38bdf8", r: 20 },
      { id: "cu2-byu", label: "Cu2", sublabel: "Cu2", x: 315, y: 310, color: "#38bdf8", r: 20 },
      { id: "vl5590", label: "O₂", sublabel: "Rx 700 M", x: 430, y: 195, color: "#22c55e", r: 30 },
      { id: "rx700s-byu", label: "O₂", sublabel: "Rx 700 Slave", x: 430, y: 315, color: "#94a3b8", r: 26 },
      { id: "cu3-byu", label: "Cu3", sublabel: "Cu3", x: 540, y: 108, color: "#38bdf8", r: 20 },
      { id: "hp1-byu", label: "", sublabel: "HP 1", x: 630, y: 42, color: "#22c55e", r: 22, icon: "arrow-up" },
      { id: "hp2-byu", label: "", sublabel: "HP 2", x: 630, y: 130, color: "#ef4444", r: 22, icon: "arrow-up" },
      { id: "p1-byu", label: "1", sublabel: "1", x: 630, y: 200, color: "#38bdf8", r: 18 },
      { id: "p2-byu", label: "2", sublabel: "2", x: 630, y: 248, color: "#38bdf8", r: 18 },
      { id: "p3-byu", label: "3", sublabel: "3", x: 630, y: 305, color: "#38bdf8", r: 18 },
      { id: "p4-byu", label: "4", sublabel: "4", x: 630, y: 358, color: "#38bdf8", r: 18 },
    ],
    edges: [
      { from: "edc", to: "atlas-sf4", label: "230V~", electric: true },
      { from: "edc", to: "hp-i80", label: "230V~", electric: true },
      { from: "edc", to: "sd4", label: "400V~", electric: true },
      { from: "edc", to: "dry2-byu", label: "230V~", electric: true },
      { from: "edc", to: "cu1-byu", label: "400V~", electric: true },
      { from: "edc", to: "vl5590", label: "230V~", electric: true },
      { from: "atlas-sf4", to: "sd4", label: "Air" },
      { from: "hp-i80", to: "dry2-byu", label: "Air" },
      { from: "sd4", to: "cu1-byu", label: "Air-sec" },
      { from: "dry2-byu", to: "cu2-byu", label: "Air-sec" },
      { from: "cu1-byu", to: "vl5590", label: "Air" },
      { from: "cu2-byu", to: "vl5590", label: "Air" },
      { from: "vl5590", to: "cu3-byu", label: "O₂" },
      { from: "vl5590", to: "rx700s-byu", label: "Sync M-S" },
      { from: "vl5590", to: "p1-byu", label: "Process" },
      { from: "vl5590", to: "p2-byu", label: "Process" },
      { from: "cu3-byu", to: "hp1-byu", label: "O₂-BP" },
      { from: "cu3-byu", to: "hp2-byu", label: "O₂-BP" },
      { from: "rx700s-byu", to: "p3-byu", label: "Process" },
      { from: "rx700s-byu", to: "p4-byu", label: "Process" },
    ],
  },
  CHUK: {
    titre: "CHUK — Audit maintenance biomédicale",
    maj: "11/04/2026 09:30:12",
    dms: [
      { id: "servo", modele: "Maquet Servo-i", serie: "SRV-20221103", statut: "Fonctionnel", pms: "2026-06-01", actions: 0, classe: "IIb", service: "Réanimation", localisation: "Bloc B", dateInstall: "2022-11-03", fournisseur: "Getinge", historique: [{ id: "h1", date: "2025-06-01", type: "PV préventif", description: "Maintenance préventive annuelle — remplacement filtre patient", technicien: "P. Habimana", pieces: ["Filtre patient FP-001"] }, { id: "h2", date: "2025-12-10", type: "PV préventif", description: "Contrôle semestriel — calibration capteurs OK", technicien: "C. Mukiza", pieces: [] }], pieces: [], kits: [] },
      { id: "sono", modele: "SonoSite Edge II", serie: "SNST-20190452", statut: "En attente", pms: "2026-05-20", actions: 1, classe: "IIa", service: "Urgences", localisation: "Bloc A", dateInstall: "2019-04-22", fournisseur: "SonoSite", historique: [{ id: "h1", date: "2025-04-10", type: "PV préventif", description: "Entretien annuel — sonde L38 défectueuse signalée", technicien: "P. Habimana", pieces: [] }, { id: "h2", date: "2025-09-15", type: "PV correctif", description: "Tentative réparation sonde — en attente pièce fournisseur", technicien: "C. Mukiza", pieces: [] }], pieces: [{ id: "p1", reference: "SON-L38", designation: "Sonde linéaire L38 SonoSite", qte: 1, prixUnit: 1850, urgence: "critique", fournisseur: "SonoSite" }, { id: "p2", reference: "SON-BAT", designation: "Batterie Edge II", qte: 1, prixUnit: 120, urgence: "normale", fournisseur: "SonoSite" }], kits: [] },
      { id: "auto", modele: "Autoclave SES 2000", serie: "AC-20200876", statut: "Fonctionnel", pms: "2026-04-30", actions: 0, classe: "IIb", service: "Stérilisation", localisation: "Bloc C", dateInstall: "2020-03-10", fournisseur: "Getinge", historique: [{ id: "h1", date: "2025-03-20", type: "PV préventif", description: "Remplacement joint porte et éléments chauffants", technicien: "P. Habimana", pieces: ["Joint porte JP-001"] }, { id: "h2", date: "2025-09-10", type: "Kit maintenance", description: "Kit entretien annuel complet appliqué", technicien: "C. Mukiza", pieces: [] }, { id: "h3", date: "2026-03-15", type: "PV préventif", description: "Test cycles stérilisation — conformité OK", technicien: "P. Habimana", pieces: [] }], pieces: [], kits: [] },
      { id: "defi", modele: "Zoll AED Plus", serie: "ZOLL-2021054", statut: "Hors service", pms: "2026-04-15", actions: 2, classe: "IIb", service: "Urgences", localisation: "Salle 4", dateInstall: "2021-01-15", fournisseur: "Zoll Medical", historique: [{ id: "h1", date: "2024-12-01", type: "PV correctif", description: "Batterie déchargée — équipement hors service, alarme signalée", technicien: "C. Mukiza", pieces: [] }, { id: "h2", date: "2025-03-18", type: "PV correctif", description: "Câble patient défectueux constaté — en attente commande", technicien: "P. Habimana", pieces: [] }], pieces: [{ id: "p1", reference: "ZBAT", designation: "Batterie Zoll AED Plus", qte: 1, prixUnit: 220, urgence: "critique", fournisseur: "Zoll Medical" }, { id: "p2", reference: "ZELEC", designation: "Électrodes adultes Zoll", qte: 2, prixUnit: 85, urgence: "critique", fournisseur: "Zoll Medical" }, { id: "p3", reference: "ZCAB", designation: "Câble patient Zoll", qte: 1, prixUnit: 45, urgence: "normale", fournisseur: "Zoll Medical" }], kits: [] },
      { id: "comp-15kw", modele: "Compresseur médical 15kW", serie: "CMP15-CHUK-2021", statut: "En attente", pms: "2026-07-01", actions: 1, classe: "IIb", service: "Central technique", localisation: "Local compresseurs", dateInstall: "2021-07-01", historique: [{ id: "h1", date: "2025-07-01", type: "PV préventif", description: "Révision annuelle — huile moteur changée, filtre OK", technicien: "P. Habimana", pieces: ["Huile 15W40 5L"] }, { id: "h2", date: "2026-01-10", type: "PV correctif", description: "Vibrations anormales — roulements suspects, en attente diagnostic", technicien: "C. Mukiza", pieces: [] }], pieces: [{ id: "p1", reference: "ROUL-001", designation: "Roulements moteur 15kW", qte: 2, prixUnit: 95, urgence: "normale", fournisseur: "SKF" }], kits: [] },
      { id: "o2-liq", modele: "Central O₂ liquide", serie: "O2L-CHUK-2019", statut: "Fonctionnel", pms: "2026-06-01", actions: 0, classe: "IIb", service: "Central technique", localisation: "Station oxygène", dateInstall: "2019-06-01", historique: [{ id: "h1", date: "2025-06-01", type: "PV préventif", description: "Contrôle niveau, test alarmes basse pression OK", technicien: "P. Habimana", pieces: [] }], pieces: [], kits: [] },
      { id: "seche-psa", modele: "Sécheur d’air PSA", serie: "PSA-CHUK-2021", statut: "Fonctionnel", pms: "2026-08-01", actions: 0, classe: "I", service: "Central technique", localisation: "Local compresseurs", dateInstall: "2021-07-01", historique: [{ id: "h1", date: "2025-08-01", type: "PV préventif", description: "Régénération tamis moléculaire vérifiée — OK", technicien: "C. Mukiza", pieces: [] }], pieces: [], kits: [] },
      { id: "reg-press", modele: "Régulateur pression", serie: "REG-CHUK-01", statut: "Fonctionnel", pms: "2026-05-15", actions: 0, classe: "IIa", service: "Central technique", localisation: "Local gaz", dateInstall: "2021-07-01", historique: [{ id: "h1", date: "2025-05-15", type: "PV préventif", description: "Étalonnage manomètre et test pression sortie", technicien: "P. Habimana", pieces: [] }], pieces: [], kits: [] },
      { id: "res-gaz", modele: "Réseau gaz bloc", serie: "RGB-CHUK-2021", statut: "Fonctionnel", pms: "2026-09-01", actions: 0, classe: "IIb", service: "Bloc opératoire", localisation: "Bloc A/B/C", dateInstall: "2021-07-01", historique: [{ id: "h1", date: "2025-09-01", type: "PV préventif", description: "Contrôle étanchéité réseau cuivre, test débit OK", technicien: "C. Mukiza", pieces: [] }], pieces: [], kits: [] },
      { id: "moniteur-x2", modele: "Moniteur multiparamètre x2", serie: "MON-REA-01/02", statut: "Fonctionnel", pms: "2026-07-10", actions: 0, classe: "IIb", service: "Réanimation", localisation: "Réanimation", dateInstall: "2022-07-10", historique: [{ id: "h1", date: "2025-07-10", type: "PV préventif", description: "Vérification capteurs SpO2, ECG, NIBP — calibration OK", technicien: "P. Habimana", pieces: [] }, { id: "h2", date: "2026-01-10", type: "Kit maintenance", description: "Remplacement câbles patients et électrodes", technicien: "C. Mukiza", pieces: ["Câbles ECG", "Brassards NIBP"] }], pieces: [], kits: [] },
      { id: "pompe-perf", modele: "Pompe à perfusion", serie: "PP-REA-CHUK-03", statut: "Fonctionnel", pms: "2026-06-20", actions: 0, classe: "IIb", service: "Réanimation", localisation: "Réanimation", dateInstall: "2022-06-20", historique: [{ id: "h1", date: "2025-06-20", type: "PV préventif", description: "Test débit volumétrique et alarmes occlusion OK", technicien: "P. Habimana", pieces: [] }], pieces: [], kits: [] },
      { id: "aspir-chir", modele: "Aspirateur chirurgical", serie: "ASP-CHUKB-2022", statut: "En attente", pms: "2026-05-01", actions: 1, classe: "IIa", service: "Bloc B", localisation: "Salle opératoire 2", dateInstall: "2022-05-01", historique: [{ id: "h1", date: "2025-04-15", type: "PV correctif", description: "Pompe à vide défaillante — dépression insuffisante", technicien: "C. Mukiza", pieces: [] }], pieces: [{ id: "p1", reference: "PV-ASP-001", designation: "Pompe à vide aspirateur chirurgical", qte: 1, prixUnit: 280, urgence: "critique", fournisseur: "Medela" }], kits: [] },
      { id: "scialytique", modele: "Lampe scialytique", serie: "SCI-CHUKA-2020", statut: "Fonctionnel", pms: "2026-08-15", actions: 0, classe: "I", service: "Bloc A", localisation: "Salle opératoire 1", dateInstall: "2020-08-15", historique: [{ id: "h1", date: "2025-08-15", type: "PV préventif", description: "Nettoyage optique et vérification articulations", technicien: "P. Habimana", pieces: [] }], pieces: [], kits: [] },
      { id: "table-op", modele: "Table opératoire", serie: "TOP-CHUK-2018", statut: "Inutilisé", pms: "—", actions: 0, classe: "IIb", service: "Bloc opératoire", localisation: "Dépôt bloc", dateInstall: "2018-01-01", historique: [{ id: "h1", date: "2023-06-01", type: "PV correctif", description: "Table retirée du service — système hydraulique HS, remplacement prévu", technicien: "C. Mukiza", pieces: [] }], pieces: [], kits: [] },
    ],
    nodes: [
      { id: "edc-chk", label: "", sublabel: "EDC", x: 55, y: 200, color: "#22c55e", r: 22, icon: "lightning" },
      { id: "comp-15kw", label: "C", sublabel: "Comp 1", x: 145, y: 130, color: "#f59e0b", r: 22 },
      { id: "comp2-chk", label: "C", sublabel: "Comp 2", x: 145, y: 275, color: "#22c55e", r: 22 },
      { id: "seche-psa", label: "", sublabel: "Dry 1", x: 232, y: 108, color: "#22c55e", r: 22, icon: "snowflake" },
      { id: "dry2-chk", label: "", sublabel: "Dry 2", x: 232, y: 290, color: "#22c55e", r: 22, icon: "snowflake" },
      { id: "cu1-chk", label: "Cu1", sublabel: "Cu1", x: 315, y: 88, color: "#38bdf8", r: 20 },
      { id: "cu2-chk", label: "Cu2", sublabel: "Cu2", x: 315, y: 310, color: "#38bdf8", r: 20 },
      { id: "o2-liq", label: "O₂", sublabel: "Rx 700 M", x: 430, y: 195, color: "#22c55e", r: 30 },
      { id: "rx700s-chk", label: "O₂", sublabel: "Rx 700 Slave", x: 430, y: 315, color: "#94a3b8", r: 26 },
      { id: "cu3-chk", label: "Cu3", sublabel: "Cu3", x: 540, y: 108, color: "#38bdf8", r: 20 },
      { id: "hp1-chk", label: "", sublabel: "HP 1", x: 630, y: 42, color: "#22c55e", r: 22, icon: "arrow-up" },
      { id: "hp2-chk", label: "", sublabel: "HP 2", x: 630, y: 130, color: "#ef4444", r: 22, icon: "arrow-up" },
      { id: "p1-chk", label: "1", sublabel: "1", x: 630, y: 200, color: "#38bdf8", r: 18 },
      { id: "p2-chk", label: "2", sublabel: "2", x: 630, y: 248, color: "#38bdf8", r: 18 },
      { id: "p3-chk", label: "3", sublabel: "3", x: 630, y: 305, color: "#38bdf8", r: 18 },
      { id: "p4-chk", label: "4", sublabel: "4", x: 630, y: 358, color: "#38bdf8", r: 18 },
    ],
    edges: [
      { from: "edc-chk", to: "comp-15kw", label: "230V~", electric: true },
      { from: "edc-chk", to: "comp2-chk", label: "230V~", electric: true },
      { from: "edc-chk", to: "seche-psa", label: "400V~", electric: true },
      { from: "edc-chk", to: "dry2-chk", label: "230V~", electric: true },
      { from: "edc-chk", to: "cu1-chk", label: "400V~", electric: true },
      { from: "edc-chk", to: "o2-liq", label: "230V~", electric: true },
      { from: "comp-15kw", to: "seche-psa", label: "Air" },
      { from: "comp2-chk", to: "dry2-chk", label: "Air" },
      { from: "seche-psa", to: "cu1-chk", label: "Air-sec" },
      { from: "dry2-chk", to: "cu2-chk", label: "Air-sec" },
      { from: "cu1-chk", to: "o2-liq", label: "Air" },
      { from: "cu2-chk", to: "o2-liq", label: "Air" },
      { from: "o2-liq", to: "cu3-chk", label: "O₂" },
      { from: "o2-liq", to: "rx700s-chk", label: "Sync M-S" },
      { from: "o2-liq", to: "p1-chk", label: "Process" },
      { from: "o2-liq", to: "p2-chk", label: "Process" },
      { from: "cu3-chk", to: "hp1-chk", label: "O₂-BP" },
      { from: "cu3-chk", to: "hp2-chk", label: "O₂-BP" },
      { from: "rx700s-chk", to: "p3-chk", label: "Process" },
      { from: "rx700s-chk", to: "p4-chk", label: "Process" },
    ],
  },
  KAGBAYI: {
    titre: "KAGBAYI — Audit maintenance biomédicale",
    maj: "10/04/2026 14:22:05",
    dms: [
      { id: "dc70", modele: "Mindray DC-70", serie: "DC70-2022031", statut: "Fonctionnel", pms: "2026-08-15", actions: 0, classe: "IIa", service: "Radiologie", localisation: "Bloc Imagerie", dateInstall: "2022-03-10", fournisseur: "Mindray", historique: [{ id: "h1", date: "2025-03-10", type: "PV préventif", description: "Révision annuelle — nettoyage transducteurs, test Doppler OK", technicien: "E. Niyonzima", pieces: [] }, { id: "h2", date: "2025-09-10", type: "PV préventif", description: "Contrôle semestriel, gel conducteur renouvelé", technicien: "F. Uwineza", pieces: [] }], pieces: [], kits: [] },
      { id: "isol", modele: "Dräger Isolette C2", serie: "DRG-INC-0981", statut: "Fonctionnel", pms: "2026-05-30", actions: 0, classe: "IIb", service: "Néonatologie", localisation: "Maternité", dateInstall: "2021-05-30", fournisseur: "Dräger", historique: [{ id: "h1", date: "2025-05-30", type: "PV préventif", description: "Calibration capteurs température/humidité — OK", technicien: "E. Niyonzima", pieces: [] }, { id: "h2", date: "2025-11-15", type: "Kit maintenance", description: "Kit entretien annuel Dräger — filtres et joints remplacés", technicien: "F. Uwineza", pieces: ["Kit Isolette KIT-DRG-01"] }, { id: "h3", date: "2026-02-10", type: "PV préventif", description: "Contrôle semestriel — bonne conformité", technicien: "E. Niyonzima", pieces: [] }], pieces: [], kits: [] },
      { id: "au480", modele: "Beckman AU480", serie: "BCK-AU480-112", statut: "En attente", pms: "2026-06-10", actions: 1, classe: "IIa", service: "Laboratoire", localisation: "Labo central", dateInstall: "2021-06-10", fournisseur: "Beckman Coulter", historique: [{ id: "h1", date: "2025-06-10", type: "PV préventif", description: "Entretien annuel — pompe réactif dégradée signalée", technicien: "F. Uwineza", pieces: [] }, { id: "h2", date: "2025-10-20", type: "PV correctif", description: "Arrêt analyseur — pompe réactif en panne, en attente commande", technicien: "E. Niyonzima", pieces: [] }], pieces: [{ id: "p1", reference: "RPUMP", designation: "Pompe réactif AU480", qte: 1, prixUnit: 340, urgence: "critique", fournisseur: "Beckman Coulter" }, { id: "p2", reference: "TUBE", designation: "Tubulure silicone AU480", qte: 4, prixUnit: 28, urgence: "normale", fournisseur: "Beckman Coulter" }], kits: [] },
      { id: "comp-psa", modele: "Compresseur PSA 7.5kW", serie: "PSA-KAG-2021", statut: "Fonctionnel", pms: "2026-07-01", actions: 0, classe: "IIb", service: "Central technique", localisation: "Local technique", dateInstall: "2021-07-01", historique: [{ id: "h1", date: "2025-07-01", type: "PV préventif", description: "Révision annuelle huile, filtres — OK", technicien: "E. Niyonzima", pieces: [] }], pieces: [], kits: [] },
      { id: "seche-double", modele: "Sécheur PSA double tour", serie: "SPDBL-KAG-2021", statut: "Fonctionnel", pms: "2026-07-01", actions: 0, classe: "I", service: "Central technique", localisation: "Local technique", dateInstall: "2021-07-01", historique: [{ id: "h1", date: "2025-07-01", type: "PV préventif", description: "Contrôle régénération double tour — OK", technicien: "F. Uwineza", pieces: [] }], pieces: [], kits: [] },
      { id: "res-cu-o2", modele: "Réseau cuivre O₂", serie: "RCO2-KAG-2021", statut: "Fonctionnel", pms: "2026-09-01", actions: 0, classe: "IIb", service: "Central technique", localisation: "Bâtiments A/B/C", dateInstall: "2021-07-01", historique: [{ id: "h1", date: "2025-09-01", type: "PV préventif", description: "Test étanchéité réseau — aucune fuite détectée", technicien: "E. Niyonzima", pieces: [] }], pieces: [], kits: [] },
      { id: "res-cu-air", modele: "Réseau cuivre Air", serie: "RCAIR-KAG-2021", statut: "Fonctionnel", pms: "2026-09-01", actions: 0, classe: "IIb", service: "Central technique", localisation: "Bâtiments A/B/C", dateInstall: "2021-07-01", historique: [{ id: "h1", date: "2025-09-01", type: "PV préventif", description: "Test étanchéité réseau air médical OK", technicien: "F. Uwineza", pieces: [] }], pieces: [], kits: [] },
      { id: "reg-o2-kag", modele: "Régulateur de pression O₂", serie: "REGO2-KAG-01", statut: "Fonctionnel", pms: "2026-05-15", actions: 0, classe: "IIa", service: "Central technique", localisation: "Local gaz", dateInstall: "2021-07-01", historique: [{ id: "h1", date: "2025-05-15", type: "PV préventif", description: "Étalonnage et test pression sortie — 4 bar OK", technicien: "E. Niyonzima", pieces: [] }], pieces: [], kits: [] },
      { id: "col-bloc", modele: "Colonne de distribution bloc", serie: "CDB-KAG-2021", statut: "Fonctionnel", pms: "2026-08-01", actions: 0, classe: "IIb", service: "Bloc opératoire", localisation: "Salle op.", dateInstall: "2021-07-01", historique: [{ id: "h1", date: "2025-08-01", type: "PV préventif", description: "Contrôle prises gaz et électricité — conformes", technicien: "F. Uwineza", pieces: [] }], pieces: [], kits: [] },
      { id: "spo2-mat", modele: "Moniteur SpO₂", serie: "SPO2-MAT-KAG-01", statut: "Fonctionnel", pms: "2026-06-01", actions: 0, classe: "IIb", service: "Maternité", localisation: "Salle accouchement", dateInstall: "2022-06-01", historique: [{ id: "h1", date: "2025-06-01", type: "PV préventif", description: "Test capteur SpO2 et alarmes — OK", technicien: "E. Niyonzima", pieces: [] }, { id: "h2", date: "2025-12-15", type: "Pièce remplacée", description: "Remplacement sonde doigt adulte usée", technicien: "F. Uwineza", pieces: ["Sonde SpO2 adulte"] }], pieces: [], kits: [] },
      { id: "couveuse-port", modele: "Couveuse portable", serie: "CVP-KAG-2019", statut: "Inutilisé", pms: "—", actions: 0, classe: "IIb", service: "Néonatologie", localisation: "Dépôt maternité", dateInstall: "2019-01-01", historique: [{ id: "h1", date: "2024-01-15", type: "PV correctif", description: "Couveuse retirée — résistance chauffante HS, pièce non disponible localement", technicien: "E. Niyonzima", pieces: [] }], pieces: [], kits: [] },
    ],
    nodes: [
      { id: "edc-kag", label: "", sublabel: "EDC", x: 55, y: 200, color: "#22c55e", r: 22, icon: "lightning" },
      { id: "comp-psa", label: "C", sublabel: "Comp 1", x: 145, y: 130, color: "#22c55e", r: 22 },
      { id: "comp2-kag", label: "C", sublabel: "Comp 2", x: 145, y: 275, color: "#22c55e", r: 22 },
      { id: "seche-double", label: "", sublabel: "Dry 1", x: 232, y: 108, color: "#22c55e", r: 22, icon: "snowflake" },
      { id: "dry2-kag", label: "", sublabel: "Dry 2", x: 232, y: 290, color: "#22c55e", r: 22, icon: "snowflake" },
      { id: "cu1-kag", label: "Cu1", sublabel: "Cu1", x: 315, y: 88, color: "#38bdf8", r: 20 },
      { id: "cu2-kag", label: "Cu2", sublabel: "Cu2", x: 315, y: 310, color: "#38bdf8", r: 20 },
      { id: "rx-kag", label: "O₂", sublabel: "Rx 700 M", x: 430, y: 195, color: "#22c55e", r: 30 },
      { id: "rx700s-kag", label: "O₂", sublabel: "Rx 700 Slave", x: 430, y: 315, color: "#94a3b8", r: 26 },
      { id: "cu3-kag", label: "Cu3", sublabel: "Cu3", x: 540, y: 108, color: "#38bdf8", r: 20 },
      { id: "hp1-kag", label: "", sublabel: "HP 1", x: 630, y: 42, color: "#22c55e", r: 22, icon: "arrow-up" },
      { id: "hp2-kag", label: "", sublabel: "HP 2", x: 630, y: 130, color: "#ef4444", r: 22, icon: "arrow-up" },
      { id: "p1-kag", label: "1", sublabel: "1", x: 630, y: 200, color: "#38bdf8", r: 18 },
      { id: "p2-kag", label: "2", sublabel: "2", x: 630, y: 248, color: "#38bdf8", r: 18 },
      { id: "p3-kag", label: "3", sublabel: "3", x: 630, y: 305, color: "#38bdf8", r: 18 },
      { id: "p4-kag", label: "4", sublabel: "4", x: 630, y: 358, color: "#38bdf8", r: 18 },
    ],
    edges: [
      { from: "edc-kag", to: "comp-psa", label: "230V~", electric: true },
      { from: "edc-kag", to: "comp2-kag", label: "230V~", electric: true },
      { from: "edc-kag", to: "seche-double", label: "400V~", electric: true },
      { from: "edc-kag", to: "dry2-kag", label: "230V~", electric: true },
      { from: "edc-kag", to: "cu1-kag", label: "400V~", electric: true },
      { from: "edc-kag", to: "rx-kag", label: "230V~", electric: true },
      { from: "comp-psa", to: "seche-double", label: "Air" },
      { from: "comp2-kag", to: "dry2-kag", label: "Air" },
      { from: "seche-double", to: "cu1-kag", label: "Air-sec" },
      { from: "dry2-kag", to: "cu2-kag", label: "Air-sec" },
      { from: "cu1-kag", to: "rx-kag", label: "Air" },
      { from: "cu2-kag", to: "rx-kag", label: "Air" },
      { from: "rx-kag", to: "cu3-kag", label: "O₂" },
      { from: "rx-kag", to: "rx700s-kag", label: "Sync M-S" },
      { from: "rx-kag", to: "p1-kag", label: "Process" },
      { from: "rx-kag", to: "p2-kag", label: "Process" },
      { from: "cu3-kag", to: "hp1-kag", label: "O₂-BP" },
      { from: "cu3-kag", to: "hp2-kag", label: "O₂-BP" },
      { from: "rx700s-kag", to: "p3-kag", label: "Process" },
      { from: "rx700s-kag", to: "p4-kag", label: "Process" },
    ],
  },
};

/* ── Status Badge ── */
function StatutBadge({ statut }: { statut: Statut }) {
  const c = statutStyle(statut);
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{ backgroundColor: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
      <span className="rounded-full" style={{ width: 7, height: 7, backgroundColor: c.dot, flexShrink: 0 }} />
      {statut}
    </span>
  );
}

/* ── Dynamic Network Graph ── */
function NetworkGraph({ nodes, edges, selectedId, onNodeClick, dms, isAdmin, onQuickStatus }: {
  nodes: GNode[]; edges: GEdge[]; selectedId: string | null; onNodeClick: (id: string) => void;
  dms: DM[]; isAdmin: boolean; onQuickStatus?: (dmId: string, statut: Statut) => void;
}) {
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; dmId: string } | null>(null);
  const dmById = useMemo(() => Object.fromEntries(dms.map(d => [d.id, d])), [dms]);

  const dynNodes = useMemo(() => nodes.map(n => {
    const dm = dmById[n.id];
    return dm ? { ...n, color: statutToNodeColor(dm.statut) } : n;
  }), [nodes, dmById]);

  const byId = Object.fromEntries(dynNodes.map(n => [n.id, n]));

  function onCtx(e: React.MouseEvent, nid: string) {
    if (!isAdmin || !onQuickStatus || !dmById[nid]) return;
    e.preventDefault();
    const rect = (e.currentTarget as SVGElement).closest("svg")?.getBoundingClientRect();
    if (!rect) return;
    setCtxMenu({ x: e.clientX - rect.left, y: e.clientY - rect.top, dmId: nid });
  }

  return (
    <div className="relative" onClick={() => setCtxMenu(null)}>
      <svg viewBox="0 0 690 400" className="w-full h-full" style={{ minHeight: 360 }}>
        <defs>
          <marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#f97316" opacity={0.85} />
          </marker>
          <marker id="arr-elec" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#94a3b8" opacity={0.7} />
          </marker>
        </defs>
        {edges.map((e, i) => {
          const a = byId[e.from]; const b = byId[e.to];
          if (!a || !b) return null;
          const dx = b.x - a.x; const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy); const ux = dx / dist; const uy = dy / dist;
          const x1 = a.x + ux * a.r; const y1 = a.y + uy * a.r;
          const x2 = b.x - ux * b.r; const y2 = b.y - uy * b.r;
          const mx = (x1 + x2) / 2; const my = (y1 + y2) / 2;
          const isElec = e.electric;
          return (
            <g key={i}>
              <line x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={isElec ? "#94a3b8" : "#f97316"}
                strokeWidth={isElec ? 1 : 1.5}
                strokeDasharray={isElec ? "4 3" : "0"}
                strokeOpacity={isElec ? 0.55 : 0.85}
                markerEnd={isElec ? "url(#arr-elec)" : "url(#arr)"} />
              {e.label && (
                <text x={mx} y={my - 3} textAnchor="middle"
                  fill={isElec ? "#64748b" : "#ea580c"} fontSize={6.5} fontWeight="600"
                  style={{ pointerEvents: "none", userSelect: "none", paintOrder: "stroke", stroke: "#f8fafc", strokeWidth: 2.5, strokeLinejoin: "round" } as React.CSSProperties}>
                  {e.label}
                </text>
              )}
            </g>
          );
        })}
        {dynNodes.map(n => {
          const isSel = n.id === selectedId;
          const dm = dmById[n.id];
          return (
            <g key={n.id} onClick={e => { e.stopPropagation(); onNodeClick(n.id); }} onContextMenu={e => onCtx(e, n.id)} style={{ cursor: "pointer" }}>
              {dm?.statut === "Hors service" && (
                <circle cx={n.x} cy={n.y} r={n.r + 4} fill="none" stroke="#ef4444" strokeWidth={1.5} opacity={0.6}>
                  <animate attributeName="r" from={String(n.r + 2)} to={String(n.r + 8)} dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.6" to="0" dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}
              {isSel && <circle cx={n.x} cy={n.y} r={n.r + 5} fill="none" stroke="#f97316" strokeWidth={2} />}
              <circle cx={n.x} cy={n.y} r={n.r} fill={n.color} stroke={isSel ? "#f97316" : "#fff"} strokeWidth={isSel ? 2 : 1.5}
                style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.18))" }} />
              {dm?.statut === "Inutilisé" && (
                <line x1={n.x - n.r + 4} y1={n.y} x2={n.x + n.r - 4} y2={n.y} stroke="rgba(255,255,255,0.7)" strokeWidth={2} />
              )}
              {n.icon === "snowflake" && (
                <>
                  <circle cx={n.x} cy={n.y} r={n.r - 7} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth={1.5} />
                  <text x={n.x} y={n.y + 0.5} textAnchor="middle" dominantBaseline="central" fill="rgba(255,255,255,0.9)" fontSize={n.r * 0.55}
                    style={{ pointerEvents: "none", userSelect: "none" }}>{"❄"}</text>
                </>
              )}
              {n.icon === "lightning" && (
                <text x={n.x} y={n.y + 1} textAnchor="middle" dominantBaseline="central" fontSize={n.r * 0.9}
                  style={{ pointerEvents: "none", userSelect: "none" }}>{"⚡"}</text>
              )}
              {n.icon === "arrow-up" && (
                <text x={n.x} y={n.y + 1} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize={n.r * 0.95} fontWeight="bold"
                  style={{ pointerEvents: "none", userSelect: "none" }}>{"↑"}</text>
              )}
              {!n.icon && n.label && (
                <text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize={n.label.length > 2 ? 7 : (n.r > 25 ? 11 : 10)} fontWeight="700"
                  style={{ pointerEvents: "none", userSelect: "none" }}>{n.label}</text>
              )}
              {n.sublabel && (
                <text x={n.x} y={n.y + n.r + 10} textAnchor="middle" fill="#64748b" fontSize={8}
                  style={{ pointerEvents: "none", userSelect: "none" }}>{n.sublabel}</text>
              )}
            </g>
          );
        })}
      </svg>
      {/* Legend */}
      <div className="flex items-center gap-3 mt-1 flex-wrap">
        {STATUTS.map(s => (
          <div key={s} className="flex items-center gap-1">
            <span className="rounded-full" style={{ width: 8, height: 8, backgroundColor: statutToNodeColor(s) }} />
            <span className="text-[10px] text-slate-500">{s}</span>
          </div>
        ))}
        {isAdmin && <span className="text-[10px] text-orange-400 ml-auto">Clic droit = changer statut</span>}
      </div>
      {/* Context menu */}
      {ctxMenu && isAdmin && (
        <div className="absolute z-20 rounded-lg bg-white border border-slate-200 shadow-xl py-1 flex flex-col min-w-36"
          style={{ left: ctxMenu.x, top: ctxMenu.y }} onClick={e => e.stopPropagation()}>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide px-3 py-1">Changer le statut</p>
          {STATUTS.map(s => {
            const st = statutStyle(s);
            return <button key={s} onClick={() => { if (onQuickStatus) onQuickStatus(ctxMenu.dmId, s); setCtxMenu(null); }}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium hover:bg-slate-50 text-left">
              <span className="rounded-full" style={{ width: 8, height: 8, backgroundColor: st.dot }} />{s}
            </button>;
          })}
        </div>
      )}
    </div>
  );
}

/* ── Pannes : KPI + formulaire + liste ── */
function PanneEtatBadge({ etat }: { etat: PanneEtat }) {
  const s = panneEtatStyle(etat);
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: s.bg, color: s.text, border: `1px solid ${s.border}` }}>
      <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.dot }} />
      {etat}
    </span>
  );
}

function PanneWorkflowStepper({ etat }: { etat: PanneEtat }) {
  const idx = PANNE_ETATS.indexOf(etat);
  return (
    <div className="flex items-center gap-1">
      {PANNE_ETATS.map((e, i) => {
        const done = i <= idx;
        const s = panneEtatStyle(e);
        return (
          <div key={e} className="flex items-center gap-1">
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[9px] font-bold"
              style={{ backgroundColor: done ? s.dot : "#e2e8f0", color: done ? "#fff" : "#94a3b8" }}>{i + 1}</span>
            <span className={"text-[9px] font-semibold " + (done ? "" : "opacity-40")} style={{ color: done ? s.text : "#94a3b8" }}>{e}</span>
            {i < PANNE_ETATS.length - 1 ? <span className="inline-block h-px w-2" style={{ backgroundColor: i < idx ? s.dot : "#e2e8f0" }} /> : null}
          </div>
        );
      })}
    </div>
  );
}

function PannesPanel({ dm, pannes, isAdmin, onAdd, onUpdate, onRemove }: {
  dm: DM; pannes: PanneEntry[]; isAdmin: boolean;
  onAdd: (p: PanneEntry) => void; onUpdate: (pid: string, patch: Partial<PanneEntry>) => void; onRemove: (pid: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  // form state
  const today = new Date().toISOString().slice(0, 10);
  const [fEtat, setFEtat] = useState<PanneEtat>("Signalé");
  const [fDateSig, setFDateSig] = useState(today);
  const [fDesc, setFDesc] = useState("");
  const [fDiag, setFDiag] = useState("");
  const [fCauseR, setFCauseR] = useState<CauseRacine | "">("");
  const [fCauseL, setFCauseL] = useState("");
  const [fAction, setFAction] = useState("");
  const [fDebut, setFDebut] = useState("");
  const [fFin, setFFin] = useState("");
  const [fResultat, setFResultat] = useState<NonNullable<PanneEntry["resultatTest"]>>("");
  const [fValid, setFValid] = useState(false);
  const [fValidPar, setFValidPar] = useState("");
  const [fCout, setFCout] = useState("");
  const [fTech, setFTech] = useState("");
  const [fPieces, setFPieces] = useState("");

  function resetForm() {
    setFEtat("Signalé"); setFDateSig(today); setFDesc(""); setFDiag(""); setFCauseR(""); setFCauseL("");
    setFAction(""); setFDebut(""); setFFin(""); setFResultat(""); setFValid(false); setFValidPar(""); setFCout(""); setFTech(""); setFPieces("");
    setEditId(null);
  }
  function loadForEdit(p: PanneEntry) {
    setEditId(p.id);
    setFEtat(p.etat); setFDateSig(p.dateSignalement); setFDesc(p.description); setFDiag(p.diagnostic ?? "");
    setFCauseR(p.causeRacine ?? ""); setFCauseL(p.causeLibre ?? ""); setFAction(p.actionCorrective ?? "");
    setFDebut(p.dateDebutIntervention ?? ""); setFFin(p.dateFinIntervention ?? "");
    setFResultat(p.resultatTest ?? ""); setFValid(!!p.validationFinale); setFValidPar(p.validePar ?? "");
    setFCout(p.coutTotal?.toString() ?? ""); setFTech(p.technicien ?? ""); setFPieces((p.piecesRemplacees ?? []).join(", "));
    setShowForm(true);
  }
  function submitForm() {
    if (!fDateSig || !fDesc.trim()) { alert("Date de signalement et description sont obligatoires."); return; }
    const payload: PanneEntry = {
      id: editId ?? uid(),
      etat: fEtat,
      dateSignalement: fDateSig,
      description: fDesc.trim(),
      diagnostic: fDiag.trim() || undefined,
      causeRacine: (fCauseR || undefined) as CauseRacine | undefined,
      causeLibre: fCauseL.trim() || undefined,
      actionCorrective: fAction.trim() || undefined,
      dateDebutIntervention: fDebut || undefined,
      dateFinIntervention: fFin || undefined,
      resultatTest: fResultat || undefined,
      validationFinale: fValid,
      validePar: fValidPar.trim() || undefined,
      validationDate: fValid ? (fFin || today) : undefined,
      coutTotal: fCout ? parseFloat(fCout) : undefined,
      technicien: fTech.trim() || undefined,
      piecesRemplacees: fPieces ? fPieces.split(",").map(s => s.trim()).filter(Boolean) : undefined,
    };
    if (editId) onUpdate(editId, payload); else onAdd(payload);
    resetForm(); setShowForm(false);
  }

  const mtbf = computeMTBF(pannes);
  const mttr = computeMTTR(pannes);
  const nbPannes = pannes.length;
  const coutTotal = computeCoutTotalMaintenance(dm);
  const ouvertes = pannes.filter(p => p.etat !== "Clôturé").length;

  return (
    <div className="flex flex-col gap-3">
      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-1.5">
        <KpiBox label="NB PANNES" value={nbPannes.toString()} sub={ouvertes > 0 ? `${ouvertes} ouverte(s)` : "0 ouverte"} color="#ef4444" />
        <KpiBox label="MTBF" value={mtbf === null ? "—" : fmtJours(mtbf)} sub="entre pannes" color="#3b82f6" />
        <KpiBox label="MTTR" value={fmtHeures(mttr)} sub="par réparation" color="#8b5cf6" />
        <KpiBox label="COÛT TOTAL" value={fmtEur(coutTotal)} sub="maintenance" color="#f97316" />
      </div>

      {isAdmin && (
        <button onClick={() => { resetForm(); setShowForm(v => !v); }} className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold"
          style={{ backgroundColor: "#2563eb", color: "#fff" }}>
          <IconPlus /> {showForm ? "Fermer le formulaire" : "Signaler une panne"}
        </button>
      )}

      {showForm && isAdmin && (
        <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-3 flex flex-col gap-2">
          <p className="text-xs font-bold text-blue-800">{editId ? "Modifier la panne" : "Nouvelle panne"}</p>
          <PanneWorkflowStepper etat={fEtat} />

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelCls}>État workflow</label>
              <select value={fEtat} onChange={e => setFEtat(e.target.value as PanneEtat)} className={inputCls}>
                {PANNE_ETATS.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Date de signalement *</label>
              <input type="date" value={fDateSig} onChange={e => setFDateSig(e.target.value)} className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Description de la panne *</label>
            <textarea value={fDesc} onChange={e => setFDesc(e.target.value)} className={inputCls} rows={2} placeholder="Ex : le compresseur s'arrête en charge après 5 minutes" />
          </div>

          <div>
            <label className={labelCls}>Diagnostic technique</label>
            <textarea value={fDiag} onChange={e => setFDiag(e.target.value)} className={inputCls} rows={2} placeholder="Constat technique après inspection" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelCls}>Cause racine (liste)</label>
              <select value={fCauseR} onChange={e => setFCauseR(e.target.value as CauseRacine | "")} className={inputCls}>
                <option value="">—</option>
                {CAUSES_RACINE.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Cause (texte libre)</label>
              <input value={fCauseL} onChange={e => setFCauseL(e.target.value)} className={inputCls} placeholder="Précision" />
            </div>
          </div>

          <div>
            <label className={labelCls}>Action corrective</label>
            <textarea value={fAction} onChange={e => setFAction(e.target.value)} className={inputCls} rows={2} placeholder="Ex : remplacement condensateur moteur, remise en route" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelCls}>Date début intervention</label>
              <input type="date" value={fDebut} onChange={e => setFDebut(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Date fin intervention</label>
              <input type="date" value={fFin} onChange={e => setFFin(e.target.value)} className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelCls}>Résultat test</label>
              <select value={fResultat} onChange={e => setFResultat(e.target.value as NonNullable<PanneEntry["resultatTest"]>)} className={inputCls}>
                <option value="">—</option>
                <option value="Conforme">Conforme</option>
                <option value="Non conforme">Non conforme</option>
                <option value="À revoir">À revoir</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Coût total (€)</label>
              <input type="number" value={fCout} onChange={e => setFCout(e.target.value)} className={inputCls} placeholder="0" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelCls}>Technicien</label>
              <input value={fTech} onChange={e => setFTech(e.target.value)} className={inputCls} placeholder="Nom prénom" />
            </div>
            <div>
              <label className={labelCls}>Pièces remplacées (virgule)</label>
              <input value={fPieces} onChange={e => setFPieces(e.target.value)} className={inputCls} placeholder="ex : Condensateur, Joint" />
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2 py-1.5">
            <input id="fValid" type="checkbox" checked={fValid} onChange={e => setFValid(e.target.checked)} />
            <label htmlFor="fValid" className="text-xs font-semibold text-slate-700">Validation finale</label>
            <input value={fValidPar} onChange={e => setFValidPar(e.target.value)} className={inputCls} placeholder="Validé par (nom)" style={{ maxWidth: 180 }} />
          </div>

          <div className="flex gap-2 mt-1">
            <button onClick={submitForm} className="rounded-lg px-3 py-1.5 text-xs font-bold" style={{ backgroundColor: "#2563eb", color: "#fff" }}>
              {editId ? "Enregistrer" : "Créer la panne"}
            </button>
            <button onClick={() => { resetForm(); setShowForm(false); }} className="rounded-lg px-3 py-1.5 text-xs font-semibold" style={{ backgroundColor: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0" }}>
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Liste des pannes */}
      {pannes.length === 0 ? (
        <p className="text-xs text-slate-400 italic text-center py-4">Aucune panne enregistrée pour cet équipement.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {[...pannes].sort((a, b) => (b.dateSignalement || "").localeCompare(a.dateSignalement || "")).map(p => {
            const s = panneEtatStyle(p.etat);
            const duree = diffHours(p.dateDebutIntervention, p.dateFinIntervention);
            return (
              <div key={p.id} className="rounded-lg border bg-white p-2.5" style={{ borderColor: s.border }}>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <PanneEtatBadge etat={p.etat} />
                      <span className="text-[10px] text-slate-500">Signalée le {p.dateSignalement}</span>
                      {p.validationFinale ? <span className="text-[10px] rounded-full bg-emerald-100 text-emerald-700 px-1.5 py-0.5 font-semibold">✓ Validée</span> : null}
                    </div>
                    <p className="text-xs font-semibold text-slate-800">{p.description}</p>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-1 shrink-0">
                      <IconButton title="Modifier la panne" onClick={() => loadForEdit(p)} variant="edit"><IconPencil /></IconButton>
                      <IconButton title="Supprimer la panne" onClick={() => { if (window.confirm("Supprimer cette panne ?")) onRemove(p.id); }} variant="danger"><IconTrash /></IconButton>
                    </div>
                  )}
                </div>
                <PanneWorkflowStepper etat={p.etat} />
                <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-slate-600 mt-2">
                  {p.diagnostic ? <div className="col-span-2"><span className="text-slate-400">Diagnostic :</span> {p.diagnostic}</div> : null}
                  {p.causeRacine ? <div className="col-span-2"><span className="text-slate-400">Cause racine :</span> {p.causeRacine}{p.causeLibre ? ` — ${p.causeLibre}` : ""}</div> : null}
                  {p.actionCorrective ? <div className="col-span-2"><span className="text-slate-400">Action corrective :</span> {p.actionCorrective}</div> : null}
                  {p.dateDebutIntervention ? <div><span className="text-slate-400">Début :</span> {p.dateDebutIntervention}</div> : null}
                  {p.dateFinIntervention ? <div><span className="text-slate-400">Fin :</span> {p.dateFinIntervention}</div> : null}
                  {duree !== null ? <div><span className="text-slate-400">Durée :</span> {fmtHeures(duree)}</div> : null}
                  {p.resultatTest ? <div><span className="text-slate-400">Test :</span> {p.resultatTest}</div> : null}
                  {p.coutTotal ? <div><span className="text-slate-400">Coût :</span> {fmtEur(p.coutTotal)}</div> : null}
                  {p.technicien ? <div><span className="text-slate-400">Technicien :</span> {p.technicien}</div> : null}
                  {p.piecesRemplacees && p.piecesRemplacees.length > 0 ? <div className="col-span-2"><span className="text-slate-400">Pièces remplacées :</span> {p.piecesRemplacees.join(", ")}</div> : null}
                  {p.validationFinale && p.validePar ? <div className="col-span-2"><span className="text-slate-400">Validée par :</span> {p.validePar}{p.validationDate ? ` (${p.validationDate})` : ""}</div> : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Mini graphiques SVG (sans dépendance externe) ── */
function PieChart({ data, size = 140 }: { data: { label: string; value: number; color: string }[]; size?: number }) {
  const total = data.reduce((a, d) => a + d.value, 0);
  if (total === 0) return <p className="text-[10px] text-slate-400 italic">Aucune donnée</p>;
  const cx = size / 2, cy = size / 2, r = size / 2 - 6;
  let acc = 0;
  const paths = data.map(d => {
    if (d.value === 0) return null;
    const start = (acc / total) * Math.PI * 2 - Math.PI / 2;
    acc += d.value;
    const end = (acc / total) * Math.PI * 2 - Math.PI / 2;
    const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end),   y2 = cy + r * Math.sin(end);
    const large = end - start > Math.PI ? 1 : 0;
    const dpath = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
    return <path key={d.label} d={dpath} fill={d.color} stroke="#fff" strokeWidth={1} />;
  });
  return (
    <div className="flex items-center gap-3">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>{paths}</svg>
      <div className="flex flex-col gap-1 text-[10px]">
        {data.map(d => (
          <div key={d.label} className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: d.color }} />
            <span className="text-slate-600">{d.label}</span>
            <span className="text-slate-400">· {d.value}{total > 0 ? ` (${Math.round((d.value / total) * 100)}%)` : ""}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarChart({ data, height = 140, barColor = "#3b82f6" }: { data: { label: string; value: number; color?: string }[]; height?: number; barColor?: string }) {
  if (data.length === 0) return <p className="text-[10px] text-slate-400 italic">Aucune donnée</p>;
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-2 overflow-x-auto" style={{ minHeight: height + 30 }}>
      {data.map(d => {
        const h = Math.max(4, (d.value / max) * height);
        return (
          <div key={d.label} className="flex flex-col items-center gap-1 shrink-0" style={{ minWidth: 42 }}>
            <span className="text-[9px] font-semibold text-slate-600">{d.value}</span>
            <div className="rounded-t" style={{ width: 22, height: h, backgroundColor: d.color ?? barColor }} />
            <span className="text-[9px] text-slate-500 text-center leading-tight max-w-[80px] truncate" title={d.label}>{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function LineChart({ points, height = 110, color = "#ef4444" }: { points: { x: string; y: number }[]; height?: number; color?: string }) {
  if (points.length === 0) return <p className="text-[10px] text-slate-400 italic">Aucune donnée</p>;
  const w = Math.max(220, points.length * 34);
  const max = Math.max(...points.map(p => p.y), 1);
  const stepX = points.length > 1 ? w / (points.length - 1) : w;
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${i * stepX} ${height - (p.y / max) * (height - 16) - 6}`).join(" ");
  return (
    <div className="overflow-x-auto">
      <svg width={w + 10} height={height + 24}>
        <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={i * stepX} cy={height - (p.y / max) * (height - 16) - 6} r={3} fill={color} />
            <text x={i * stepX} y={height + 14} fontSize="9" textAnchor="middle" fill="#64748b">{p.x}</text>
            <text x={i * stepX} y={height - (p.y / max) * (height - 16) - 10} fontSize="9" textAnchor="middle" fill="#334155" fontWeight="bold">{p.y}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function KpiBox({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="rounded-lg border bg-white p-2" style={{ borderColor: "#e2e8f0" }}>
      <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="text-base font-bold leading-tight" style={{ color }}>{value}</p>
      {sub ? <p className="text-[9px] text-slate-400 leading-tight mt-0.5">{sub}</p> : null}
    </div>
  );
}

/* ── Timeline chronologique des interventions (préventives + curatives + pannes) ── */
function InterventionsTimeline({ historique, pannes }: { historique: HistoriqueEntry[]; pannes: PanneEntry[] }) {
  type Item = { date: string; label: string; kind: "preventif" | "correctif" | "kit" | "piece" | "install" | "panne"; color: string; sub?: string };
  const items: Item[] = [];
  for (const h of historique) {
    const kind: Item["kind"] =
      h.type === "PV préventif" ? "preventif" :
      h.type === "PV correctif" ? "correctif" :
      h.type === "Kit maintenance" ? "kit" :
      h.type === "Pièce remplacée" ? "piece" : "install";
    const color =
      kind === "preventif" ? "#22c55e" :
      kind === "correctif" ? "#ef4444" :
      kind === "kit" ? "#8b5cf6" :
      kind === "piece" ? "#f97316" : "#64748b";
    items.push({ date: h.date, label: h.type, kind, color, sub: h.description });
  }
  for (const p of pannes) {
    items.push({ date: p.dateSignalement, label: `Panne — ${p.etat}`, kind: "panne", color: panneEtatStyle(p.etat).dot, sub: p.description });
  }
  items.sort((a, b) => b.date.localeCompare(a.date));
  if (items.length === 0) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-2">Timeline des interventions</p>
      <div className="relative pl-4">
        <div className="absolute left-1.5 top-1 bottom-1 w-px bg-slate-200" />
        {items.map((it, i) => (
          <div key={i} className="relative pb-2 last:pb-0">
            <span className="absolute -left-[11px] top-1 h-2.5 w-2.5 rounded-full ring-2 ring-white" style={{ backgroundColor: it.color }} />
            <div className="flex items-baseline gap-2">
              <span className="text-[10px] font-mono text-slate-400 shrink-0">{it.date}</span>
              <span className="text-[10px] font-semibold" style={{ color: it.color }}>{it.label}</span>
            </div>
            {it.sub ? <p className="text-[10px] text-slate-500 leading-snug">{it.sub}</p> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Right Panel Content (keyed by dm.id) ── */
function RightPanelContent({ dm, isAdmin, onClose, onUpdate, onDelete }: {
  dm: DM; isAdmin: boolean; onClose: () => void; onUpdate: (dm: DM) => void; onDelete: () => void;
}) {
  const [tab, setTab] = useState<PanelTab>("details");
  const [editing, setEditing] = useState(false);
  const [editStatut, setEditStatut] = useState<Statut>(dm.statut);
  // Info fields
  const [eModele, setEModele] = useState(dm.modele);
  const [eMarque, setEMarque] = useState(dm.marque ?? "");
  const [eSerie, setESerie] = useState(dm.serie);
  const [eClasse, setEClasse] = useState(dm.classe ?? "");
  const [eService, setEService] = useState(dm.service ?? "");
  const [eLocalisation, setELocalisation] = useState(dm.localisation ?? "");
  const [eDateInstall, setEDateInstall] = useState(dm.dateInstall ?? "");
  const [eFournisseur, setEFournisseur] = useState(dm.fournisseur ?? "");
  const [ePms, setEPms] = useState(dm.pms);
  // Historique form
  const [hDate, setHDate] = useState(""); const [hType, setHType] = useState<HistoriqueEntry["type"]>("PV préventif");
  const [hDesc, setHDesc] = useState(""); const [hTech, setHTech] = useState(""); const [hPieces, setHPieces] = useState("");
  // Piece form
  const [pRef, setPRef] = useState(""); const [pDesig, setPDesig] = useState("");
  const [pQte, setPQte] = useState("1"); const [pPrix, setPPrix] = useState(""); const [pUrg, setPUrg] = useState<Piece["urgence"]>("normale");
  const [pFour, setPFour] = useState("");
  // Kit form
  const [kRef, setKRef] = useState(""); const [kDesig, setKDesig] = useState(""); const [kContenu, setKContenu] = useState("");
  const [kQte, setKQte] = useState("1"); const [kPrix, setKPrix] = useState(""); const [kPeriod, setKPeriod] = useState<Kit["periodicite"]>("Annuel");
  const [kFour, setKFour] = useState(""); const [kDernier, setKDernier] = useState("");
  // Inline edit
  const [editingPieceId, setEditingPieceId] = useState<string | null>(null);
  const [editingKitId, setEditingKitId] = useState<string | null>(null);
  const [editingHistoId, setEditingHistoId] = useState<string | null>(null);

  const kits = dm.kits ?? [];

  function saveStatut() { onUpdate({ ...dm, statut: editStatut }); }
  function saveInfos() {
    onUpdate({ ...dm, modele: eModele, marque: eMarque || undefined, serie: eSerie, classe: eClasse || undefined, service: eService || undefined,
      localisation: eLocalisation || undefined, dateInstall: eDateInstall || undefined, fournisseur: eFournisseur || undefined, pms: ePms });
  }
  function addHisto() {
    if (!hDate || !hDesc || !hTech) return;
    onUpdate({ ...dm, historique: [...dm.historique, { id: uid(), date: hDate, type: hType, description: hDesc, technicien: hTech, pieces: hPieces ? hPieces.split(",").map(s => s.trim()).filter(Boolean) : [] }] });
    setHDate(""); setHDesc(""); setHTech(""); setHPieces("");
  }
  function removeHisto(hid: string) { onUpdate({ ...dm, historique: dm.historique.filter(h => h.id !== hid) }); }
  function addPiece() {
    if (!pRef || !pDesig || !pPrix) return;
    onUpdate({ ...dm, pieces: [...dm.pieces, { id: uid(), reference: pRef, designation: pDesig, qte: parseInt(pQte) || 1, prixUnit: parseFloat(pPrix) || 0, urgence: pUrg, fournisseur: pFour || undefined }] });
    setPRef(""); setPDesig(""); setPQte("1"); setPPrix(""); setPFour("");
  }
  function removePiece(pid: string) { onUpdate({ ...dm, pieces: dm.pieces.filter(p => p.id !== pid) }); }
  function updatePiece(pid: string, patch: Partial<Piece>) {
    onUpdate({ ...dm, pieces: dm.pieces.map(p => p.id === pid ? { ...p, ...patch } : p) });
  }
  function addKit() {
    if (!kRef || !kDesig) return;
    onUpdate({ ...dm, kits: [...kits, { id: uid(), reference: kRef, designation: kDesig, contenu: kContenu, qte: parseInt(kQte) || 1, prixUnit: parseFloat(kPrix) || 0, periodicite: kPeriod, fournisseur: kFour || undefined, dernierUtilise: kDernier || undefined }] });
    setKRef(""); setKDesig(""); setKContenu(""); setKQte("1"); setKPrix(""); setKFour(""); setKDernier("");
  }
  function removeKit(kid: string) { onUpdate({ ...dm, kits: kits.filter(k => k.id !== kid) }); }
  function updateKit(kid: string, patch: Partial<Kit>) {
    onUpdate({ ...dm, kits: kits.map(k => k.id === kid ? { ...k, ...patch } : k) });
  }
  function updateHisto(hid: string, patch: Partial<HistoriqueEntry>) {
    onUpdate({ ...dm, historique: dm.historique.map(h => h.id === hid ? { ...h, ...patch } : h) });
  }
  // Pannes — workflow complet
  const pannes = dm.pannes ?? [];
  function addPanne(p: PanneEntry) {
    const next = [...pannes, p];
    onUpdate({ ...dm, pannes: next, statutTechnique: p.etat });
  }
  function updatePanne(pid: string, patch: Partial<PanneEntry>) {
    const next = pannes.map(p => p.id === pid ? { ...p, ...patch } : p);
    // statutTechnique = état de la panne la plus récente non clôturée, sinon la dernière
    const ouverte = [...next].reverse().find(x => x.etat !== "Clôturé");
    const dernier = next[next.length - 1];
    onUpdate({ ...dm, pannes: next, statutTechnique: ouverte?.etat ?? dernier?.etat });
  }
  function removePanne(pid: string) {
    const next = pannes.filter(p => p.id !== pid);
    const ouverte = [...next].reverse().find(x => x.etat !== "Clôturé");
    const dernier = next[next.length - 1];
    onUpdate({ ...dm, pannes: next, statutTechnique: ouverte?.etat ?? dernier?.etat });
  }
  function confirmDelete() { if (window.confirm("Supprimer définitivement cet équipement ?")) onDelete(); }

  const totalCost = dm.pieces.reduce((a, p) => a + p.qte * p.prixUnit, 0);
  const totalKitCost = kits.reduce((a, k) => a + k.qte * k.prixUnit, 0);
  const TABS: { key: PanelTab; label: string }[] = [
    { key: "details", label: "Détails" },
    { key: "pannes", label: `Pannes (${(dm.pannes ?? []).length})` },
    { key: "historique", label: `Historique (${dm.historique.length})` },
    { key: "pieces", label: `Pièces (${dm.pieces.length})` },
    { key: "kits", label: `Kits (${kits.length})` },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-start justify-between px-4 pt-4 pb-2 border-b border-slate-100">
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-0.5">Équipement</p>
          <p className="text-sm font-bold text-slate-900 leading-tight truncate">{dm.modele}</p>
          <div className="mt-1 flex items-center gap-1.5 flex-wrap">
            <StatutBadge statut={dm.statut} />
            {dm.statutTechnique ? <PanneEtatBadge etat={dm.statutTechnique} /> : null}
          </div>
        </div>
        <button onClick={onClose} className="text-slate-300 hover:text-slate-500 text-xl leading-none shrink-0">×</button>
      </div>
      <div className="flex border-b border-slate-100 px-4 pt-2">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="mr-3 pb-1.5 text-xs font-semibold border-b-2 transition-colors"
            style={{ borderColor: tab === t.key ? "#f97316" : "transparent", color: tab === t.key ? "#f97316" : "#94a3b8" }}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
        {/* Admin buttons */}
        {isAdmin && !editing ? (
          <div className="flex gap-2">
            <button onClick={() => setEditing(true)} className={btnSm} style={{ backgroundColor: "#f97316", color: "#fff" }}>Modifier</button>
            <button onClick={confirmDelete} className={btnSm} style={{ backgroundColor: "#ef4444", color: "#fff" }}>Supprimer</button>
          </div>
        ) : null}

        {/* Edit form */}
        {editing ? (
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 flex flex-col gap-3">
            <p className="text-xs font-bold text-orange-700">Mode édition</p>

            {/* Status */}
            <div>
              <label className={labelCls}>Statut</label>
              <div className="flex gap-1.5 flex-wrap">
                {STATUTS.map(s => {
                  const st = statutStyle(s); const sel = editStatut === s;
                  return <button key={s} onClick={() => { setEditStatut(s); onUpdate({ ...dm, statut: s }); }}
                    className="rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all flex items-center gap-1"
                    style={{ backgroundColor: sel ? st.dot : st.bg, color: sel ? "#fff" : st.text, border: `1.5px solid ${sel ? st.dot : st.border}` }}>
                    <span className="rounded-full" style={{ width: 6, height: 6, backgroundColor: sel ? "#fff" : st.dot }} />{s}
                  </button>;
                })}
              </div>
            </div>

            <hr className="border-orange-200" />

            {/* Edit all fields */}
            <div>
              <p className="text-xs font-bold text-orange-700 mb-2">Informations générales</p>
              <div className="flex flex-col gap-1.5">
                <div className="grid grid-cols-2 gap-1.5">
                  <div><label className={labelCls}>Modèle</label><input value={eModele} onChange={e => setEModele(e.target.value)} className={inputCls} /></div>
                  <div><label className={labelCls}>Marque / Fabricant</label><input value={eMarque} onChange={e => setEMarque(e.target.value)} className={inputCls} placeholder="ex: Atlas Copco" /></div>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div><label className={labelCls}>N° Série</label><input value={eSerie} onChange={e => setESerie(e.target.value)} className={inputCls} /></div>
                  <div><label className={labelCls}>Classe IEC</label>
                    <select value={eClasse} onChange={e => setEClasse(e.target.value)} className={inputCls}>
                      <option value="">—</option>{CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div><label className={labelCls}>Service</label><input value={eService} onChange={e => setEService(e.target.value)} className={inputCls} /></div>
                  <div><label className={labelCls}>Localisation</label><input value={eLocalisation} onChange={e => setELocalisation(e.target.value)} className={inputCls} /></div>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div><label className={labelCls}>Date install.</label><input type="date" value={eDateInstall} onChange={e => setEDateInstall(e.target.value)} className={inputCls} /></div>
                  <div><label className={labelCls}>Prochaine PMS</label><input type="date" value={ePms} onChange={e => setEPms(e.target.value)} className={inputCls} /></div>
                </div>
                <div><label className={labelCls}>Fournisseur</label><input value={eFournisseur} onChange={e => setEFournisseur(e.target.value)} className={inputCls} /></div>
                <button onClick={saveInfos} className={btnSm + " self-start mt-1"} style={{ backgroundColor: "#15803d", color: "#fff" }}>Sauvegarder infos</button>
              </div>
            </div>

            <hr className="border-orange-200" />

            {/* Add historique */}
            <div>
              <p className="text-xs font-bold text-orange-700 mb-2">Ajouter entrée historique</p>
              <div className="flex flex-col gap-1.5">
                <div><label className={labelCls}>Date</label><input type="date" value={hDate} onChange={e => setHDate(e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>Type</label>
                  <select value={hType} onChange={e => setHType(e.target.value as HistoriqueEntry["type"])} className={inputCls}>
                    {HISTO_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div><label className={labelCls}>Description</label><textarea value={hDesc} onChange={e => setHDesc(e.target.value)} className={inputCls} rows={2} /></div>
                <div><label className={labelCls}>Technicien</label><input value={hTech} onChange={e => setHTech(e.target.value)} className={inputCls} placeholder="Nom prénom" /></div>
                <div><label className={labelCls}>Pièces (virgule)</label><input value={hPieces} onChange={e => setHPieces(e.target.value)} className={inputCls} placeholder="ex: Filtre A, Joint B" /></div>
                <button onClick={addHisto} className={btnSm} style={{ backgroundColor: "#3b82f6", color: "#fff" }}>+ Ajouter</button>
              </div>
            </div>

            <hr className="border-orange-200" />

            {/* Add piece */}
            <div>
              <p className="text-xs font-bold text-orange-700 mb-2">Ajouter pièce nécessaire</p>
              <div className="flex flex-col gap-1.5">
                <div className="grid grid-cols-2 gap-1.5">
                  <div><label className={labelCls}>Référence</label><input value={pRef} onChange={e => setPRef(e.target.value)} className={inputCls} placeholder="REF-001" /></div>
                  <div><label className={labelCls}>Qté</label><input type="number" min="1" value={pQte} onChange={e => setPQte(e.target.value)} className={inputCls} /></div>
                </div>
                <div><label className={labelCls}>Désignation</label><input value={pDesig} onChange={e => setPDesig(e.target.value)} className={inputCls} placeholder="Nom de la pièce" /></div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div><label className={labelCls}>Prix unit. (€)</label><input type="number" value={pPrix} onChange={e => setPPrix(e.target.value)} className={inputCls} /></div>
                  <div><label className={labelCls}>Urgence</label>
                    <select value={pUrg} onChange={e => setPUrg(e.target.value as Piece["urgence"])} className={inputCls}>
                      <option value="critique">Critique</option><option value="normale">Normale</option><option value="basse">Basse</option>
                    </select>
                  </div>
                </div>
                <div><label className={labelCls}>Fournisseur</label><input value={pFour} onChange={e => setPFour(e.target.value)} className={inputCls} placeholder="Optionnel" /></div>
                <button onClick={addPiece} className={btnSm} style={{ backgroundColor: "#3b82f6", color: "#fff" }}>+ Ajouter pièce</button>
              </div>
            </div>

            <hr className="border-orange-200" />

            {/* Add kit */}
            <div>
              <p className="text-xs font-bold text-orange-700 mb-2">Ajouter kit de maintenance</p>
              <div className="flex flex-col gap-1.5">
                <div className="grid grid-cols-2 gap-1.5">
                  <div><label className={labelCls}>Référence</label><input value={kRef} onChange={e => setKRef(e.target.value)} className={inputCls} placeholder="KIT-001" /></div>
                  <div><label className={labelCls}>Qté</label><input type="number" min="1" value={kQte} onChange={e => setKQte(e.target.value)} className={inputCls} /></div>
                </div>
                <div><label className={labelCls}>Désignation</label><input value={kDesig} onChange={e => setKDesig(e.target.value)} className={inputCls} placeholder="Nom du kit" /></div>
                <div><label className={labelCls}>Contenu</label><textarea value={kContenu} onChange={e => setKContenu(e.target.value)} className={inputCls} rows={2} placeholder="ex: filtre, joint, courroie..." /></div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div><label className={labelCls}>Prix unit. (€)</label><input type="number" value={kPrix} onChange={e => setKPrix(e.target.value)} className={inputCls} /></div>
                  <div><label className={labelCls}>Périodicité</label>
                    <select value={kPeriod} onChange={e => setKPeriod(e.target.value as Kit["periodicite"])} className={inputCls}>
                      {KIT_PERIODICITE.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div><label className={labelCls}>Fournisseur</label><input value={kFour} onChange={e => setKFour(e.target.value)} className={inputCls} placeholder="Optionnel" /></div>
                  <div><label className={labelCls}>Dernier utilisé</label><input type="date" value={kDernier} onChange={e => setKDernier(e.target.value)} className={inputCls} /></div>
                </div>
                <button onClick={addKit} className={btnSm} style={{ backgroundColor: "#8b5cf6", color: "#fff" }}>+ Ajouter kit</button>
              </div>
            </div>

            <button onClick={() => setEditing(false)} className={btnSm + " self-start text-slate-500 mt-1"}>Fermer l’édition</button>
          </div>
        ) : null}

        {/* Details tab */}
        {tab === "details" ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
            {[["Marque / Fabricant", dm.marque ?? "—"], ["N° Série", dm.serie], ["Classe IEC", dm.classe ?? "—"], ["Service", dm.service ?? "—"], ["Localisation", dm.localisation ?? "—"], ["Date installation", dm.dateInstall ?? "—"], ["Fournisseur", dm.fournisseur ?? "—"], ["Prochaine PMS", dm.pms], ["Actions ouvertes", String(dm.actions)]].map(([k, v]) => (
              <div key={k}><p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">{k}</p><p className="font-medium text-slate-800">{v}</p></div>
            ))}
          </div>
        ) : null}

        {/* Pannes tab — workflow Signalé → Diagnostiqué → En réparation → Test → Clôturé */}
        {tab === "pannes" ? (
          <PannesPanel dm={dm} pannes={pannes} isAdmin={isAdmin} onAdd={addPanne} onUpdate={updatePanne} onRemove={removePanne} />
        ) : null}

        {/* Historique tab */}
        {tab === "historique" ? (
          <div className="flex flex-col gap-3">
            {dm.historique.length === 0 ? <p className="text-xs text-slate-400 italic">Aucun historique disponible</p> : (
              <>
                <InterventionsTimeline historique={dm.historique} pannes={pannes} />
                <div className="flex flex-col gap-2">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Détail des interventions</p>
                  {[...dm.historique].sort((a, b) => b.date.localeCompare(a.date)).map(h => (
                    <div key={h.id} className="rounded-lg border border-slate-100 bg-slate-50 p-2.5 relative">
                      {isAdmin && (
                        <button onClick={() => removeHisto(h.id)} className="absolute top-1.5 right-1.5 text-red-400 hover:text-red-600 text-xs leading-none" title="Supprimer">✕</button>
                      )}
                      <div className="flex items-center justify-between mb-1 pr-4">
                        <span className="text-[10px] font-bold text-slate-500">{h.date}</span>
                        <span className="text-[10px] rounded-full px-1.5 py-0.5 bg-blue-100 text-blue-700 font-semibold">{h.type}</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">{h.description}</p>
                      <p className="text-[10px] text-slate-400 mt-1">Technicien : {h.technicien}</p>
                      {h.pieces.length > 0 ? <p className="text-[10px] text-slate-500 mt-0.5">Pièces : {h.pieces.join(", ")}</p> : null}
                      {(h.dureeHeures || h.coutTotal) ? (
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {h.dureeHeures ? <>Durée : <strong>{fmtHeures(h.dureeHeures)}</strong></> : null}
                          {h.dureeHeures && h.coutTotal ? " · " : ""}
                          {h.coutTotal ? <>Coût : <strong>{fmtEur(h.coutTotal)}</strong></> : null}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : null}

        {/* Pieces tab */}
        {tab === "pieces" ? (
          <div className="flex flex-col gap-2">
            {dm.pieces.length === 0 ? <p className="text-xs text-slate-400 italic">Aucune pièce nécessaire</p> : null}
            {dm.pieces.map(p => {
              const us = urgenceStyle(p.urgence);
              const isEdit = editingPieceId === p.id;
              if (isEdit && isAdmin) {
                return (
                  <div key={p.id} className="rounded-lg border border-orange-300 bg-orange-50 p-2.5 flex flex-col gap-1.5">
                    <div className="grid grid-cols-2 gap-1.5">
                      <div><label className={labelCls}>Réf.</label><input value={p.reference} onChange={e => updatePiece(p.id, { reference: e.target.value })} className={inputCls} /></div>
                      <div><label className={labelCls}>Qté</label><input type="number" value={p.qte} onChange={e => updatePiece(p.id, { qte: parseInt(e.target.value) || 1 })} className={inputCls} /></div>
                    </div>
                    <div><label className={labelCls}>Désignation</label><input value={p.designation} onChange={e => updatePiece(p.id, { designation: e.target.value })} className={inputCls} /></div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <div><label className={labelCls}>Prix (€)</label><input type="number" value={p.prixUnit} onChange={e => updatePiece(p.id, { prixUnit: parseFloat(e.target.value) || 0 })} className={inputCls} /></div>
                      <div><label className={labelCls}>Urgence</label>
                        <select value={p.urgence} onChange={e => updatePiece(p.id, { urgence: e.target.value as Piece["urgence"] })} className={inputCls}>
                          <option value="critique">Critique</option><option value="normale">Normale</option><option value="basse">Basse</option>
                        </select>
                      </div>
                    </div>
                    <div><label className={labelCls}>Fournisseur</label><input value={p.fournisseur ?? ""} onChange={e => updatePiece(p.id, { fournisseur: e.target.value || undefined })} className={inputCls} /></div>
                    <div className="flex gap-1.5 mt-1">
                      <button onClick={() => setEditingPieceId(null)} className={btnSm} style={{ backgroundColor: "#15803d", color: "#fff" }}>OK</button>
                      <button onClick={() => { removePiece(p.id); setEditingPieceId(null); }} className={btnSm} style={{ backgroundColor: "#ef4444", color: "#fff" }}>Supprimer</button>
                    </div>
                  </div>
                );
              }
              return (
                <div key={p.id} className="rounded-lg border border-slate-100 bg-slate-50 p-2.5">
                  <div className="flex items-start justify-between gap-1">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-mono text-slate-500">{p.reference}</span>
                        <span className="text-[10px] rounded-full px-1.5 py-0.5 font-semibold" style={{ backgroundColor: us.bg, color: us.text, border: `1px solid ${us.border}` }}>{p.urgence}</span>
                        {p.fournisseur ? <span className="text-[9px] text-slate-400">· {p.fournisseur}</span> : null}
                      </div>
                      <p className="text-xs font-semibold text-slate-800 mt-0.5">{p.designation}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Qté {p.qte} × {fmtEur(p.prixUnit)} = <strong>{fmtEur(p.qte * p.prixUnit)}</strong></p>
                    </div>
                    {isAdmin ? (
                      <div className="flex gap-1 shrink-0">
                        <IconButton title="Modifier la pièce" onClick={() => setEditingPieceId(p.id)} variant="edit"><IconPencil /></IconButton>
                        <IconButton title="Supprimer la pièce" onClick={() => { if (window.confirm("Supprimer la pièce « " + p.designation + " » ?")) removePiece(p.id); }} variant="danger"><IconTrash /></IconButton>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
            {dm.pieces.length > 0 ? (
              <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Total estimé</span>
                <span className="text-sm font-bold text-slate-900">{fmtEur(totalCost)}</span>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Kits tab */}
        {tab === "kits" ? (
          <div className="flex flex-col gap-2">
            {kits.length === 0 ? <p className="text-xs text-slate-400 italic">Aucun kit de maintenance enregistré</p> : null}
            {kits.map(k => {
              const ps = periodStyle(k.periodicite);
              const isEdit = editingKitId === k.id;
              if (isEdit && isAdmin) {
                return (
                  <div key={k.id} className="rounded-lg border border-purple-300 bg-purple-50 p-2.5 flex flex-col gap-1.5">
                    <div className="grid grid-cols-2 gap-1.5">
                      <div><label className={labelCls}>Réf.</label><input value={k.reference} onChange={e => updateKit(k.id, { reference: e.target.value })} className={inputCls} /></div>
                      <div><label className={labelCls}>Qté</label><input type="number" value={k.qte} onChange={e => updateKit(k.id, { qte: parseInt(e.target.value) || 1 })} className={inputCls} /></div>
                    </div>
                    <div><label className={labelCls}>Désignation</label><input value={k.designation} onChange={e => updateKit(k.id, { designation: e.target.value })} className={inputCls} /></div>
                    <div><label className={labelCls}>Contenu</label><textarea value={k.contenu} onChange={e => updateKit(k.id, { contenu: e.target.value })} className={inputCls} rows={2} /></div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <div><label className={labelCls}>Prix (€)</label><input type="number" value={k.prixUnit} onChange={e => updateKit(k.id, { prixUnit: parseFloat(e.target.value) || 0 })} className={inputCls} /></div>
                      <div><label className={labelCls}>Périodicité</label>
                        <select value={k.periodicite} onChange={e => updateKit(k.id, { periodicite: e.target.value as Kit["periodicite"] })} className={inputCls}>
                          {KIT_PERIODICITE.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <div><label className={labelCls}>Fournisseur</label><input value={k.fournisseur ?? ""} onChange={e => updateKit(k.id, { fournisseur: e.target.value || undefined })} className={inputCls} /></div>
                      <div><label className={labelCls}>Dernier utilisé</label><input type="date" value={k.dernierUtilise ?? ""} onChange={e => updateKit(k.id, { dernierUtilise: e.target.value || undefined })} className={inputCls} /></div>
                    </div>
                    <div className="flex gap-1.5 mt-1">
                      <button onClick={() => setEditingKitId(null)} className={btnSm} style={{ backgroundColor: "#15803d", color: "#fff" }}>OK</button>
                      <button onClick={() => { removeKit(k.id); setEditingKitId(null); }} className={btnSm} style={{ backgroundColor: "#ef4444", color: "#fff" }}>Supprimer</button>
                    </div>
                  </div>
                );
              }
              return (
                <div key={k.id} className="rounded-lg border border-slate-100 bg-purple-50/40 p-2.5">
                  <div className="flex items-start justify-between gap-1">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-mono text-slate-500">{k.reference}</span>
                        <span className="text-[10px] rounded-full px-1.5 py-0.5 font-semibold" style={{ backgroundColor: ps.bg, color: ps.text, border: `1px solid ${ps.border}` }}>{k.periodicite}</span>
                        {k.fournisseur ? <span className="text-[9px] text-slate-400">· {k.fournisseur}</span> : null}
                      </div>
                      <p className="text-xs font-semibold text-slate-800 mt-0.5">{k.designation}</p>
                      {k.contenu ? <p className="text-[11px] text-slate-600 mt-0.5 italic">{k.contenu}</p> : null}
                      <p className="text-xs text-slate-500 mt-0.5">Qté {k.qte} × {fmtEur(k.prixUnit)} = <strong>{fmtEur(k.qte * k.prixUnit)}</strong></p>
                      {k.dernierUtilise ? <p className="text-[10px] text-slate-400 mt-0.5">Dernier usage : {k.dernierUtilise}</p> : null}
                    </div>
                    {isAdmin ? (
                      <div className="flex gap-1 shrink-0">
                        <IconButton title="Modifier le kit" onClick={() => setEditingKitId(k.id)} variant="edit"><IconPencil /></IconButton>
                        <IconButton title="Supprimer le kit" onClick={() => { if (window.confirm("Supprimer le kit « " + k.designation + " » ?")) removeKit(k.id); }} variant="danger"><IconTrash /></IconButton>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
            {kits.length > 0 ? (
              <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Total kits</span>
                <span className="text-sm font-bold text-slate-900">{fmtEur(totalKitCost)}</span>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* ── Right Panel shell ── */
function RightPanel({ dm, isAdmin, onClose, onUpdate, onDelete }: {
  dm: DM | null; isAdmin: boolean; onClose: () => void; onUpdate: (dm: DM) => void; onDelete: () => void;
}) {
  if (!dm) return (
    <div className="flex flex-1 flex-col items-center justify-center text-center px-6 py-8">
      <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>{"🔬"}</div>
      <p className="text-sm font-semibold text-slate-600 mb-1">Aucun équipement sélectionné</p>
      <p className="text-xs text-slate-400 leading-relaxed">Cliquez sur une ligne du tableau ou un nœud du graphe</p>
    </div>
  );
  return <RightPanelContent key={dm.id} dm={dm} isAdmin={isAdmin} onClose={onClose} onUpdate={onUpdate} onDelete={onDelete} />;
}

/* ── Add DM Form ── */
function AddDMForm({ onAdd, onCancel }: { onAdd: (dm: DM) => void; onCancel: () => void }) {
  const [modele, setModele] = useState(""); const [marque, setMarque] = useState(""); const [serie, setSerie] = useState("");
  const [classe, setClasse] = useState("IIa"); const [service, setService] = useState("");
  const [localisation, setLocalisation] = useState(""); const [statut, setStatut] = useState<Statut>("Fonctionnel");
  const [pms, setPms] = useState(""); const [dateInstall, setDateInstall] = useState(""); const [fournisseur, setFournisseur] = useState("");

  function submit() {
    if (!modele) return;
    onAdd({ id: uid(), modele, marque: marque || undefined, serie: serie || "—", statut, pms: pms || "—", actions: 0, classe, service: service || undefined, localisation: localisation || undefined, dateInstall: dateInstall || undefined, fournisseur: fournisseur || undefined, historique: [], pieces: [], kits: [] });
  }

  return (
    <div className="rounded-xl border-2 border-dashed border-orange-300 bg-orange-50 p-4 flex flex-col gap-2">
      <p className="text-sm font-bold text-orange-700 mb-1">Ajouter un équipement</p>
      <div className="grid grid-cols-2 gap-2">
        <div><label className={labelCls}>Modèle *</label><input value={modele} onChange={e => setModele(e.target.value)} className={inputCls} placeholder="Nom du modèle" /></div>
        <div><label className={labelCls}>Marque / Fabricant</label><input value={marque} onChange={e => setMarque(e.target.value)} className={inputCls} placeholder="ex: Atlas Copco" /></div>
        <div><label className={labelCls}>N° Série</label><input value={serie} onChange={e => setSerie(e.target.value)} className={inputCls} /></div>
        <div><label className={labelCls}>Statut</label>
          <select value={statut} onChange={e => setStatut(e.target.value as Statut)} className={inputCls}>
            {STATUTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div><label className={labelCls}>Classe IEC</label>
          <select value={classe} onChange={e => setClasse(e.target.value)} className={inputCls}>
            {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div><label className={labelCls}>Service</label><input value={service} onChange={e => setService(e.target.value)} className={inputCls} /></div>
        <div><label className={labelCls}>Localisation</label><input value={localisation} onChange={e => setLocalisation(e.target.value)} className={inputCls} /></div>
        <div><label className={labelCls}>Date install.</label><input type="date" value={dateInstall} onChange={e => setDateInstall(e.target.value)} className={inputCls} /></div>
        <div><label className={labelCls}>Prochaine PMS</label><input type="date" value={pms} onChange={e => setPms(e.target.value)} className={inputCls} /></div>
      </div>
      <div><label className={labelCls}>Fournisseur</label><input value={fournisseur} onChange={e => setFournisseur(e.target.value)} className={inputCls} /></div>
      <div className="flex gap-2 mt-1">
        <button onClick={submit} className={btnSm} style={{ backgroundColor: "#15803d", color: "#fff" }}>Créer</button>
        <button onClick={onCancel} className={btnSm + " text-slate-500"}>Annuler</button>
      </div>
    </div>
  );
}

/* ── Counts helper ── */
function countStatuts(dms: DM[]) {
  let fonct = 0, hs = 0, att = 0, inut = 0;
  for (const d of dms) {
    if (d.statut === "Fonctionnel") fonct++;
    else if (d.statut === "Hors service") hs++;
    else if (d.statut === "En attente") att++;
    else inut++;
  }
  return { fonct, hs, att, inut };
}

/* ── Plan d'actions View ── */
function PlanActionView({ allData, isAdmin }: { allData: Record<SiteKey, SiteData>; isAdmin: boolean }) {
  // Aggregate per site per DM: pieces critiques + kits + statut
  const sitePlans = useMemo(() => {
    return SITE_KEYS.map(sk => {
      const dms = allData[sk].dms;
      let sitePiecesCost = 0, siteKitsCost = 0;
      const dmPlans = dms.map(dm => {
        const critiques = dm.pieces.filter(p => p.urgence === "critique");
        const normales = dm.pieces.filter(p => p.urgence === "normale");
        const kits = dm.kits ?? [];
        const pieceCost = dm.pieces.reduce((a, p) => a + p.qte * p.prixUnit, 0);
        const kitCost = kits.reduce((a, k) => a + k.qte * k.prixUnit, 0);
        sitePiecesCost += pieceCost;
        siteKitsCost += kitCost;
        return { dm, critiques, normales, kits, pieceCost, kitCost, total: pieceCost + kitCost };
      });
      return { sk, dms: dmPlans, sitePiecesCost, siteKitsCost, siteTotal: sitePiecesCost + siteKitsCost };
    });
  }, [allData]);

  const grandTotal = sitePlans.reduce((a, s) => a + s.siteTotal, 0);
  const grandPieces = sitePlans.reduce((a, s) => a + s.sitePiecesCost, 0);
  const grandKits = sitePlans.reduce((a, s) => a + s.siteKitsCost, 0);

  const kpis = [
    { label: "Budget total", value: fmtEur(grandTotal), color: "#0a2540" },
    { label: "Pièces détachées", value: fmtEur(grandPieces), color: "#f97316" },
    { label: "Kits maintenance", value: fmtEur(grandKits), color: "#8b5cf6" },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        {kpis.map(k => (
          <div key={k.label} className="rounded-xl bg-white border border-slate-100 shadow-sm px-5 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{k.label}</p>
            <p className="mt-1 text-2xl font-bold" style={{ color: k.color }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Per site */}
      {sitePlans.map(({ sk, dms, siteTotal }) => (
        <div key={sk} className="rounded-xl bg-white border border-slate-100 shadow-sm overflow-hidden">
          {/* Site header */}
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between" style={{ backgroundColor: "#f8faff" }}>
            <div className="flex items-center gap-3">
              <span className="rounded-lg px-2.5 py-1 text-xs font-bold text-white" style={{ backgroundColor: "#0a2540" }}>{sk}</span>
              <p className="text-sm font-bold text-slate-800">Plan d’actions de maintenance</p>
            </div>
            <p className="text-sm font-bold" style={{ color: "#0a2540" }}>{fmtEur(siteTotal)} estimé</p>
          </div>

          {/* Equipment rows */}
          <div className="divide-y divide-slate-50">
            {dms.length === 0 && <p className="text-xs text-slate-400 italic px-5 py-4">Aucun équipement enregistré</p>}
            {dms.map(({ dm, critiques, normales, kits, pieceCost, kitCost, total }) => {
              const needsAction = dm.statut !== "Fonctionnel" || critiques.length > 0 || kits.length > 0;
              const ss = statutStyle(dm.statut);
              return (
                <div key={dm.id} className="px-5 py-4">
                  {/* DM header row */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs font-bold text-slate-800">{dm.modele}</p>
                        {dm.marque && <span className="text-[10px] text-slate-400">{dm.marque}</span>}
                        <span className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: ss.bg, color: ss.text, border: `1px solid ${ss.border}` }}>{dm.statut}</span>
                      </div>
                      <p className="text-[10px] text-slate-400">N° {dm.serie} {dm.service ? "· " + dm.service : ""} {dm.pms !== "—" ? "· PMS : " + dm.pms : ""}</p>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-sm font-bold text-slate-800">{fmtEur(total)}</p>
                      <p className="text-[10px] text-slate-400">budget équipement</p>
                    </div>
                  </div>

                  {/* Statut alert */}
                  {dm.statut === "Hors service" && (
                    <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 mb-2 flex items-center gap-2">
                      <span className="text-red-500 font-bold text-xs">!</span>
                      <p className="text-xs text-red-700 font-semibold">Action corrective urgente — équipement hors service</p>
                    </div>
                  )}
                  {dm.statut === "En attente" && (
                    <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 mb-2 flex items-center gap-2">
                      <span className="text-amber-500 font-bold text-xs">⚠</span>
                      <p className="text-xs text-amber-700 font-semibold">En attente d’intervention — vérifier les dépendances</p>
                    </div>
                  )}

                  {/* Pièces critiques */}
                  {critiques.length > 0 && (
                    <div className="mb-2">
                      <p className="text-[10px] font-bold text-red-600 uppercase tracking-wide mb-1">Pièces critiques à commander ({critiques.length})</p>
                      <div className="rounded-lg border border-red-100 overflow-hidden">
                        <table className="w-full text-xs">
                          <thead><tr className="bg-red-50">
                            <th className="px-3 py-1.5 text-left text-[10px] font-semibold text-red-400 uppercase">Référence</th>
                            <th className="px-3 py-1.5 text-left text-[10px] font-semibold text-red-400 uppercase">Désignation</th>
                            <th className="px-3 py-1.5 text-center text-[10px] font-semibold text-red-400 uppercase">Qté</th>
                            <th className="px-3 py-1.5 text-right text-[10px] font-semibold text-red-400 uppercase">Total</th>
                          </tr></thead>
                          <tbody>
                            {critiques.map(p => (
                              <tr key={p.id} className="border-t border-red-50">
                                <td className="px-3 py-1.5 font-mono text-slate-500">{p.reference}</td>
                                <td className="px-3 py-1.5 text-slate-700">{p.designation}</td>
                                <td className="px-3 py-1.5 text-center">{p.qte}</td>
                                <td className="px-3 py-1.5 text-right font-semibold text-slate-800">{fmtEur(p.qte * p.prixUnit)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Pièces normales */}
                  {normales.length > 0 && (
                    <div className="mb-2">
                      <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wide mb-1">Pièces à prévoir ({normales.length})</p>
                      <div className="rounded-lg border border-orange-100 overflow-hidden">
                        <table className="w-full text-xs">
                          <thead><tr className="bg-orange-50">
                            <th className="px-3 py-1.5 text-left text-[10px] font-semibold text-orange-400 uppercase">Référence</th>
                            <th className="px-3 py-1.5 text-left text-[10px] font-semibold text-orange-400 uppercase">Désignation</th>
                            <th className="px-3 py-1.5 text-center text-[10px] font-semibold text-orange-400 uppercase">Qté</th>
                            <th className="px-3 py-1.5 text-right text-[10px] font-semibold text-orange-400 uppercase">Total</th>
                          </tr></thead>
                          <tbody>
                            {normales.map(p => (
                              <tr key={p.id} className="border-t border-orange-50">
                                <td className="px-3 py-1.5 font-mono text-slate-500">{p.reference}</td>
                                <td className="px-3 py-1.5 text-slate-700">{p.designation}</td>
                                <td className="px-3 py-1.5 text-center">{p.qte}</td>
                                <td className="px-3 py-1.5 text-right font-semibold text-slate-800">{fmtEur(p.qte * p.prixUnit)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Kits de maintenance */}
                  {kits.length > 0 && (
                    <div className="mb-2">
                      <p className="text-[10px] font-bold text-purple-600 uppercase tracking-wide mb-1">Kits de maintenance ({kits.length})</p>
                      <div className="rounded-lg border border-purple-100 overflow-hidden">
                        <table className="w-full text-xs">
                          <thead><tr className="bg-purple-50">
                            <th className="px-3 py-1.5 text-left text-[10px] font-semibold text-purple-400 uppercase">Référence</th>
                            <th className="px-3 py-1.5 text-left text-[10px] font-semibold text-purple-400 uppercase">Désignation</th>
                            <th className="px-3 py-1.5 text-left text-[10px] font-semibold text-purple-400 uppercase">Périodicité</th>
                            <th className="px-3 py-1.5 text-center text-[10px] font-semibold text-purple-400 uppercase">Qté</th>
                            <th className="px-3 py-1.5 text-right text-[10px] font-semibold text-purple-400 uppercase">Total</th>
                          </tr></thead>
                          <tbody>
                            {kits.map(k => {
                              const ps = periodStyle(k.periodicite);
                              return (
                                <tr key={k.id} className="border-t border-purple-50">
                                  <td className="px-3 py-1.5 font-mono text-slate-500">{k.reference}</td>
                                  <td className="px-3 py-1.5 text-slate-700">{k.designation}</td>
                                  <td className="px-3 py-1.5"><span className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: ps.bg, color: ps.text, border: `1px solid ${ps.border}` }}>{k.periodicite}</span></td>
                                  <td className="px-3 py-1.5 text-center">{k.qte}</td>
                                  <td className="px-3 py-1.5 text-right font-semibold text-slate-800">{fmtEur(k.qte * k.prixUnit)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* No action */}
                  {!needsAction && dm.pieces.length === 0 && (
                    <p className="text-xs text-green-600 italic">Aucune action requise — équipement fonctionnel sans pièces en attente</p>
                  )}

                  {/* Sub-total */}
                  {total > 0 && (
                    <div className="mt-2 flex justify-end">
                      <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs flex items-center gap-3">
                        <span className="text-slate-500">Pièces : <span className="font-semibold text-slate-700">{fmtEur(pieceCost)}</span></span>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-500">Kits : <span className="font-semibold text-slate-700">{fmtEur(kitCost)}</span></span>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-700 font-bold">Total : {fmtEur(total)}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Site footer */}
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
            <p className="text-xs text-slate-500">{dms.length} équipement(s) · {dms.filter(d => d.critiques.length > 0).length} avec pièce(s) critique(s)</p>
            <p className="text-sm font-bold text-slate-800">Budget site : {fmtEur(siteTotal)}</p>
          </div>
        </div>
      ))}

      {/* Grand total banner */}
      <div className="rounded-xl px-5 py-4 flex items-center justify-between" style={{ background: "linear-gradient(135deg,#0a2540 0%,#1e3a5f 100%)" }}>
        <div>
          <p className="text-xs font-semibold text-blue-200 uppercase tracking-widest mb-0.5">Budget global maintenance — 3 sites</p>
          <p className="text-[10px] text-blue-300">Pièces détachées + Kits de maintenance</p>
        </div>
        <p className="text-2xl font-bold text-white">{fmtEur(grandTotal)}</p>
      </div>
    </div>
  );
}

/* ── Contrats & Garanties View (Lot 3) ── */
function ContratView({ contrats, isAdmin, onAdd, onUpdate, onDelete }: {
  contrats: ContratPartage[]; isAdmin: boolean;
  onAdd: (c: ContratPartage) => void; onUpdate: (c: ContratPartage) => void; onDelete: (id: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editContrat, setEditContrat] = useState<ContratPartage | null>(null);
  const [filterType, setFilterType] = useState<ContratType | "">("");
  const [filterSite, setFilterSite] = useState<SiteKey | "">("");
  const [search, setSearch] = useState("");

  const [fTitre, setFTitre] = useState(""); const [fFour, setFFour] = useState("");
  const [fType, setFType] = useState<ContratType>("Maintenance");
  const [fSites, setFSites] = useState<SiteKey[]>([]);
  const [fDebut, setFDebut] = useState(""); const [fFin, setFFin] = useState("");
  const [fMontant, setFMontant] = useState(""); const [fContact, setFContact] = useState(""); const [fNotes, setFNotes] = useState("");

  function openAdd() {
    setEditContrat(null);
    setFTitre(""); setFFour(""); setFType("Maintenance"); setFSites([]); setFDebut(""); setFFin(""); setFMontant(""); setFContact(""); setFNotes("");
    setShowForm(true);
  }
  function openEdit(c: ContratPartage) {
    setEditContrat(c);
    setFTitre(c.titre); setFFour(c.fournisseur); setFType(c.type); setFSites(c.sites);
    setFDebut(c.dateDebut); setFFin(c.dateFin);
    setFMontant(c.montant ? String(c.montant) : ""); setFContact(c.contact ?? ""); setFNotes(c.notes ?? "");
    setShowForm(true);
  }
  function toggleSite(sk: SiteKey) { setFSites(prev => prev.includes(sk) ? prev.filter(s => s !== sk) : [...prev, sk]); }
  function handleSave() {
    if (!fTitre.trim() || !fFin) return;
    const base = { titre: fTitre.trim(), fournisseur: fFour.trim(), type: fType, sites: fSites.length ? fSites : [...SITE_KEYS],
      dateDebut: fDebut, dateFin: fFin, montant: fMontant ? parseFloat(fMontant) : undefined,
      contact: fContact || undefined, notes: fNotes || undefined };
    if (editContrat) onUpdate({ ...editContrat, ...base });
    else onAdd({ id: uid(), ...base, createdAt: new Date().toISOString() });
    setShowForm(false);
  }

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const filtered = useMemo(() => contrats.filter(c => {
    if (filterType && c.type !== filterType) return false;
    if (filterSite && !c.sites.includes(filterSite)) return false;
    if (search && !c.titre.toLowerCase().includes(search.toLowerCase()) && !c.fournisseur.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [contrats, filterType, filterSite, search]);

  const kpis = useMemo(() => {
    const actifs = contrats.filter(c => new Date(c.dateFin) >= today).length;
    const expires30 = contrats.filter(c => { const d = new Date(c.dateFin); return d >= today && Math.round((d.getTime() - today.getTime()) / 86400000) <= 30; }).length;
    const expires90 = contrats.filter(c => { const d = new Date(c.dateFin); return d >= today && Math.round((d.getTime() - today.getTime()) / 86400000) <= 90; }).length;
    const montantTotal = contrats.reduce((a, c) => a + (c.montant ?? 0), 0);
    return { total: contrats.length, actifs, expires30, expires90, montantTotal };
  }, [contrats]);

  return (
    <div className="flex flex-col gap-4">
      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-sm font-bold text-slate-800 mb-4">{editContrat ? "Modifier le contrat" : "Nouveau contrat / garantie"}</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><label className={labelCls}>Titre *</label><input className={inputCls} value={fTitre} onChange={e => setFTitre(e.target.value)} placeholder="Nom du contrat" /></div>
              <div><label className={labelCls}>Fournisseur</label><input className={inputCls} value={fFour} onChange={e => setFFour(e.target.value)} placeholder="Nom du fournisseur" /></div>
              <div><label className={labelCls}>Type</label>
                <select className={inputCls} value={fType} onChange={e => setFType(e.target.value as ContratType)}>
                  {CONTRAT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div><label className={labelCls}>Date début</label><input type="date" className={inputCls} value={fDebut} onChange={e => setFDebut(e.target.value)} /></div>
              <div><label className={labelCls}>Date fin *</label><input type="date" className={inputCls} value={fFin} onChange={e => setFFin(e.target.value)} /></div>
              <div><label className={labelCls}>Montant (€)</label><input type="number" className={inputCls} value={fMontant} onChange={e => setFMontant(e.target.value)} placeholder="0" /></div>
              <div><label className={labelCls}>Contact</label><input className={inputCls} value={fContact} onChange={e => setFContact(e.target.value)} placeholder="Nom / email / tél" /></div>
              <div className="col-span-2">
                <label className={labelCls}>Sites couverts</label>
                <div className="flex gap-2 mt-1">
                  {SITE_KEYS.map(sk => (
                    <button key={sk} type="button" onClick={() => toggleSite(sk)}
                      className="rounded-lg px-3 py-1.5 text-xs font-bold transition-colors"
                      style={{ backgroundColor: fSites.includes(sk) ? "#0a2540" : "#f1f5f9", color: fSites.includes(sk) ? "#fff" : "#64748b" }}>
                      {sk}
                    </button>
                  ))}
                  <span className="text-[10px] text-slate-400 self-center ml-1">(vide = tous)</span>
                </div>
              </div>
              <div className="col-span-2"><label className={labelCls}>Notes</label><textarea className={inputCls} rows={2} value={fNotes} onChange={e => setFNotes(e.target.value)} placeholder="Remarques, conditions particulières..." /></div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button className={btnSm + " bg-slate-100 text-slate-700"} onClick={() => setShowForm(false)}>Annuler</button>
              <button className={btnSm + " bg-blue-600 text-white"} onClick={handleSave} disabled={!fTitre.trim() || !fFin}>
                {editContrat ? "Enregistrer" : "Créer le contrat"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { label: "Total contrats", value: String(kpis.total), color: "#3b82f6" },
          { label: "Actifs", value: String(kpis.actifs), color: "#22c55e" },
          { label: "Expirent ≤ 30j", value: String(kpis.expires30), color: "#dc2626" },
          { label: "Expirent ≤ 90j", value: String(kpis.expires90), color: "#f59e0b" },
          { label: "Valeur totale", value: fmtEur(kpis.montantTotal), color: "#8b5cf6" },
        ].map(k => (
          <div key={k.label} className="rounded-xl bg-white border border-slate-100 shadow-sm px-4 py-2.5 flex flex-col">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{k.label}</p>
            <p className="text-xl font-bold mt-0.5" style={{ color: k.color }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-2">
        <input className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400 w-44" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs focus:outline-none" value={filterType} onChange={e => setFilterType(e.target.value as ContratType | "")}>
          <option value="">Tous types</option>
          {CONTRAT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs focus:outline-none" value={filterSite} onChange={e => setFilterSite(e.target.value as SiteKey | "")}>
          <option value="">Tous sites</option>
          {SITE_KEYS.map(sk => <option key={sk} value={sk}>{sk}</option>)}
        </select>
        {isAdmin && (
          <button onClick={openAdd} className="rounded-lg px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 ml-auto" style={{ backgroundColor: "#1d4ed8", color: "#fff" }}>
            <IconPlus /> Nouveau contrat
          </button>
        )}
      </div>

      {/* Tableau */}
      <div className="rounded-xl bg-white border border-slate-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-slate-400 text-sm">{contrats.length === 0 ? "Aucun contrat — cliquez sur « Nouveau contrat » pour commencer" : "Aucun résultat"}</p>
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead><tr className="border-b border-slate-100 bg-slate-50">
              {["TITRE", "TYPE", "FOURNISSEUR", "SITES", "FIN DE CONTRAT", "STATUT", "MONTANT", ...(isAdmin ? ["ADMIN"] : [])].map(h => (
                <th key={h} className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-400">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map(c => {
                const st = contratStatut(c.dateFin);
                const ct = contratTypeStyle(c.type);
                const isExpired = new Date(c.dateFin) < today;
                return (
                  <tr key={c.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-2.5">
                      <p className="font-semibold text-slate-800">{c.titre}</p>
                      {c.notes && <p className="text-[10px] text-slate-400 truncate max-w-[180px]">{c.notes}</p>}
                    </td>
                    <td className="px-3 py-2.5"><span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: ct.bg, color: ct.text }}>{c.type}</span></td>
                    <td className="px-3 py-2.5 text-slate-600">{c.fournisseur || "—"}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-wrap gap-0.5">
                        {c.sites.map(s => <span key={s} className="rounded px-1 py-0.5 text-[9px] font-bold text-white" style={{ backgroundColor: "#0a2540" }}>{s}</span>)}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-slate-600" style={{ color: isExpired ? "#dc2626" : undefined }}>{c.dateFin}</td>
                    <td className="px-3 py-2.5"><span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: st.bg, color: st.text, border: `1px solid ${st.border}` }}>{st.label}</span></td>
                    <td className="px-3 py-2.5 text-slate-700 font-semibold">{c.montant ? fmtEur(c.montant) : "—"}</td>
                    {isAdmin && (
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1">
                          <IconButton title="Modifier" onClick={() => openEdit(c)} variant="edit"><IconPencil /></IconButton>
                          <IconButton title="Supprimer" onClick={() => { if (window.confirm("Supprimer ce contrat ?")) onDelete(c.id); }} variant="danger"><IconTrash /></IconButton>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ── Plan d'Actions View (Lot 2) ── */
function ActionsView({ actions, isAdmin, onAdd, onUpdate, onDelete, allData }: {
  actions: ActionItem[]; isAdmin: boolean;
  onAdd: (a: ActionItem) => void; onUpdate: (a: ActionItem) => void; onDelete: (id: string) => void;
  allData: Record<SiteKey, SiteData>;
}) {
  const [viewMode, setViewMode] = useState<ActionViewMode>("liste");
  const [filterStatut, setFilterStatut] = useState<ActionStatut | "">("");
  const [filterSite, setFilterSite] = useState<SiteKey | "">("");
  const [filterResp, setFilterResp] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editAction, setEditAction] = useState<ActionItem | null>(null);

  const [fTitre, setFTitre] = useState(""); const [fDesc, setFDesc] = useState("");
  const [fSite, setFSite] = useState<SiteKey>("BYUMBA");
  const [fResp, setFResp] = useState(""); const [fDateDebut, setFDateDebut] = useState(""); const [fDeadline, setFDeadline] = useState("");
  const [fStatut, setFStatut] = useState<ActionStatut>("À faire");
  const [fBudgetE, setFBudgetE] = useState(""); const [fBudgetR, setFBudgetR] = useState(""); const [fDmId, setFDmId] = useState("");

  function openAdd(defaultStatut?: ActionStatut) {
    setEditAction(null);
    setFTitre(""); setFDesc(""); setFSite("BYUMBA"); setFResp(""); setFDateDebut(""); setFDeadline("");
    setFStatut(defaultStatut ?? "À faire"); setFBudgetE(""); setFBudgetR(""); setFDmId("");
    setShowForm(true);
  }
  function openEdit(a: ActionItem) {
    setEditAction(a);
    setFTitre(a.titre); setFDesc(a.description ?? ""); setFSite(a.site); setFResp(a.responsable ?? "");
    setFDateDebut(a.dateDebut ?? ""); setFDeadline(a.deadline ?? "");
    setFStatut(a.statut); setFBudgetE(a.budgetEstime ? String(a.budgetEstime) : ""); setFBudgetR(a.budgetReel ? String(a.budgetReel) : "");
    setFDmId(a.dmId ?? "");
    setShowForm(true);
  }
  function handleSave() {
    if (!fTitre.trim()) return;
    const dmFound = allData[fSite].dms.find(d => d.id === fDmId);
    if (editAction) {
      onUpdate({ ...editAction, titre: fTitre.trim(), description: fDesc || undefined, site: fSite, responsable: fResp || undefined,
        dateDebut: fDateDebut || undefined, deadline: fDeadline || undefined, statut: fStatut,
        budgetEstime: fBudgetE ? parseFloat(fBudgetE) : undefined, budgetReel: fBudgetR ? parseFloat(fBudgetR) : undefined,
        dmId: fDmId || undefined, dmModele: dmFound?.modele });
    } else {
      onAdd({ id: uid(), titre: fTitre.trim(), description: fDesc || undefined, site: fSite, responsable: fResp || undefined,
        dateDebut: fDateDebut || undefined, deadline: fDeadline || undefined, statut: fStatut,
        budgetEstime: fBudgetE ? parseFloat(fBudgetE) : undefined, budgetReel: fBudgetR ? parseFloat(fBudgetR) : undefined,
        dmId: fDmId || undefined, dmModele: dmFound?.modele, panneId: undefined, createdAt: new Date().toISOString() });
    }
    setShowForm(false);
  }

  const filtered = useMemo(() => actions.filter(a => {
    if (filterStatut && a.statut !== filterStatut) return false;
    if (filterSite && a.site !== filterSite) return false;
    if (filterResp && !a.responsable?.toLowerCase().includes(filterResp.toLowerCase())) return false;
    if (search && !a.titre.toLowerCase().includes(search.toLowerCase()) && !(a.description?.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  }), [actions, filterStatut, filterSite, filterResp, search]);

  const kpiData = useMemo(() => ({
    total: filtered.length,
    afaire: filtered.filter(a => a.statut === "À faire").length,
    encours: filtered.filter(a => a.statut === "En cours").length,
    bloque: filtered.filter(a => a.statut === "Bloqué").length,
    termine: filtered.filter(a => a.statut === "Terminé").length,
    budgetTotal: filtered.reduce((acc, a) => acc + (a.budgetEstime ?? 0), 0),
  }), [filtered]);

  return (
    <div className="flex flex-col gap-4">
      {/* Modal formulaire */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-sm font-bold text-slate-800 mb-4">{editAction ? "Modifier l'action" : "Nouvelle action"}</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><label className={labelCls}>Titre *</label><input className={inputCls} value={fTitre} onChange={e => setFTitre(e.target.value)} placeholder="Titre de l'action" /></div>
              <div className="col-span-2"><label className={labelCls}>Description</label><textarea className={inputCls} rows={2} value={fDesc} onChange={e => setFDesc(e.target.value)} placeholder="Description de l'action" /></div>
              <div><label className={labelCls}>Site</label>
                <select className={inputCls} value={fSite} onChange={e => { setFSite(e.target.value as SiteKey); setFDmId(""); }}>
                  {SITE_KEYS.map(sk => <option key={sk} value={sk}>{sk}</option>)}
                </select>
              </div>
              <div><label className={labelCls}>Équipement lié</label>
                <select className={inputCls} value={fDmId} onChange={e => setFDmId(e.target.value)}>
                  <option value="">— Aucun —</option>
                  {allData[fSite].dms.map(dm => <option key={dm.id} value={dm.id}>{dm.modele}</option>)}
                </select>
              </div>
              <div><label className={labelCls}>Responsable</label><input className={inputCls} value={fResp} onChange={e => setFResp(e.target.value)} placeholder="Nom du responsable" /></div>
              <div><label className={labelCls}>Statut</label>
                <select className={inputCls} value={fStatut} onChange={e => setFStatut(e.target.value as ActionStatut)}>
                  {ACTION_STATUTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div><label className={labelCls}>Date début</label><input type="date" className={inputCls} value={fDateDebut} onChange={e => setFDateDebut(e.target.value)} /></div>
              <div><label className={labelCls}>Échéance</label><input type="date" className={inputCls} value={fDeadline} onChange={e => setFDeadline(e.target.value)} /></div>
              <div><label className={labelCls}>Budget estimé (€)</label><input type="number" className={inputCls} value={fBudgetE} onChange={e => setFBudgetE(e.target.value)} placeholder="0" /></div>
              <div><label className={labelCls}>Budget réel (€)</label><input type="number" className={inputCls} value={fBudgetR} onChange={e => setFBudgetR(e.target.value)} placeholder="0" /></div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button className={btnSm + " bg-slate-100 text-slate-700"} onClick={() => setShowForm(false)}>Annuler</button>
              <button className={btnSm + " bg-blue-600 text-white"} onClick={handleSave} disabled={!fTitre.trim()}>
                {editAction ? "Enregistrer" : "Créer l'action"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {[
          { label: "Total", value: String(kpiData.total), color: "#3b82f6" },
          { label: "À faire", value: String(kpiData.afaire), color: "#94a3b8" },
          { label: "En cours", value: String(kpiData.encours), color: "#3b82f6" },
          { label: "Bloqué", value: String(kpiData.bloque), color: "#ef4444" },
          { label: "Terminé", value: String(kpiData.termine), color: "#22c55e" },
          { label: "Budget estimé", value: fmtEur(kpiData.budgetTotal), color: "#8b5cf6" },
        ].map(k => (
          <div key={k.label} className="rounded-xl bg-white border border-slate-100 shadow-sm px-4 py-2.5 flex flex-col">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{k.label}</p>
            <p className="text-xl font-bold mt-0.5" style={{ color: k.color }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Barre filtres + toggles */}
      <div className="flex flex-wrap items-center gap-2">
        <input className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400 w-44" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs focus:outline-none focus:border-blue-400" value={filterStatut} onChange={e => setFilterStatut(e.target.value as ActionStatut | "")}>
          <option value="">Tous statuts</option>
          {ACTION_STATUTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs focus:outline-none focus:border-blue-400" value={filterSite} onChange={e => setFilterSite(e.target.value as SiteKey | "")}>
          <option value="">Tous sites</option>
          {SITE_KEYS.map(sk => <option key={sk} value={sk}>{sk}</option>)}
        </select>
        <input className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400 w-36" placeholder="Responsable..." value={filterResp} onChange={e => setFilterResp(e.target.value)} />
        <div className="flex rounded-lg overflow-hidden border border-slate-200 ml-auto">
          {(["liste", "kanban"] as ActionViewMode[]).map(m => (
            <button key={m} onClick={() => setViewMode(m)} className="px-3 py-1.5 text-xs font-semibold capitalize transition-colors"
              style={{ backgroundColor: viewMode === m ? "#f97316" : "#fff", color: viewMode === m ? "#fff" : "#64748b" }}>{m}</button>
          ))}
        </div>
        {isAdmin && (
          <button onClick={() => openAdd()} className="rounded-lg px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5" style={{ backgroundColor: "#15803d", color: "#fff" }}>
            <IconPlus /> Nouvelle action
          </button>
        )}
      </div>

      {/* Vue liste */}
      {viewMode === "liste" && (
        <div className="rounded-xl bg-white border border-slate-100 shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="text-slate-400 text-sm">{actions.length === 0 ? "Aucune action — cliquez sur « Nouvelle action » pour commencer" : "Aucune action correspondant aux filtres"}</p>
            </div>
          ) : (
            <table className="w-full text-xs">
              <thead><tr className="border-b border-slate-100 bg-slate-50">
                {["TITRE", "SITE", "ÉQUIPEMENT", "RESPONSABLE", "STATUT", "ÉCHÉANCE", "BUDGET", ...(isAdmin ? ["ADMIN"] : [])].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-400">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {filtered.map(a => {
                  const ss = actionStatutStyle(a.statut);
                  const isLate = a.deadline && a.statut !== "Terminé" && new Date(a.deadline) < new Date();
                  return (
                    <tr key={a.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-2.5 max-w-[180px]">
                        <p className="font-semibold text-slate-800 truncate">{a.titre}</p>
                        {a.description && <p className="text-[10px] text-slate-400 truncate">{a.description}</p>}
                      </td>
                      <td className="px-3 py-2.5"><span className="rounded px-1.5 py-0.5 text-[10px] font-bold text-white" style={{ backgroundColor: "#0a2540" }}>{a.site}</span></td>
                      <td className="px-3 py-2.5 text-slate-600">{a.dmModele ?? "—"}</td>
                      <td className="px-3 py-2.5 text-slate-600">{a.responsable ?? "—"}</td>
                      <td className="px-3 py-2.5"><span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: ss.bg, color: ss.text, border: `1px solid ${ss.border}` }}>{a.statut}</span></td>
                      <td className="px-3 py-2.5" style={{ color: isLate ? "#dc2626" : "#64748b" }}>
                        {a.deadline ? <span className={isLate ? "font-bold" : ""}>{a.deadline}{isLate ? " ⚠" : ""}</span> : "—"}
                      </td>
                      <td className="px-3 py-2.5 text-slate-600">{a.budgetEstime ? fmtEur(a.budgetEstime) : "—"}</td>
                      {isAdmin && (
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-1">
                            <IconButton title="Modifier" onClick={() => openEdit(a)} variant="edit"><IconPencil /></IconButton>
                            <IconButton title="Supprimer" onClick={() => { if (window.confirm("Supprimer cette action ?")) onDelete(a.id); }} variant="danger"><IconTrash /></IconButton>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Vue kanban */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-4 gap-3" style={{ minHeight: 400 }}>
          {ACTION_STATUTS.map(statut => {
            const colActions = filtered.filter(a => a.statut === statut);
            const ss = actionStatutStyle(statut);
            return (
              <div key={statut} className="flex flex-col gap-2">
                <div className="rounded-xl px-3 py-2 flex items-center justify-between" style={{ backgroundColor: ss.bg, border: `1px solid ${ss.border}` }}>
                  <span className="text-xs font-bold" style={{ color: ss.text }}>{statut}</span>
                  <span className="rounded-full text-[10px] font-bold px-2 py-0.5" style={{ backgroundColor: ss.dot, color: "#fff" }}>{colActions.length}</span>
                </div>
                <div className="flex flex-col gap-2">
                  {colActions.map(a => {
                    const isLate = a.deadline && a.statut !== "Terminé" && new Date(a.deadline) < new Date();
                    return (
                      <div key={a.id} className="rounded-xl bg-white border border-slate-100 shadow-sm p-3 group">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <p className="text-xs font-semibold text-slate-800 leading-tight">{a.titre}</p>
                          {isAdmin && (
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              <IconButton title="Modifier" onClick={() => openEdit(a)} variant="edit"><IconPencil /></IconButton>
                              <IconButton title="Supprimer" onClick={() => { if (window.confirm("Supprimer ?")) onDelete(a.id); }} variant="danger"><IconTrash /></IconButton>
                            </div>
                          )}
                        </div>
                        {a.description && <p className="text-[10px] text-slate-500 mb-1.5 line-clamp-2">{a.description}</p>}
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className="rounded px-1.5 py-0.5 text-[10px] font-bold text-white" style={{ backgroundColor: "#0a2540" }}>{a.site}</span>
                          {a.dmModele && <span className="rounded px-1.5 py-0.5 text-[10px] bg-slate-100 text-slate-600">{a.dmModele}</span>}
                          {a.responsable && <span className="rounded px-1.5 py-0.5 text-[10px] bg-blue-50 text-blue-700">{a.responsable}</span>}
                        </div>
                        {a.deadline && <p className="text-[10px] mt-1.5" style={{ color: isLate ? "#dc2626" : "#94a3b8" }}>{isLate ? "⚠ Dépassé : " : "Échéance : "}{a.deadline}</p>}
                        {a.budgetEstime != null && <p className="text-[10px] text-slate-400 mt-0.5">Budget : {fmtEur(a.budgetEstime)}</p>}
                      </div>
                    );
                  })}
                  {isAdmin && (
                    <button className="rounded-xl border-2 border-dashed border-slate-200 px-3 py-2 text-[10px] text-slate-400 hover:border-slate-300 text-center"
                      onClick={() => openAdd(statut)}>+ Ajouter ici</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Alertes intelligentes View (Lot 3) ── */
function AlertesView({ allData, actions, contrats }: { allData: Record<SiteKey, SiteData>; actions: ActionItem[]; contrats: ContratPartage[] }) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const j7 = new Date(today); j7.setDate(j7.getDate() + 7);
  const j30 = new Date(today); j30.setDate(j30.getDate() + 30);

  const alertes = useMemo(() => {
    const list: { type: "danger" | "warning" | "info"; categorie: string; site: SiteKey; titre: string; detail: string }[] = [];

    for (const sk of SITE_KEYS) {
      for (const dm of allData[sk].dms) {
        // PMS dépassé ou imminent
        if (dm.pms && dm.pms !== "—") {
          const pmsDate = new Date(dm.pms); pmsDate.setHours(0, 0, 0, 0);
          if (pmsDate < today) {
            list.push({ type: "danger", categorie: "PMS dépassé", site: sk, titre: dm.modele, detail: `PMS prévu le ${dm.pms} — intervention en retard` });
          } else if (pmsDate <= j7) {
            list.push({ type: "danger", categorie: "PMS J-7", site: sk, titre: dm.modele, detail: `PMS dans moins de 7 jours (${dm.pms})` });
          } else if (pmsDate <= j30) {
            list.push({ type: "warning", categorie: "PMS J-30", site: sk, titre: dm.modele, detail: `PMS prévu le ${dm.pms} — planifier l'intervention` });
          }
        }
        // Équipement critique hors service
        if (dm.statut === "Hors service" && criticiteFromClasse(dm.classe) === "Critique") {
          list.push({ type: "danger", categorie: "Critique HS", site: sk, titre: dm.modele, detail: `Équipement de classe ${dm.classe ?? "?"} hors service — impact patient élevé` });
        }
        // Pannes ouvertes non clôturées
        const pannesOuvertes = (dm.pannes ?? []).filter(p => p.etat !== "Clôturé");
        if (pannesOuvertes.length > 0) {
          list.push({ type: "warning", categorie: "Pannes ouvertes", site: sk, titre: dm.modele, detail: `${pannesOuvertes.length} panne(s) non clôturée(s) — état : ${pannesOuvertes.map(p => p.etat).join(", ")}` });
        }
        // Pièces critiques en rupture (qte = 0)
        const ruptures = dm.pieces.filter(p => p.urgence === "critique" && p.qte === 0);
        if (ruptures.length > 0) {
          list.push({ type: "danger", categorie: "Rupture stock", site: sk, titre: dm.modele, detail: `Pièce(s) critique(s) épuisée(s) : ${ruptures.map(p => p.designation).join(", ")}` });
        }
        // Actions bloquées liées à cet équipement
        const actionsBloquees = actions.filter(a => a.site === sk && a.dmId === dm.id && a.statut === "Bloqué");
        if (actionsBloquees.length > 0) {
          list.push({ type: "warning", categorie: "Action bloquée", site: sk, titre: dm.modele, detail: `${actionsBloquees.length} action(s) bloquée(s) sur cet équipement` });
        }
      }
    }
    // Actions en retard (toutes)
    for (const a of actions) {
      if (a.deadline && a.statut !== "Terminé" && new Date(a.deadline) < today) {
        list.push({ type: "warning", categorie: "Action en retard", site: a.site, titre: a.titre, detail: `Échéance dépassée le ${a.deadline} — statut : ${a.statut}` });
      }
    }
    // Contrats expirant bientôt ou expirés
    for (const c of contrats) {
      if (!c.dateFin) continue;
      const fin = new Date(c.dateFin); fin.setHours(0, 0, 0, 0);
      const diff = Math.round((fin.getTime() - today.getTime()) / 86400000);
      const sitePrimary = c.sites[0] ?? "BYUMBA";
      if (diff < 0) {
        list.push({ type: "danger", categorie: "Contrat expiré", site: sitePrimary, titre: c.titre, detail: `Contrat ${c.type} (${c.fournisseur || "—"}) expiré depuis le ${c.dateFin}` });
      } else if (diff <= 30) {
        list.push({ type: "danger", categorie: "Contrat J-30", site: sitePrimary, titre: c.titre, detail: `Contrat ${c.type} (${c.fournisseur || "—"}) expire le ${c.dateFin} — renouveler` });
      } else if (diff <= 90) {
        list.push({ type: "warning", categorie: "Contrat J-90", site: sitePrimary, titre: c.titre, detail: `Contrat ${c.type} (${c.fournisseur || "—"}) expire le ${c.dateFin}` });
      }
    }
    return list;
  }, [allData, actions, contrats]);

  const dangers = alertes.filter(a => a.type === "danger");
  const warnings = alertes.filter(a => a.type === "warning");

  function AlertRow({ a, i }: { a: typeof alertes[0]; i: number }) {
    const isD = a.type === "danger";
    return (
      <div key={i} className="flex items-start gap-3 px-4 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
        <div className="shrink-0 mt-0.5">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: isD ? "#fee2e2" : "#fef3c7", color: isD ? "#dc2626" : "#d97706" }}>
            {isD ? "!" : "⚠"}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="text-[10px] font-bold rounded-full px-2 py-0.5" style={{ backgroundColor: isD ? "#fee2e2" : "#fef3c7", color: isD ? "#dc2626" : "#d97706" }}>{a.categorie}</span>
            <span className="rounded px-1.5 py-0.5 text-[10px] font-bold text-white" style={{ backgroundColor: "#0a2540" }}>{a.site}</span>
          </div>
          <p className="text-xs font-semibold text-slate-800">{a.titre}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">{a.detail}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-red-50 border border-red-200 shadow-sm px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-red-400">Alertes critiques</p>
          <p className="text-2xl font-bold mt-1 text-red-600">{dangers.length}</p>
        </div>
        <div className="rounded-xl bg-amber-50 border border-amber-200 shadow-sm px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-500">Avertissements</p>
          <p className="text-2xl font-bold mt-1 text-amber-600">{warnings.length}</p>
        </div>
        <div className="rounded-xl bg-green-50 border border-green-200 shadow-sm px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-green-500">Total alertes</p>
          <p className="text-2xl font-bold mt-1 text-green-600">{alertes.length}</p>
        </div>
      </div>

      {alertes.length === 0 && (
        <div className="rounded-xl bg-white border border-slate-100 shadow-sm px-5 py-12 text-center">
          <p className="text-2xl mb-2">✓</p>
          <p className="text-sm font-semibold text-green-600">Aucune alerte active</p>
          <p className="text-xs text-slate-400 mt-1">Tous les équipements sont à jour et dans les délais</p>
        </div>
      )}

      {/* Alertes critiques */}
      {dangers.length > 0 && (
        <div className="rounded-xl bg-white border border-red-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-red-100" style={{ backgroundColor: "#fff5f5" }}>
            <p className="text-sm font-bold text-red-700">Alertes critiques ({dangers.length})</p>
            <p className="text-[10px] text-red-400">Action immédiate requise</p>
          </div>
          {dangers.map((a, i) => <AlertRow key={i} a={a} i={i} />)}
        </div>
      )}

      {/* Avertissements */}
      {warnings.length > 0 && (
        <div className="rounded-xl bg-white border border-amber-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-amber-100" style={{ backgroundColor: "#fffbeb" }}>
            <p className="text-sm font-bold text-amber-700">Avertissements ({warnings.length})</p>
            <p className="text-[10px] text-amber-400">À traiter prochainement</p>
          </div>
          {warnings.map((a, i) => <AlertRow key={i} a={a} i={i} />)}
        </div>
      )}
    </div>
  );
}

/* ── Dashboard View (niveau direction / ministère) ── */
function DashboardView({ allData, onSelectSite }: { allData: Record<SiteKey, SiteData>; onSelectSite: (s: SiteKey) => void }) {
  /* Calculs décisionnels */
  const decisional = useMemo(() => {
    const allDms: { site: SiteKey; dm: DM }[] = [];
    for (const sk of SITE_KEYS) for (const dm of allData[sk].dms) allDms.push({ site: sk, dm });
    const crits = { Critique: 0, "Élevée": 0, Standard: 0 } as Record<"Critique" | "Élevée" | "Standard", number>;
    for (const { dm } of allDms) crits[criticiteFromClasse(dm.classe)]++;
    const critHS = allDms.filter(({ dm }) => criticiteFromClasse(dm.classe) === "Critique" && dm.statut === "Hors service").length;
    // Coût maintenance total = pannes + historique coûts
    let coutMaint = 0;
    for (const { dm } of allDms) coutMaint += computeCoutTotalMaintenance(dm);
    // Coût par site (pièces + kits + maintenance)
    const coutParSite = SITE_KEYS.map(sk => {
      const dms = allData[sk].dms;
      const pieces = totalPieces(dms);
      const kits = totalKits(dms);
      let maint = 0; for (const dm of dms) maint += computeCoutTotalMaintenance(dm);
      return { sk, pieces, kits, maint, total: pieces + kits + maint };
    });
    // Disponibilité par service
    const serviceAgg: Record<string, { total: number; fonct: number }> = {};
    for (const { dm } of allDms) {
      const svc = dm.service ?? "Non précisé";
      if (!serviceAgg[svc]) serviceAgg[svc] = { total: 0, fonct: 0 };
      serviceAgg[svc].total++;
      if (dm.statut === "Fonctionnel") serviceAgg[svc].fonct++;
    }
    const dispoParService = Object.entries(serviceAgg).map(([svc, v]) => ({ service: svc, pct: v.total > 0 ? Math.round((v.fonct / v.total) * 100) : 0, total: v.total })).sort((a, b) => a.pct - b.pct);
    // Top 10 équipements défaillants (panne count + historique correctif)
    const defaillants = allDms.map(({ site, dm }) => {
      const nbPannes = (dm.pannes ?? []).length;
      const nbCorrectif = dm.historique.filter(h => h.type === "PV correctif").length;
      return { site, dm, score: nbPannes * 3 + nbCorrectif, nbPannes, nbCorrectif };
    }).filter(x => x.score > 0).sort((a, b) => b.score - a.score).slice(0, 10);
    // Courbe évolution pannes (par mois, 12 derniers)
    const moisCounts: Record<string, number> = {};
    for (const { dm } of allDms) for (const p of (dm.pannes ?? [])) {
      if (!p.dateSignalement) continue;
      const mois = p.dateSignalement.slice(0, 7);
      moisCounts[mois] = (moisCounts[mois] ?? 0) + 1;
    }
    const moisKeys = Object.keys(moisCounts).sort().slice(-12);
    const evolPannes = moisKeys.map(m => ({ x: m.slice(2), y: moisCounts[m] }));
    return { allDms, crits, critHS, coutMaint, coutParSite, dispoParService, defaillants, evolPannes };
  }, [allData]);
  const globalStats = useMemo(() => {
    let total = 0, hs = 0, att = 0, cost = 0, kitsCost = 0, kitsCount = 0;
    for (const sk of SITE_KEYS) {
      const dms = allData[sk].dms; total += dms.length;
      const c = countStatuts(dms); hs += c.hs; att += c.att;
      cost += totalPieces(dms);
      kitsCost += totalKits(dms);
      for (const dm of dms) kitsCount += (dm.kits ?? []).length;
    }
    return { total, hs, att, cost, kitsCost, kitsCount };
  }, [allData]);

  const allPieces = useMemo(() => {
    const rows: { site: SiteKey; dm: string; piece: Piece }[] = [];
    for (const sk of SITE_KEYS) for (const dm of allData[sk].dms) for (const p of dm.pieces) rows.push({ site: sk, dm: dm.modele, piece: p });
    return rows.sort((a, b) => URGENCE_ORDER[a.piece.urgence] - URGENCE_ORDER[b.piece.urgence]);
  }, [allData]);

  const allKits = useMemo(() => {
    const rows: { site: SiteKey; dm: string; kit: Kit }[] = [];
    for (const sk of SITE_KEYS) for (const dm of allData[sk].dms) for (const k of (dm.kits ?? [])) rows.push({ site: sk, dm: dm.modele, kit: k });
    return rows;
  }, [allData]);

  const dispoGlobale = globalStats.total > 0 ? Math.round(((globalStats.total - globalStats.hs) / globalStats.total) * 100) : 0;
  const kpis = [
    { label: "Disponibilité globale", value: dispoGlobale + " %", color: dispoGlobale >= 80 ? "#16a34a" : dispoGlobale >= 60 ? "#f59e0b" : "#ef4444" },
    { label: "Total équipements", value: String(globalStats.total), color: "#3b82f6" },
    { label: "Critiques HS", value: String(decisional.critHS), color: "#dc2626" },
    { label: "Hors service", value: String(globalStats.hs), color: "#ef4444" },
    { label: "Coût maintenance", value: fmtEur(decisional.coutMaint), color: "#8b5cf6" },
    { label: "Coût pièces + kits", value: fmtEur(globalStats.cost + globalStats.kitsCost), color: "#f97316" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
        {kpis.map(k => (
          <div key={k.label} className="rounded-xl bg-white border border-slate-100 shadow-sm px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{k.label}</p>
            <p className="mt-1 text-2xl font-bold" style={{ color: k.color }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Disponibilité + camembert criticité + évolution pannes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="rounded-xl bg-white border border-slate-100 shadow-sm p-4">
          <p className="text-xs font-bold text-slate-700 mb-2">Disponibilité par site</p>
          <BarChart data={SITE_KEYS.map(sk => ({ label: sk, value: dispoPct(allData[sk].dms), color: dispoPct(allData[sk].dms) >= 80 ? "#22c55e" : dispoPct(allData[sk].dms) >= 60 ? "#f59e0b" : "#ef4444" }))} height={120} />
          <p className="text-[10px] text-slate-400 mt-2">En % d’équipements fonctionnels</p>
        </div>
        <div className="rounded-xl bg-white border border-slate-100 shadow-sm p-4">
          <p className="text-xs font-bold text-slate-700 mb-2">Répartition par criticité</p>
          <PieChart data={[
            { label: "Critique", value: decisional.crits.Critique, color: "#ef4444" },
            { label: "Élevée", value: decisional.crits["Élevée"], color: "#f59e0b" },
            { label: "Standard", value: decisional.crits.Standard, color: "#3b82f6" },
          ]} size={130} />
        </div>
        <div className="rounded-xl bg-white border border-slate-100 shadow-sm p-4">
          <p className="text-xs font-bold text-slate-700 mb-2">Évolution des pannes (12 mois)</p>
          {decisional.evolPannes.length > 0
            ? <LineChart points={decisional.evolPannes} height={110} color="#ef4444" />
            : <p className="text-[10px] text-slate-400 italic py-6 text-center">Aucune panne historisée</p>}
        </div>
      </div>

      {/* Top 10 défaillants */}
      <div className="rounded-xl bg-white border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <p className="text-sm font-bold text-slate-800">Top 10 équipements les plus défaillants</p>
          <p className="text-[10px] text-slate-400">Score pondéré : nb pannes × 3 + PV correctifs</p>
        </div>
        {decisional.defaillants.length === 0 ? (
          <p className="text-xs text-slate-400 italic px-4 py-6 text-center">Aucun équipement défaillant enregistré à ce jour</p>
        ) : (
          <table className="w-full text-xs">
            <thead><tr className="border-b border-slate-50 bg-slate-50">
              {["#", "Site", "Équipement", "Service", "Criticité", "Pannes", "Correctifs", "Score"].map(h => (
                <th key={h} className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-400">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {decisional.defaillants.map((d, i) => {
                const crit = criticiteFromClasse(d.dm.classe); const cs = criticiteStyle(crit);
                return (
                  <tr key={d.dm.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => onSelectSite(d.site)}>
                    <td className="px-3 py-2 font-bold text-slate-400">{i + 1}</td>
                    <td className="px-3 py-2 font-bold text-slate-500">{d.site}</td>
                    <td className="px-3 py-2 text-slate-800 font-semibold">{d.dm.modele}</td>
                    <td className="px-3 py-2 text-slate-600">{d.dm.service ?? "—"}</td>
                    <td className="px-3 py-2"><span className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: cs.bg, color: cs.text, border: `1px solid ${cs.border}` }}>{crit}</span></td>
                    <td className="px-3 py-2 text-center text-slate-700">{d.nbPannes}</td>
                    <td className="px-3 py-2 text-center text-slate-700">{d.nbCorrectif}</td>
                    <td className="px-3 py-2 font-bold text-red-600">{d.score}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Disponibilité par service */}
      <div className="rounded-xl bg-white border border-slate-100 shadow-sm p-4">
        <p className="text-sm font-bold text-slate-800 mb-3">Disponibilité par service</p>
        <div className="flex flex-col gap-2">
          {decisional.dispoParService.map(s => (
            <div key={s.service} className="flex items-center gap-3">
              <span className="text-xs text-slate-600 font-semibold w-40 shrink-0 truncate" title={s.service}>{s.service}</span>
              <div className="flex-1 h-4 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-4 rounded-full transition-all" style={{ width: `${s.pct}%`, backgroundColor: s.pct >= 80 ? "#22c55e" : s.pct >= 60 ? "#f59e0b" : "#ef4444" }} />
              </div>
              <span className="text-xs font-bold text-slate-700 w-16 text-right shrink-0">{s.pct} %</span>
              <span className="text-[10px] text-slate-400 w-16 text-right shrink-0">{s.total} équip.</span>
            </div>
          ))}
        </div>
      </div>

      {/* Coût par site */}
      <div className="rounded-xl bg-white border border-slate-100 shadow-sm p-4">
        <p className="text-sm font-bold text-slate-800 mb-3">Coût par site</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {decisional.coutParSite.map(c => (
            <div key={c.sk} className="rounded-lg border border-slate-100 p-3 cursor-pointer hover:border-orange-300" onClick={() => onSelectSite(c.sk)}>
              <div className="flex items-center justify-between mb-2">
                <span className="rounded-lg px-2 py-0.5 text-[10px] font-bold text-white" style={{ backgroundColor: "#0a2540" }}>{c.sk}</span>
                <span className="text-sm font-bold text-slate-800">{fmtEur(c.total)}</span>
              </div>
              <div className="flex flex-col gap-0.5 text-[10px] text-slate-600">
                <div className="flex justify-between"><span>Pièces</span><span className="font-semibold">{fmtEur(c.pieces)}</span></div>
                <div className="flex justify-between"><span>Kits</span><span className="font-semibold">{fmtEur(c.kits)}</span></div>
                <div className="flex justify-between"><span>Maintenance (pannes + histo)</span><span className="font-semibold">{fmtEur(c.maint)}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {SITE_KEYS.map(sk => {
          const dms = allData[sk].dms; const counts = countStatuts(dms);
          const pct = dms.length > 0 ? Math.round((counts.fonct / dms.length) * 100) : 0;
          return (
            <div key={sk} className="rounded-xl bg-white border border-slate-100 shadow-sm p-4 cursor-pointer hover:border-orange-300 transition-colors" onClick={() => onSelectSite(sk)}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-slate-800">{sk}</p>
                <span className="text-[10px] text-slate-400">{dms.length} équip.</span>
              </div>
              <div className="flex flex-col gap-1 text-xs mb-3">
                {[{ l: "Fonctionnel", n: counts.fonct, c: "#22c55e" }, { l: "En attente", n: counts.att, c: "#f59e0b" }, { l: "Hors service", n: counts.hs, c: "#ef4444" }, { l: "Inutilisé", n: counts.inut, c: "#94a3b8" }].map(r => (
                  <div key={r.l} className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-600"><span className="rounded-full" style={{ width: 6, height: 6, backgroundColor: r.c, flexShrink: 0 }} />{r.l}</span>
                    <span className="font-semibold text-slate-800">{r.n}</span>
                  </div>
                ))}
              </div>
              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden"><div className="h-1.5 rounded-full bg-green-500 transition-all" style={{ width: `${pct}%` }} /></div>
              <p className="text-[10px] text-slate-400 mt-1 text-right">{pct}% fonctionnel</p>
            </div>
          );
        })}
      </div>
      {/* All spare parts table */}
      <div className="rounded-xl bg-white border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <p className="text-sm font-bold text-slate-800">Pièces nécessaires — tous sites</p>
          <p className="text-xs text-slate-400">{allPieces.length} références · {fmtEur(globalStats.cost)} total</p>
        </div>
        <table className="w-full text-xs">
          <thead><tr className="border-b border-slate-50 bg-slate-50">
            {["Site", "Équipement", "Référence", "Désignation", "Qté", "P.U.", "Total", "Urgence"].map(h => (
              <th key={h} className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-400">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {allPieces.map(({ site, dm, piece }, idx) => {
              const us = urgenceStyle(piece.urgence);
              return (
                <tr key={`${site}-${dm}-${piece.id}-${idx}`} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="px-3 py-2 font-bold text-slate-500">{site}</td>
                  <td className="px-3 py-2 text-slate-700">{dm}</td>
                  <td className="px-3 py-2 font-mono text-slate-500">{piece.reference}</td>
                  <td className="px-3 py-2 text-slate-700">{piece.designation}</td>
                  <td className="px-3 py-2 text-center text-slate-700">{piece.qte}</td>
                  <td className="px-3 py-2 text-slate-700">{fmtEur(piece.prixUnit)}</td>
                  <td className="px-3 py-2 font-semibold text-slate-800">{fmtEur(piece.qte * piece.prixUnit)}</td>
                  <td className="px-3 py-2"><span className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: us.bg, color: us.text, border: `1px solid ${us.border}` }}>{piece.urgence}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* All maintenance kits table */}
      <div className="rounded-xl bg-white border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <p className="text-sm font-bold text-slate-800">Kits de maintenance — tous sites</p>
          <p className="text-xs text-slate-400">{globalStats.kitsCount} kit(s) · {fmtEur(globalStats.kitsCost)} total</p>
        </div>
        {allKits.length === 0 ? <p className="text-xs text-slate-400 italic px-4 py-6 text-center">Aucun kit de maintenance enregistré</p> : (
          <table className="w-full text-xs">
            <thead><tr className="border-b border-slate-50 bg-slate-50">
              {["Site", "Équipement", "Référence", "Désignation", "Périodicité", "Qté", "P.U.", "Total", "Fournisseur"].map(h => (
                <th key={h} className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-400">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {allKits.map(({ site, dm, kit }, idx) => {
                const ps = periodStyle(kit.periodicite);
                return (
                  <tr key={`${site}-${dm}-${kit.id}-${idx}`} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-2 font-bold text-slate-500">{site}</td>
                    <td className="px-3 py-2 text-slate-700">{dm}</td>
                    <td className="px-3 py-2 font-mono text-slate-500">{kit.reference}</td>
                    <td className="px-3 py-2 text-slate-700">{kit.designation}</td>
                    <td className="px-3 py-2"><span className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: ps.bg, color: ps.text, border: `1px solid ${ps.border}` }}>{kit.periodicite}</span></td>
                    <td className="px-3 py-2 text-center text-slate-700">{kit.qte}</td>
                    <td className="px-3 py-2 text-slate-700">{fmtEur(kit.prixUnit)}</td>
                    <td className="px-3 py-2 font-semibold text-slate-800">{fmtEur(kit.qte * kit.prixUnit)}</td>
                    <td className="px-3 py-2 text-slate-500">{kit.fournisseur ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ── Site View ── */
function SiteView({ siteKey, data, selectedDM, selectedNodeId, onSelectDM, onNodeClick, isAdmin, onQuickStatus, onAddDM, onUpdateDM, onDeleteDM }: {
  siteKey: SiteKey; data: SiteData; selectedDM: DM | null; selectedNodeId: string | null;
  onSelectDM: (dm: DM) => void; onNodeClick: (id: string) => void;
  isAdmin: boolean; onQuickStatus: (dmId: string, statut: Statut) => void;
  onAddDM: (dm: DM) => void; onUpdateDM: (dm: DM) => void; onDeleteDM: (dmId: string) => void;
}) {
  const [subTab, setSubTab] = useState<SiteSubTab>("equipements");
  const [showAddDMForm, setShowAddDMForm] = useState(false);

  /* ── Lot 4 : Filtres multi-critères ── */
  const [fSearch, setFSearch] = useState("");
  const [fStatutFilter, setFStatutFilter] = useState<Statut | "">("");
  const [fClasseFilter, setFClasseFilter] = useState("");
  const [fServiceFilter, setFServiceFilter] = useState("");

  /* ── Pièce add form state ── */
  const [showAddPiece, setShowAddPiece] = useState(false);
  const [pDmId, setPDmId] = useState("");
  const [pRef, setPRef] = useState(""); const [pDesig, setPDesig] = useState("");
  const [pQte, setPQte] = useState("1"); const [pPrix, setPPrix] = useState("");
  const [pUrg, setPUrg] = useState<Piece["urgence"]>("normale"); const [pFour, setPFour] = useState("");

  /* ── Kit add form state ── */
  const [showAddKit, setShowAddKit] = useState(false);
  const [kDmId, setKDmId] = useState("");
  const [kRef, setKRef] = useState(""); const [kDesig, setKDesig] = useState(""); const [kContenu, setKContenu] = useState("");
  const [kQte, setKQte] = useState("1"); const [kPrix, setKPrix] = useState("");
  const [kPeriod, setKPeriod] = useState<Kit["periodicite"]>("Annuel");
  const [kFour, setKFour] = useState(""); const [kDernier, setKDernier] = useState("");

  const { dms } = data;
  const counts = countStatuts(dms);
  const siteCost = totalPieces(dms);
  const siteKitsCost = totalKits(dms);

  /* Lot 4 — dms filtrés pour l'onglet équipements */
  const filteredDms = useMemo(() => dms.filter(dm => {
    if (fStatutFilter && dm.statut !== fStatutFilter) return false;
    if (fClasseFilter && (dm.classe ?? "") !== fClasseFilter) return false;
    if (fServiceFilter && !(dm.service ?? "").toLowerCase().includes(fServiceFilter.toLowerCase())) return false;
    if (fSearch && !dm.modele.toLowerCase().includes(fSearch.toLowerCase()) && !dm.serie.toLowerCase().includes(fSearch.toLowerCase())) return false;
    return true;
  }), [dms, fSearch, fStatutFilter, fClasseFilter, fServiceFilter]);

  /* services disponibles pour le filtre */
  const availableServices = useMemo(() => [...new Set(dms.map(d => d.service ?? "").filter(Boolean))].sort(), [dms]);

  /* allPieces & allKits carry the full DM object for mutations */
  const allPieces = useMemo(() => {
    const rows: { dm: DM; piece: Piece }[] = [];
    for (const dm of dms) for (const p of dm.pieces) rows.push({ dm, piece: p });
    return rows;
  }, [dms]);
  const allKits = useMemo(() => {
    const rows: { dm: DM; kit: Kit }[] = [];
    for (const dm of dms) for (const k of (dm.kits ?? [])) rows.push({ dm, kit: k });
    return rows;
  }, [dms]);

  /* ── Piece helpers ── */
  function submitAddPiece() {
    if (!pDmId || !pRef || !pDesig || !pPrix) return;
    const dm = dms.find(d => d.id === pDmId); if (!dm) return;
    onUpdateDM({ ...dm, pieces: [...dm.pieces, { id: uid(), reference: pRef, designation: pDesig, qte: parseInt(pQte) || 1, prixUnit: parseFloat(pPrix) || 0, urgence: pUrg, fournisseur: pFour || undefined }] });
    setPRef(""); setPDesig(""); setPQte("1"); setPPrix(""); setPFour(""); setShowAddPiece(false);
  }
  function deletePiece(dm: DM, pieceId: string) {
    if (!window.confirm("Supprimer cette pièce ?")) return;
    onUpdateDM({ ...dm, pieces: dm.pieces.filter(p => p.id !== pieceId) });
  }

  /* ── Kit helpers ── */
  function submitAddKit() {
    if (!kDmId || !kRef || !kDesig) return;
    const dm = dms.find(d => d.id === kDmId); if (!dm) return;
    onUpdateDM({ ...dm, kits: [...(dm.kits ?? []), { id: uid(), reference: kRef, designation: kDesig, contenu: kContenu, qte: parseInt(kQte) || 1, prixUnit: parseFloat(kPrix) || 0, periodicite: kPeriod, fournisseur: kFour || undefined, dernierUtilise: kDernier || undefined }] });
    setKRef(""); setKDesig(""); setKContenu(""); setKQte("1"); setKPrix(""); setKFour(""); setKDernier(""); setShowAddKit(false);
  }
  function deleteKit(dm: DM, kitId: string) {
    if (!window.confirm("Supprimer ce kit ?")) return;
    onUpdateDM({ ...dm, kits: (dm.kits ?? []).filter(k => k.id !== kitId) });
  }

  const kpis = [
    { label: "ÉQUIPEMENTS", value: String(dms.length), color: "#3b82f6" },
    { label: "FONCTIONNEL", value: String(counts.fonct), color: "#22c55e" },
    { label: "HORS SERVICE", value: String(counts.hs), color: "#ef4444" },
    { label: "EN ATTENTE", value: String(counts.att), color: "#f59e0b" },
    { label: "COÛT PIÈCES", value: fmtEur(siteCost), color: "#8b5cf6" },
    { label: "COÛT KITS", value: fmtEur(siteKitsCost), color: "#a855f7" },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {kpis.map(k => (
          <div key={k.label} className="rounded-xl bg-white border border-slate-100 shadow-sm px-4 py-2.5 flex flex-col">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{k.label}</p>
            <p className="text-xl font-bold mt-0.5" style={{ color: k.color }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Sub-tab bar + add buttons */}
      <div className="flex gap-2 items-center flex-wrap">
        {([["equipements", "Équipements"], ["pieces", "Pièces nécessaires"], ["kits", "Kits de maintenance"]] as [SiteSubTab, string][]).map(([k, l]) => (
          <button key={k} onClick={() => setSubTab(k)} className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
            style={{ backgroundColor: subTab === k ? "#f97316" : "#fff", color: subTab === k ? "#fff" : "#64748b", border: "1px solid", borderColor: subTab === k ? "#f97316" : "#e2e8f0" }}>{l}</button>
        ))}
        {isAdmin && subTab === "equipements" && !showAddDMForm && (
          <button onClick={() => setShowAddDMForm(true)} className="ml-auto rounded-lg px-3 py-1.5 text-xs font-semibold" style={{ backgroundColor: "#15803d", color: "#fff" }}>+ Ajouter équipement</button>
        )}
        {isAdmin && subTab === "pieces" && !showAddPiece && (
          <button onClick={() => { setShowAddPiece(true); setPDmId(dms[0]?.id ?? ""); }} className="ml-auto rounded-lg px-3 py-1.5 text-xs font-semibold" style={{ backgroundColor: "#f97316", color: "#fff" }}>+ Ajouter pièce</button>
        )}
        {isAdmin && subTab === "kits" && !showAddKit && (
          <button onClick={() => { setShowAddKit(true); setKDmId(dms[0]?.id ?? ""); }} className="ml-auto rounded-lg px-3 py-1.5 text-xs font-semibold" style={{ backgroundColor: "#8b5cf6", color: "#fff" }}>+ Ajouter kit</button>
        )}
      </div>

      {/* Add DM form */}
      {showAddDMForm && isAdmin && (
        <AddDMForm onAdd={(dm) => { onAddDM(dm); setShowAddDMForm(false); }} onCancel={() => setShowAddDMForm(false)} />
      )}

      {/* ── Lot 4 : Barre de filtres multi-critères (onglet équipements) ── */}
      {subTab === "equipements" && (
        <div className="flex flex-wrap gap-2 items-center rounded-xl bg-white border border-slate-100 shadow-sm px-4 py-2.5">
          <input className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400 w-44" placeholder="Rechercher modèle / série..." value={fSearch} onChange={e => setFSearch(e.target.value)} />
          <select className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs focus:outline-none focus:border-blue-400" value={fStatutFilter} onChange={e => setFStatutFilter(e.target.value as Statut | "")}>
            <option value="">Tous statuts</option>
            {STATUTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs focus:outline-none focus:border-blue-400" value={fClasseFilter} onChange={e => setFClasseFilter(e.target.value)}>
            <option value="">Toutes classes</option>
            {CLASSES.map(c => <option key={c} value={c}>Classe {c}</option>)}
          </select>
          <select className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs focus:outline-none focus:border-blue-400" value={fServiceFilter} onChange={e => setFServiceFilter(e.target.value)}>
            <option value="">Tous services</option>
            {availableServices.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {(fSearch || fStatutFilter || fClasseFilter || fServiceFilter) && (
            <button onClick={() => { setFSearch(""); setFStatutFilter(""); setFClasseFilter(""); setFServiceFilter(""); }}
              className="rounded-lg px-2 py-1.5 text-xs font-semibold bg-slate-100 text-slate-500 hover:bg-slate-200">
              Réinitialiser
            </button>
          )}
          <span className="ml-auto text-[10px] text-slate-400">{filteredDms.length}/{dms.length} équipement(s)</span>
        </div>
      )}

      {/* ── ÉQUIPEMENTS tab ── */}
      {subTab === "equipements" && (
        <>
          <div className="rounded-xl bg-white border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-slate-100 bg-slate-50">
                {["MODÈLE", "MARQUE", "N° SÉRIE", "STATUT", "SERVICE", "PMS", isAdmin ? "ADMIN" : "ACTIONS"].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-400">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {filteredDms.map(dm => {
                  const isSelected = selectedDM?.id === dm.id;
                  return (
                    <tr key={dm.id} onClick={() => onSelectDM(dm)} className="border-b border-slate-50 last:border-0 cursor-pointer transition-colors"
                      style={{ backgroundColor: isSelected ? "#fff7ed" : "transparent" }}
                      onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = "#f8fafc"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = isSelected ? "#fff7ed" : "transparent"; }}>
                      <td className="px-3 py-2.5 font-semibold text-slate-800">{dm.modele}</td>
                      <td className="px-3 py-2.5 text-slate-500">{dm.marque ?? "—"}</td>
                      <td className="px-3 py-2.5 text-slate-500 font-mono">{dm.serie}</td>
                      <td className="px-3 py-2.5"><StatutBadge statut={dm.statut} /></td>
                      <td className="px-3 py-2.5 text-slate-600">{dm.service ?? "—"}</td>
                      <td className="px-3 py-2.5 text-slate-600">{dm.pms}</td>
                      <td className="px-3 py-2.5" onClick={e => e.stopPropagation()}>
                        {isAdmin ? (
                          <div className="flex items-center gap-1">
                            <IconButton title="Voir la fiche" onClick={() => onSelectDM(dm)} variant="neutral"><IconEye /></IconButton>
                            <IconButton title="Modifier l’équipement" onClick={() => onSelectDM(dm)} variant="edit"><IconPencil /></IconButton>
                            <IconButton title="Supprimer l’équipement" onClick={() => { if (window.confirm("Supprimer « " + dm.modele + " » ?")) onDeleteDM(dm.id); }} variant="danger"><IconTrash /></IconButton>
                          </div>
                        ) : (
                          dm.actions > 0 ? <span className="rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-[10px] font-bold">{dm.actions}</span> : <span className="text-slate-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="rounded-xl bg-white border border-slate-100 shadow-sm p-4" style={{ minHeight: 300 }}>
            <p className="text-xs font-semibold text-slate-500 mb-2">Schéma réseau PSA / gaz médicaux</p>
            <NetworkGraph nodes={data.nodes} edges={data.edges} selectedId={selectedNodeId} onNodeClick={onNodeClick}
              dms={dms} isAdmin={isAdmin} onQuickStatus={onQuickStatus} />
          </div>
        </>
      )}

      {/* ── PIÈCES tab ── */}
      {subTab === "pieces" && (
        <div className="rounded-xl bg-white border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <p className="text-sm font-bold text-slate-800">Pièces nécessaires — {siteKey}</p>
            <p className="text-xs text-slate-500 font-semibold">{fmtEur(siteCost)} total estimé</p>
          </div>

          {/* Add piece form */}
          {showAddPiece && isAdmin && (
            <div className="p-4 border-b border-orange-100 bg-orange-50 flex flex-col gap-2">
              <p className="text-xs font-bold text-orange-700">Nouvelle pièce détachée</p>
              <div>
                <label className={labelCls}>Equipement</label>
                <select value={pDmId} onChange={e => setPDmId(e.target.value)} className={inputCls}>
                  {dms.map(d => <option key={d.id} value={d.id}>{d.modele}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className={labelCls}>Référence *</label><input value={pRef} onChange={e => setPRef(e.target.value)} className={inputCls} placeholder="REF-001" /></div>
                <div><label className={labelCls}>Qté</label><input type="number" min="1" value={pQte} onChange={e => setPQte(e.target.value)} className={inputCls} /></div>
              </div>
              <div><label className={labelCls}>Désignation *</label><input value={pDesig} onChange={e => setPDesig(e.target.value)} className={inputCls} placeholder="Nom de la pièce" /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className={labelCls}>Prix unit. (€) *</label><input type="number" value={pPrix} onChange={e => setPPrix(e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>Urgence</label>
                  <select value={pUrg} onChange={e => setPUrg(e.target.value as Piece["urgence"])} className={inputCls}>
                    <option value="critique">Critique</option><option value="normale">Normale</option><option value="basse">Basse</option>
                  </select>
                </div>
              </div>
              <div><label className={labelCls}>Fournisseur</label><input value={pFour} onChange={e => setPFour(e.target.value)} className={inputCls} placeholder="Optionnel" /></div>
              <div className="flex gap-2">
                <button onClick={submitAddPiece} className={btnSm} style={{ backgroundColor: "#f97316", color: "#fff" }}>+ Ajouter</button>
                <button onClick={() => setShowAddPiece(false)} className={btnSm} style={{ color: "#64748b" }}>Annuler</button>
              </div>
            </div>
          )}

          {allPieces.length === 0 && !showAddPiece ? <p className="text-xs text-slate-400 italic px-4 py-6 text-center">Aucune pièce nécessaire pour ce site</p> : (
            allPieces.length > 0 && (
              <table className="w-full text-xs">
                <thead><tr className="border-b border-slate-50 bg-slate-50">
                  {["Équipement", "Référence", "Désignation", "Qté", "P.U.", "Total", "Urgence", "Fournisseur", ...(isAdmin ? [""] : [])].map((h, i) => (
                    <th key={i} className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-400">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {allPieces.sort((a, b) => URGENCE_ORDER[a.piece.urgence] - URGENCE_ORDER[b.piece.urgence]).map(({ dm, piece }, idx) => {
                    const us = urgenceStyle(piece.urgence);
                    return (
                      <tr key={`${dm.id}-${piece.id}-${idx}`} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                        <td className="px-3 py-2 text-slate-700 font-medium">{dm.modele}</td>
                        <td className="px-3 py-2 font-mono text-slate-500">{piece.reference}</td>
                        <td className="px-3 py-2 text-slate-700">{piece.designation}</td>
                        <td className="px-3 py-2 text-center">{piece.qte}</td>
                        <td className="px-3 py-2">{fmtEur(piece.prixUnit)}</td>
                        <td className="px-3 py-2 font-semibold text-slate-800">{fmtEur(piece.qte * piece.prixUnit)}</td>
                        <td className="px-3 py-2"><span className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: us.bg, color: us.text, border: `1px solid ${us.border}` }}>{piece.urgence}</span></td>
                        <td className="px-3 py-2 text-slate-400">{piece.fournisseur ?? "—"}</td>
                        {isAdmin && (
                          <td className="px-3 py-2">
                            <IconButton title="Supprimer la pièce" onClick={() => deletePiece(dm, piece.id)} variant="danger"><IconTrash /></IconButton>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )
          )}
        </div>
      )}

      {/* ── KITS tab ── */}
      {subTab === "kits" && (
        <div className="rounded-xl bg-white border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <p className="text-sm font-bold text-slate-800">Kits de maintenance — {siteKey}</p>
            <p className="text-xs text-slate-500 font-semibold">{fmtEur(siteKitsCost)} total estimé · {allKits.length} kit(s)</p>
          </div>

          {/* Add kit form */}
          {showAddKit && isAdmin && (
            <div className="p-4 border-b border-purple-100 bg-purple-50 flex flex-col gap-2">
              <p className="text-xs font-bold text-purple-700">Nouveau kit de maintenance</p>
              <div>
                <label className={labelCls}>Equipement</label>
                <select value={kDmId} onChange={e => setKDmId(e.target.value)} className={inputCls}>
                  {dms.map(d => <option key={d.id} value={d.id}>{d.modele}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className={labelCls}>Référence *</label><input value={kRef} onChange={e => setKRef(e.target.value)} className={inputCls} placeholder="KIT-001" /></div>
                <div><label className={labelCls}>Qté</label><input type="number" min="1" value={kQte} onChange={e => setKQte(e.target.value)} className={inputCls} /></div>
              </div>
              <div><label className={labelCls}>Désignation *</label><input value={kDesig} onChange={e => setKDesig(e.target.value)} className={inputCls} placeholder="Nom du kit" /></div>
              <div><label className={labelCls}>Contenu</label><textarea value={kContenu} onChange={e => setKContenu(e.target.value)} className={inputCls} rows={2} placeholder="ex: filtre, joint, courroie..." /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className={labelCls}>Prix unit. (€)</label><input type="number" value={kPrix} onChange={e => setKPrix(e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>Périodicité</label>
                  <select value={kPeriod} onChange={e => setKPeriod(e.target.value as Kit["periodicite"])} className={inputCls}>
                    {KIT_PERIODICITE.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className={labelCls}>Fournisseur</label><input value={kFour} onChange={e => setKFour(e.target.value)} className={inputCls} placeholder="Optionnel" /></div>
                <div><label className={labelCls}>Dernier utilisé</label><input type="date" value={kDernier} onChange={e => setKDernier(e.target.value)} className={inputCls} /></div>
              </div>
              <div className="flex gap-2">
                <button onClick={submitAddKit} className={btnSm} style={{ backgroundColor: "#8b5cf6", color: "#fff" }}>+ Ajouter</button>
                <button onClick={() => setShowAddKit(false)} className={btnSm} style={{ color: "#64748b" }}>Annuler</button>
              </div>
            </div>
          )}

          {allKits.length === 0 && !showAddKit ? <p className="text-xs text-slate-400 italic px-4 py-6 text-center">Aucun kit de maintenance enregistré pour ce site</p> : (
            allKits.length > 0 && (
              <table className="w-full text-xs">
                <thead><tr className="border-b border-slate-50 bg-slate-50">
                  {["Équipement", "Référence", "Désignation", "Périodicité", "Qté", "P.U.", "Total", "Fournisseur", "Dernier", ...(isAdmin ? [""] : [])].map((h, i) => (
                    <th key={i} className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-400">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {allKits.map(({ dm, kit }, idx) => {
                    const ps = periodStyle(kit.periodicite);
                    return (
                      <tr key={`${dm.id}-${kit.id}-${idx}`} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                        <td className="px-3 py-2 text-slate-700 font-medium">{dm.modele}</td>
                        <td className="px-3 py-2 font-mono text-slate-500">{kit.reference}</td>
                        <td className="px-3 py-2 text-slate-700">{kit.designation}</td>
                        <td className="px-3 py-2"><span className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: ps.bg, color: ps.text, border: `1px solid ${ps.border}` }}>{kit.periodicite}</span></td>
                        <td className="px-3 py-2 text-center">{kit.qte}</td>
                        <td className="px-3 py-2">{fmtEur(kit.prixUnit)}</td>
                        <td className="px-3 py-2 font-semibold text-slate-800">{fmtEur(kit.qte * kit.prixUnit)}</td>
                        <td className="px-3 py-2 text-slate-400">{kit.fournisseur ?? "—"}</td>
                        <td className="px-3 py-2 text-slate-400">{kit.dernierUtilise ?? "—"}</td>
                        {isAdmin && (
                          <td className="px-3 py-2">
                            <IconButton title="Supprimer le kit" onClick={() => deleteKit(dm, kit.id)} variant="danger"><IconTrash /></IconButton>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )
          )}
        </div>
      )}
    </div>
  );
}

/* ── Admin Modal ── */
function AdminModal({ onAuth, onClose }: { onAuth: () => void; onClose: () => void }) {
  const [pw, setPw] = useState(""); const [err, setErr] = useState(false);
  function submit() { if (pw === "kbio2026") onAuth(); else { setErr(true); setTimeout(() => setErr(false), 1500); } }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.55)" }}>
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 flex flex-col gap-4">
        <div><p className="text-base font-bold text-slate-900">Mode administrateur</p>
          <p className="text-xs text-slate-400 mt-0.5">Entrez le mot de passe pour accéder aux fonctions d’édition.</p></div>
        <input type="password" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()}
          placeholder="Mot de passe..." className="rounded-lg border px-3 py-2 text-sm focus:outline-none"
          style={{ borderColor: err ? "#ef4444" : "#e2e8f0" }} autoFocus />
        {err && <p className="text-xs text-red-500 -mt-2">Mot de passe incorrect</p>}
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100">Annuler</button>
          <button onClick={submit} className="rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: "#f97316" }}>Connexion</button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ── */
const LS_KEY = "psa-audit-data";
const LS_ACTIONS_KEY = "psa-audit-actions";
const LS_CONTRATS_KEY = "psa-audit-contrats";

export default function AuditRwandaPage() {
  const [view, setView] = useState<View>("DASHBOARD");
  const [allData, setAllData] = useState<Record<SiteKey, SiteData>>(DEFAULT_DATA);
  const [selectedDM, setSelectedDM] = useState<DM | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [contrats, setContrats] = useState<ContratPartage[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [actionsLoaded, setActionsLoaded] = useState(false);
  const [contratsLoaded, setContratsLoaded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [syncError, setSyncError] = useState(false);

  /* ── Helper : merge données sauvegardées ── */
  function mergeLoaded(parsed: Record<string, { dms: DM[] }>) {
    setAllData(prev => {
      const merged = { ...prev };
      for (const sk of SITE_KEYS) {
        if (parsed[sk]?.dms) {
          merged[sk] = { ...prev[sk], dms: (parsed[sk].dms as DM[]).map(d => ({ ...d, historique: d.historique ?? [], pieces: d.pieces ?? [], kits: d.kits ?? [], pannes: d.pannes ?? [] })) };
        }
      }
      return merged;
    });
  }

  /* ── Chargement initial équipements :
       1. Essaie API serveur
       2. Si null ou données par défaut → fallback localStorage
       3. Prend la source avec le plus d'équipements (données les plus riches) ── */
  useEffect(() => {
    async function load() {
      let serverData: Record<string, { dms: DM[] }> | null = null;
      let localData: Record<string, { dms: DM[] }> | null = null;

      try {
        const r = await fetch("/api/psa/data");
        if (r.ok) { const d = await r.json(); if (d) serverData = d; }
      } catch { /* réseau indisponible */ }

      try {
        const raw = localStorage.getItem(LS_KEY);
        if (raw) localData = JSON.parse(raw);
      } catch { /* ignore */ }

      // Compte total d'équipements pour chaque source
      const countDms = (src: Record<string, { dms: DM[] }> | null) =>
        src ? SITE_KEYS.reduce((n, sk) => n + (src[sk]?.dms?.length ?? 0), 0) : 0;

      const serverCount = countDms(serverData);
      const localCount = countDms(localData);

      // Préfère la source avec le plus d'équipements (données réelles > données démo)
      const winner = localCount > serverCount ? localData : (serverData ?? localData);
      if (winner) mergeLoaded(winner);

      setDataLoaded(true);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Sauvegarde équipements (API + localStorage backup)
     Ne sauvegarde PAS si les données sont identiques aux données démo ── */
  const isDefaultData = useMemo(() => {
    const defaultIds = DEFAULT_DATA.BYUMBA.dms.map(d => d.id).join(",");
    const currentIds = allData.BYUMBA.dms.map(d => d.id).join(",");
    return currentIds === defaultIds &&
      allData.CHUK.dms.length === DEFAULT_DATA.CHUK.dms.length &&
      allData.KAGBAYI.dms.length === DEFAULT_DATA.KAGBAYI.dms.length;
  }, [allData]);

  useEffect(() => {
    if (!dataLoaded || isDefaultData) return;
    const payload: Record<string, { dms: DM[] }> = {};
    for (const sk of SITE_KEYS) payload[sk] = { dms: allData[sk].dms };
    try { localStorage.setItem(LS_KEY, JSON.stringify(payload)); } catch { /* ignore */ }
    fetch("/api/psa/data", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      .then(r => { if (!r.ok) setSyncError(true); else setSyncError(false); })
      .catch(() => setSyncError(true));
  }, [allData, dataLoaded, isDefaultData]);

  /* ── Chargement et sauvegarde actions
     Préfère la source avec le plus d'items ── */
  useEffect(() => {
    async function load() {
      let serverActions: ActionItem[] | null = null;
      let localActions: ActionItem[] | null = null;
      try { const r = await fetch("/api/psa/actions"); if (r.ok) { const d = await r.json(); if (d !== null) serverActions = d; } } catch { /* fallback */ }
      try { const raw = localStorage.getItem(LS_ACTIONS_KEY); if (raw) localActions = JSON.parse(raw); } catch { /* ignore */ }
      // Prend la source avec le plus d'actions
      const winner = (localActions?.length ?? 0) > (serverActions?.length ?? 0) ? localActions : (serverActions ?? localActions);
      if (winner) setActions(winner);
      setActionsLoaded(true);
    }
    load();
  }, []);
  useEffect(() => {
    if (!actionsLoaded) return;
    try { localStorage.setItem(LS_ACTIONS_KEY, JSON.stringify(actions)); } catch { /* ignore */ }
    fetch("/api/psa/actions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(actions) }).catch(() => {});
  }, [actions, actionsLoaded]);

  /* ── Chargement et sauvegarde contrats ── */
  useEffect(() => {
    async function load() {
      let serverContrats: ContratPartage[] | null = null;
      let localContrats: ContratPartage[] | null = null;
      try { const r = await fetch("/api/psa/contrats"); if (r.ok) { const d = await r.json(); if (d !== null) serverContrats = d; } } catch { /* fallback */ }
      try { const raw = localStorage.getItem(LS_CONTRATS_KEY); if (raw) localContrats = JSON.parse(raw); } catch { /* ignore */ }
      const winner = (localContrats?.length ?? 0) > (serverContrats?.length ?? 0) ? localContrats : (serverContrats ?? localContrats);
      if (winner) setContrats(winner);
      setContratsLoaded(true);
    }
    load();
  }, []);
  useEffect(() => {
    if (!contratsLoaded) return;
    try { localStorage.setItem(LS_CONTRATS_KEY, JSON.stringify(contrats)); } catch { /* ignore */ }
    fetch("/api/psa/contrats", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(contrats) }).catch(() => {});
  }, [contrats, contratsLoaded]);

  const isSiteView = (v: View): v is SiteKey => v === "BYUMBA" || v === "CHUK" || v === "KAGBAYI";

  function handleSelectDM(dm: DM) { setSelectedDM(dm); setSelectedNodeId(null); }
  function handleNodeClick(nodeId: string) {
    setSelectedNodeId(nodeId);
    if (isSiteView(view)) { const matched = allData[view].dms.find(d => d.id === nodeId); setSelectedDM(matched ?? null); }
  }
  function handleViewChange(v: View) { setView(v); setSelectedDM(null); setSelectedNodeId(null); setSidebarOpen(false); }

  function handleUpdateDM(updatedDM: DM) {
    if (!isSiteView(view)) return;
    setAllData(prev => ({ ...prev, [view]: { ...prev[view], dms: prev[view].dms.map(d => d.id === updatedDM.id ? updatedDM : d) } }));
    setSelectedDM(prev => prev?.id === updatedDM.id ? updatedDM : prev);
  }
  function handleDeleteDM() {
    if (!isSiteView(view) || !selectedDM) return;
    setAllData(prev => ({ ...prev, [view]: { ...prev[view], dms: prev[view].dms.filter(d => d.id !== selectedDM.id) } }));
    setSelectedDM(null); setSelectedNodeId(null);
  }
  function handleDeleteDMById(dmId: string) {
    if (!isSiteView(view)) return;
    setAllData(prev => ({ ...prev, [view]: { ...prev[view], dms: prev[view].dms.filter(d => d.id !== dmId) } }));
    if (selectedDM?.id === dmId) { setSelectedDM(null); setSelectedNodeId(null); }
  }
  function handleAddDM(newDM: DM) {
    if (!isSiteView(view)) return;
    setAllData(prev => ({ ...prev, [view]: { ...prev[view], dms: [...prev[view].dms, newDM] } }));
  }
  function handleQuickStatus(dmId: string, statut: Statut) {
    if (!isSiteView(view)) return;
    setAllData(prev => ({ ...prev, [view]: { ...prev[view], dms: prev[view].dms.map(d => d.id === dmId ? { ...d, statut } : d) } }));
    if (selectedDM?.id === dmId) setSelectedDM(prev => prev ? { ...prev, statut } : null);
  }

  /* Alertes count pour badge sidebar */
  const alertesCount = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const j30 = new Date(today); j30.setDate(j30.getDate() + 30);
    let n = 0;
    for (const sk of SITE_KEYS) {
      for (const dm of allData[sk].dms) {
        if (dm.pms && dm.pms !== "—") { const d = new Date(dm.pms); d.setHours(0, 0, 0, 0); if (d <= j30) n++; }
        if (dm.statut === "Hors service" && criticiteFromClasse(dm.classe) === "Critique") n++;
        if ((dm.pannes ?? []).some(p => p.etat !== "Clôturé")) n++;
      }
    }
    n += actions.filter(a => a.deadline && a.statut !== "Terminé" && new Date(a.deadline) < today).length;
    // Contrats expirant dans les 30 jours ou expirés
    n += contrats.filter(c => { if (!c.dateFin) return false; const d = new Date(c.dateFin); d.setHours(0,0,0,0); return d <= j30; }).length;
    return n;
  }, [allData, actions, contrats]);

  const currentSiteData = isSiteView(view) ? allData[view] : null;

  function headerTitle() {
    if (view === "DASHBOARD") return "Tableau de bord global — 3 sites Rwanda";
    if (view === "PLAN") return "Budget maintenance — pièces et kits";
    if (view === "ACTIONS") return "Plan d’actions — suivi opérationnel";
    if (view === "ALERTES") return "Alertes intelligentes — surveillance active";
    if (view === "CONTRATS") return "Contrats & garanties — gestion centralisée";
    return currentSiteData?.titre ?? view;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f6fb]" style={{ fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}>
      {showAdminModal && <AdminModal onAuth={() => { setIsAdmin(true); setShowAdminModal(false); }} onClose={() => setShowAdminModal(false)} />}

      {/* ── Overlay sidebar mobile ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={[
        "fixed md:relative inset-y-0 left-0 z-30 md:z-auto",
        "flex w-72 md:w-60 h-full shrink-0 flex-col bg-[#0a2540] text-white overflow-y-auto",
        "transition-transform duration-300 ease-in-out",
        sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
      ].join(" ")}>
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f97316] text-white font-bold text-sm">K</div>
          <div><p className="font-bold text-sm leading-tight">Audit Rwanda</p><p className="text-[10px] text-slate-400 leading-tight">Biomédical PSA</p></div>
          {isAdmin && <span className="ml-auto rounded-full bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 shrink-0">ADMIN</span>}
          {/* Bouton fermeture mobile */}
          <button className="md:hidden ml-auto p-1 rounded text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)} aria-label="Fermer le menu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <nav className="flex flex-col gap-1 px-3 py-3">
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 px-2 mb-1">Vues globales</p>
          <button onClick={() => handleViewChange("DASHBOARD")} className="rounded-lg px-3 py-2.5 text-sm font-semibold text-left transition-colors flex items-center gap-2"
            style={{ backgroundColor: view === "DASHBOARD" ? "#f97316" : "transparent", color: view === "DASHBOARD" ? "#fff" : "#94a3b8" }}>
            {"⊞"} Tableau de bord
          </button>
          <button onClick={() => handleViewChange("ACTIONS")} className="rounded-lg px-3 py-2.5 text-sm font-semibold text-left transition-colors flex items-center justify-between"
            style={{ backgroundColor: view === "ACTIONS" ? "#15803d" : "transparent", color: view === "ACTIONS" ? "#fff" : "#94a3b8" }}>
            <span className="flex items-center gap-2">{"☑"} Plan d&apos;actions</span>
            {actions.filter(a => a.statut === "En cours").length > 0 && (
              <span className="rounded-full text-[10px] font-bold px-1.5 py-0.5" style={{ backgroundColor: view === "ACTIONS" ? "rgba(255,255,255,0.25)" : "#15803d", color: "#fff" }}>
                {actions.filter(a => a.statut === "En cours").length}
              </span>
            )}
          </button>
          <button onClick={() => handleViewChange("ALERTES")} className="rounded-lg px-3 py-2.5 text-sm font-semibold text-left transition-colors flex items-center justify-between"
            style={{ backgroundColor: view === "ALERTES" ? "#dc2626" : "transparent", color: view === "ALERTES" ? "#fff" : "#94a3b8" }}>
            <span className="flex items-center gap-2">{"⚠"} Alertes</span>
            {alertesCount > 0 && (
              <span className="rounded-full text-[10px] font-bold px-1.5 py-0.5" style={{ backgroundColor: view === "ALERTES" ? "rgba(255,255,255,0.25)" : "#dc2626", color: "#fff" }}>
                {alertesCount}
              </span>
            )}
          </button>
          <button onClick={() => handleViewChange("CONTRATS")} className="rounded-lg px-3 py-2.5 text-sm font-semibold text-left transition-colors flex items-center justify-between"
            style={{ backgroundColor: view === "CONTRATS" ? "#1d4ed8" : "transparent", color: view === "CONTRATS" ? "#fff" : "#94a3b8" }}>
            <span className="flex items-center gap-2">{"◈"} Contrats</span>
            {contrats.filter(c => { const d = new Date(c.dateFin); d.setHours(0,0,0,0); const today = new Date(); today.setHours(0,0,0,0); return d <= new Date(today.getTime() + 30*86400000); }).length > 0 && (
              <span className="rounded-full text-[10px] font-bold px-1.5 py-0.5" style={{ backgroundColor: view === "CONTRATS" ? "rgba(255,255,255,0.25)" : "#f59e0b", color: "#fff" }}>
                {contrats.filter(c => { const d = new Date(c.dateFin); d.setHours(0,0,0,0); const today = new Date(); today.setHours(0,0,0,0); return d <= new Date(today.getTime() + 30*86400000); }).length}
              </span>
            )}
          </button>
          <button onClick={() => handleViewChange("PLAN")} className="rounded-lg px-3 py-2.5 text-sm font-semibold text-left transition-colors flex items-center gap-2"
            style={{ backgroundColor: view === "PLAN" ? "#8b5cf6" : "transparent", color: view === "PLAN" ? "#fff" : "#94a3b8" }}>
            {"▦"} Budget / Plan
          </button>
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 px-2 mt-2 mb-1">Sites</p>
          {SITE_KEYS.map(sk => {
            const hs = allData[sk].dms.filter(d => d.statut === "Hors service").length;
            return (
              <button key={sk} onClick={() => handleViewChange(sk)} className="rounded-lg px-3 py-2.5 text-sm font-semibold text-left transition-colors flex items-center justify-between"
                style={{ backgroundColor: view === sk ? "#f97316" : "transparent", color: view === sk ? "#fff" : "#94a3b8" }}>
                <span className="flex items-center gap-2">{"⊙"} {sk}</span>
                {hs > 0 && <span className="rounded-full text-[10px] font-bold px-1.5 py-0.5" style={{ backgroundColor: view === sk ? "rgba(255,255,255,0.25)" : "#ef4444", color: "#fff" }}>{hs}</span>}
              </button>
            );
          })}
        </nav>
        <div className="flex-1" />
        <div className="px-3 pb-4 flex flex-col gap-2 border-t border-white/10 pt-3">
          {/* Indicateur sync */}
          {syncError && (
            <div className="rounded px-2 py-1 text-[10px] text-center" style={{ backgroundColor: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca" }}>
              ⚠ Sync hors ligne — données locales
            </div>
          )}
          {isAdmin ? (
            <button onClick={() => setIsAdmin(false)} className="w-full rounded-lg px-3 py-2 text-xs font-semibold text-left" style={{ border: "1px solid #f97316", color: "#f97316" }}>Quitter le mode admin</button>
          ) : (
            <button onClick={() => setShowAdminModal(true)} className="w-full rounded-lg px-3 py-2 text-xs font-semibold text-left flex items-center gap-2" style={{ border: "1px solid rgba(255,255,255,0.15)", color: "#94a3b8" }}>
              {"🔒"} Mode administrateur
            </button>
          )}
        </div>
      </aside>

      {/* ── Zone principale ── */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center border-b border-slate-200 bg-white px-3 md:px-6 py-3 shrink-0 gap-2 md:gap-4">
          {/* Hamburger mobile */}
          <button className="md:hidden flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 text-slate-600"
            onClick={() => setSidebarOpen(true)} aria-label="Menu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="font-bold text-slate-900 text-sm truncate">{headerTitle()}</h1>
            {isSiteView(view) && currentSiteData && <p className="text-[10px] text-slate-400 mt-0.5 hidden sm:block">Mise à jour : {currentSiteData.maj}</p>}
          </div>
          <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
            {isAdmin ? (
              <div className="flex items-center gap-1.5 md:gap-2">
                <span className="hidden sm:inline rounded-full px-3 py-1 text-xs font-bold" style={{ backgroundColor: "#fff7ed", color: "#ea580c", border: "1px solid #fed7aa" }}>✓ Admin</span>
                <button onClick={() => setIsAdmin(false)} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold" style={{ border: "1px solid #f97316", color: "#f97316" }}>Quitter</button>
              </div>
            ) : (
              <button onClick={() => setShowAdminModal(true)} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold flex items-center gap-1"
                style={{ backgroundColor: "#f97316", color: "#fff" }}>{"🔒"} <span className="hidden sm:inline">Admin</span></button>
            )}
            <button onClick={() => window.print()} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold hidden sm:flex items-center gap-1.5"
              style={{ backgroundColor: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0" }}>{"⎙"} Exporter</button>
          </div>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto p-3 md:p-5">
          {view === "DASHBOARD" ? (
            <DashboardView allData={allData} onSelectSite={sk => handleViewChange(sk)} />
          ) : view === "ACTIONS" ? (
            <ActionsView actions={actions} isAdmin={isAdmin} allData={allData}
              onAdd={a => setActions(prev => [...prev, a])}
              onUpdate={a => setActions(prev => prev.map(x => x.id === a.id ? a : x))}
              onDelete={id => setActions(prev => prev.filter(x => x.id !== id))} />
          ) : view === "ALERTES" ? (
            <AlertesView allData={allData} actions={actions} contrats={contrats} />
          ) : view === "CONTRATS" ? (
            <ContratView contrats={contrats} isAdmin={isAdmin}
              onAdd={c => setContrats(prev => [...prev, c])}
              onUpdate={c => setContrats(prev => prev.map(x => x.id === c.id ? c : x))}
              onDelete={id => setContrats(prev => prev.filter(x => x.id !== id))} />
          ) : view === "PLAN" ? (
            <PlanActionView allData={allData} isAdmin={isAdmin} />
          ) : (
            <SiteView siteKey={view as SiteKey} data={allData[view as SiteKey]} selectedDM={selectedDM} selectedNodeId={selectedNodeId}
              onSelectDM={handleSelectDM} onNodeClick={handleNodeClick} isAdmin={isAdmin} onQuickStatus={handleQuickStatus}
              onAddDM={handleAddDM} onUpdateDM={handleUpdateDM} onDeleteDM={handleDeleteDMById} />
          )}
        </div>
      </div>

      {/* ── Panneau droite — drawer mobile, fixe desktop ── */}
      {(isSiteView(view) || selectedDM) && (
        <>
          {/* Overlay mobile (derrière le panneau) */}
          {selectedDM && (
            <div className="fixed inset-0 z-20 bg-black/50 md:hidden"
              onClick={() => { setSelectedDM(null); setSelectedNodeId(null); }} />
          )}
          <aside className={[
            "fixed md:relative inset-y-0 right-0 z-30 md:z-auto",
            "flex w-full max-w-[90vw] md:w-80 h-full shrink-0 flex-col border-l border-slate-200 bg-white overflow-hidden",
            "transition-transform duration-300 ease-in-out",
            selectedDM ? "translate-x-0" : "translate-x-full md:translate-x-0",
          ].join(" ")}>
            <div className="border-b border-slate-100 px-4 py-3 shrink-0 flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Fiche équipement</p>
              {/* Bouton retour mobile */}
              {selectedDM && (
                <button className="md:hidden text-slate-400 hover:text-slate-600 p-1 rounded" onClick={() => { setSelectedDM(null); setSelectedNodeId(null); }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
              )}
            </div>
            <div className="flex-1 overflow-hidden flex flex-col">
              <RightPanel dm={selectedDM} isAdmin={isAdmin && isSiteView(view)} onClose={() => { setSelectedDM(null); setSelectedNodeId(null); }}
                onUpdate={handleUpdateDM} onDelete={handleDeleteDM} />
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
