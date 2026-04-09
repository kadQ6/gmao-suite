import {
  DocH2,
  DocH3,
  DocOl,
  DocP,
  DocTable,
  DocTd,
  DocTh,
  DocUl,
} from "@/components/portal/docs/doc-prose";

/** SPEC-GMAO-FRONTEND v1.0 — contenu affiche dans le portail K'BIO. */
export function GmaoFrontendSpecContent() {
  return (
    <div className="space-y-10">
      <header className="space-y-2 border-b border-slate-200 pb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-kbio-teal">Specification technique</p>
        <h1 className="text-2xl font-semibold text-kbio-navy">GMAO biomedicale — Frontend, UX et ecrans</h1>
        <p className="text-sm text-slate-600">
          Document <strong>SPEC-GMAO-FRONTEND v1.0</strong> — aligne sur l&apos;API REST <code className="text-xs">/api/v1</code>, auth JWT
          + refresh, contexte multi-sites.
        </p>
      </header>

      <section className="space-y-4">
        <DocH2 id="stack">1. Stack frontend</DocH2>
        <DocTable>
          <thead>
            <tr>
              <DocTh>Domaine</DocTh>
              <DocTh>Choix</DocTh>
              <DocTh>Rationale</DocTh>
            </tr>
          </thead>
          <tbody>
            <tr>
              <DocTd>Framework</DocTd>
              <DocTd>React 19 + Next.js (App Router)</DocTd>
              <DocTd>SSR partiel, routes, alignement avec stack K&apos;BIO existante.</DocTd>
            </tr>
            <tr>
              <DocTd>Langage</DocTd>
              <DocTd>TypeScript strict</DocTd>
              <DocTd>Types depuis OpenAPI (codegen).</DocTd>
            </tr>
            <tr>
              <DocTd>UI</DocTd>
              <DocTd>Tailwind + shadcn/ui (Radix)</DocTd>
              <DocTd>Accessibilite, rendu sobre « metier ».</DocTd>
            </tr>
            <tr>
              <DocTd>Icones</DocTd>
              <DocTd>lucide-react</DocTd>
              <DocTd></DocTd>
            </tr>
            <tr>
              <DocTd>Etat global</DocTd>
              <DocTd>Zustand (session, site actif)</DocTd>
              <DocTd>Leger ; pas Redux sauf besoin.</DocTd>
            </tr>
            <tr>
              <DocTd>Donnees serveur</DocTd>
              <DocTd>TanStack Query v5</DocTd>
              <DocTd>Cache, invalidation, retries.</DocTd>
            </tr>
            <tr>
              <DocTd>Formulaires</DocTd>
              <DocTd>React Hook Form + Zod</DocTd>
              <DocTd>Perf + schema unique.</DocTd>
            </tr>
            <tr>
              <DocTd>Tableaux</DocTd>
              <DocTd>TanStack Table + virtualisation</DocTd>
              <DocTd>AG Grid si grille type Excel massive.</DocTd>
            </tr>
            <tr>
              <DocTd>Graphiques</DocTd>
              <DocTd>Recharts ou Visx</DocTd>
              <DocTd>KPI dashboard.</DocTd>
            </tr>
            <tr>
              <DocTd>Upload</DocTd>
              <DocTd>react-dropzone + URL presignee S3</DocTd>
              <DocTd></DocTd>
            </tr>
            <tr>
              <DocTd>PDF</DocTd>
              <DocTd>iframe URL signee ou react-pdf</DocTd>
              <DocTd>Apercu PV.</DocTd>
            </tr>
            <tr>
              <DocTd>i18n</DocTd>
              <DocTd>next-intl ou react-i18next</DocTd>
              <DocTd>FR par defaut, EN phase 2.</DocTd>
            </tr>
            <tr>
              <DocTd>QR equipement</DocTd>
              <DocTd>html5-qrcode / zxing</DocTd>
              <DocTd>Scan vers fiche ou recherche.</DocTd>
            </tr>
          </tbody>
        </DocTable>
      </section>

      <section className="space-y-4">
        <DocH2 id="architecture">2. Architecture frontend</DocH2>
        <DocP>
          Arborescence type : <code className="rounded bg-slate-100 px-1 text-xs">app/(app)/</code> avec layout shell ;
          <code className="rounded bg-slate-100 px-1 text-xs"> components/ui</code> (shadcn),{" "}
          <code className="rounded bg-slate-100 px-1 text-xs">components/data-display</code>,{" "}
          <code className="rounded bg-slate-100 px-1 text-xs">modules/&lt;domaine&gt;</code> (equipment, maintenance,
          work-orders, inventory, quality, procurement, dashboard, admin),{" "}
          <code className="rounded bg-slate-100 px-1 text-xs">services/api-client</code> +{" "}
          <code className="rounded bg-slate-100 px-1 text-xs">endpoints/</code>,{" "}
          <code className="rounded bg-slate-100 px-1 text-xs">stores/session-store.ts</code>,{" "}
          <code className="rounded bg-slate-100 px-1 text-xs">hooks/</code>, <code className="rounded bg-slate-100 px-1 text-xs">types/</code>,{" "}
          <code className="rounded bg-slate-100 px-1 text-xs">lib/query-keys.ts</code>,{" "}
          <code className="rounded bg-slate-100 px-1 text-xs">config/navigation.ts</code> (sidebar + permissions).
        </DocP>
        <DocP>
          Regle : les modules regroupent ecrans et hooks metier ; <code className="text-xs">components/ui</code> reste
          generique.
        </DocP>
      </section>

      <section className="space-y-4">
        <DocH2 id="layout">3. Layout global</DocH2>
        <DocH3 id="layout-sidebar">Sidebar</DocH3>
        <DocUl>
          <li>
            <strong>Pilotage</strong> : Dashboard, Rapports (phase 2+)
          </li>
          <li>
            <strong>Parc</strong> : Equipements
          </li>
          <li>
            <strong>Maintenance</strong> : Interventions (DI), Ordres de travail, Planning
          </li>
          <li>
            <strong>Logistique</strong> : Stock / pieces, Kits
          </li>
          <li>
            <strong>Qualite</strong> : Controles qualite
          </li>
          <li>
            <strong>Achats</strong> : Demandes, Commandes, Reception
          </li>
          <li>
            <strong>Patrimoine</strong> : Reforme / renouvellement, Plan d&apos;investissement
          </li>
          <li>
            <strong>Docs</strong> : Documents
          </li>
          <li>
            <strong>Systeme</strong> : Administration
          </li>
        </DocUl>
        <DocH3 id="layout-topbar">Topbar</DocH3>
        <DocUl>
          <li>Recherche globale (command palette ⌘K) : equipements (GMAO, serie), OT, DI</li>
          <li>Selecteur de site (obligatoire si plusieurs sites) — persistance + header API</li>
          <li>Notifications (panneau liste)</li>
          <li>Profil : langue, deconnexion</li>
          <li>Acces rapide : Nouvelle DI, Nouvel OT (selon droits)</li>
        </DocUl>
        <DocH3 id="layout-main">Zone principale</DocH3>
        <DocP>
          PageHeader : titre, fil d&apos;Ariane (Site → Module → Detail), actions primaires. Fiche equipement : layout a
          onglets (Identite | Historique | Maintenance | CQ | Pieces | Documents | Indicateurs).
        </DocP>
      </section>

      <section className="space-y-4">
        <DocH2 id="pages">4. Pages principales</DocH2>
        <DocTable>
          <thead>
            <tr>
              <DocTh>Route type</DocTh>
              <DocTh>Contenu cle</DocTh>
            </tr>
          </thead>
          <tbody>
            <tr>
              <DocTd>/dashboard</DocTd>
              <DocTd>
                KPI (actifs, panne, preventifs retard, DI ouvertes, CQ retard, stock critique), graphiques tendance OT,
                alertes, acces rapide.
              </DocTd>
            </tr>
            <tr>
              <DocTd>/equipment</DocTd>
              <DocTd>Data table, filtres multi-criteres, export Excel API.</DocTd>
            </tr>
            <tr>
              <DocTd>/equipment/[id]</DocTd>
              <DocTd>
                Identite, localisation, statut, actions (DI, OT, doc), onglets historique / maintenances / CQ / pieces /
                documents / indicateurs.
              </DocTd>
            </tr>
            <tr>
              <DocTd>/requests (DI)</DocTd>
              <DocTd>Liste, creation rapide (drawer), detail, affectation, creer OT.</DocTd>
            </tr>
            <tr>
              <DocTd>/work-orders</DocTd>
              <DocTd>Liste filtres ; detail : saisie, pieces, temps, checklist, cloture, PV (phase 2).</DocTd>
            </tr>
            <tr>
              <DocTd>/planning</DocTd>
              <DocTd>Calendrier preventif + CQ + OT ; vues mois/semaine/liste ; filtres site, technicien, equipement.</DocTd>
            </tr>
            <tr>
              <DocTd>/inventory</DocTd>
              <DocTd>Niveaux, mouvements, alertes stock bas.</DocTd>
            </tr>
            <tr>
              <DocTd>/kits</DocTd>
              <DocTd>Liste, composition, liens compatibilite modeles.</DocTd>
            </tr>
            <tr>
              <DocTd>/quality</DocTd>
              <DocTd>Planning, saisie resultat, conformite, actions non-conformite.</DocTd>
            </tr>
            <tr>
              <DocTd>/procurement</DocTd>
              <DocTd>Sous-routes demandes, commandes, reception.</DocTd>
            </tr>
            <tr>
              <DocTd>/lifecycle</DocTd>
              <DocTd>Reforme, renouvellement, plan investissement.</DocTd>
            </tr>
            <tr>
              <DocTd>/documents</DocTd>
              <DocTd>Vue transverse recherche / filtres.</DocTd>
            </tr>
            <tr>
              <DocTd>/admin</DocTd>
              <DocTd>Utilisateurs, roles, parametres, nomenclatures.</DocTd>
            </tr>
          </tbody>
        </DocTable>
      </section>

      <section className="space-y-4">
        <DocH2 id="composants">5. Composants UI metier</DocH2>
        <DocUl>
          <li>AppDataTable (tri, pagination serveur, colonnes persistees)</li>
          <li>FilterBar / FilterSheet (mobile)</li>
          <li>AsyncEntitySelect (recherche API debouncee)</li>
          <li>FormSchema (RHF + Zod)</li>
          <li>ConfirmDialog, DrawerForm</li>
          <li>EquipmentTimeline</li>
          <li>StatusBadge, CriticalityTag</li>
          <li>KpiCard, MiniChart</li>
          <li>MaintenanceCalendar</li>
          <li>FileUploader, PdfViewer</li>
          <li>ToastStack, AlertBanner, CommandPalette, EmptyState, SkeletonPage</li>
        </DocUl>
      </section>

      <section className="space-y-4">
        <DocH2 id="ux">6. UX metier</DocH2>
        <DocH3 id="ux-tech">Techniciens</DocH3>
        <DocUl>
          <li>DI en moins de 30 s : equipement + description courte + priorite</li>
          <li>OT terrain : stepper Diagnostic → Pieces → Cloture</li>
          <li>Checklist obligatoire avant cloture si parametre</li>
          <li>Pieces : stock temps reel a cote de la saisie</li>
          <li>Tablette : sidebar icones ; drawer plutot que modales larges</li>
        </DocUl>
        <DocH3 id="ux-rbm">Responsables biomedicaux</DocH3>
        <DocUl>
          <li>Tableaux denses, colonnes masquables, vues sauvegardees</li>
          <li>Alertes en tete ; drill-down KPI → listes filtrees</li>
        </DocUl>
        <DocH3 id="ux-dir">Direction</DocH3>
        <DocUl>
          <li>Dashboard synthetique (6–8 KPI max), export rapport PDF (phase 3)</li>
        </DocUl>
      </section>

      <section className="space-y-4">
        <DocH2 id="workflows">7. Workflows UX</DocH2>
        <DocOl>
          <li>
            <strong>Panne</strong> : DI → affectation → conversion OT → diagnostic → pieces (stock) → temps → checklist →
            cloture → PV.
          </li>
          <li>
            <strong>Preventif</strong> : planning → OT pre-rempli → realisation → validation eventuelle responsable.
          </li>
          <li>
            <strong>Stock bas</strong> : alerte → demande achat pre-remplie → reception → refresh stock.
          </li>
          <li>
            <strong>Renouvellement</strong> : indicateurs fiche EQ → proposition reforme → validation → plan
            d&apos;investissement.
          </li>
        </DocOl>
      </section>

      <section className="space-y-4">
        <DocH2 id="etat">8. Gestion des etats</DocH2>
        <DocTable>
          <thead>
            <tr>
              <DocTh>Couche</DocTh>
              <DocTh>Role</DocTh>
            </tr>
          </thead>
          <tbody>
            <tr>
              <DocTd>Zustand sessionStore</DocTd>
              <DocTd>user, roles, permissions, activeSiteId ; hydrate depuis /auth/me</DocTd>
            </tr>
            <tr>
              <DocTd>Zustand uiStore</DocTd>
              <DocTd>sidebar, theme, command palette</DocTd>
            </tr>
            <tr>
              <DocTd>TanStack Query</DocTd>
              <DocTd>Cles par module ; invalidation onSuccess mutations</DocTd>
            </tr>
            <tr>
              <DocTd>Erreurs API</DocTd>
              <DocTd>401 refresh/redirect ; 403 page dediee ; 422 erreurs champs</DocTd>
            </tr>
            <tr>
              <DocTd>Optimistic</DocTd>
              <DocTd>Reserve aux actions reversibles ; pas sur stock/OT sans accord backend</DocTd>
            </tr>
          </tbody>
        </DocTable>
      </section>

      <section className="space-y-4">
        <DocH2 id="formulaires">9. Formulaires</DocH2>
        <DocUl>
          <li>Schema Zod par formulaire ; types alignes OpenAPI</li>
          <li>Autocomplete : minimum 2 caracteres, limite resultats</li>
          <li>Listes longues virtualisees</li>
          <li>Preenplissage via query params ou navigation depuis liste</li>
          <li>a11y : aria-invalid, messages lies au champ</li>
        </DocUl>
      </section>

      <section className="space-y-4">
        <DocH2 id="tableaux">10. Tableaux et filtres</DocH2>
        <DocUl>
          <li>Tri : query sort=field:asc ; etat dans URL pour partage de lien</li>
          <li>Filtres combines : cles plates en query string</li>
          <li>Pagination cursor ou offset selon API</li>
          <li>Export : GET .../export ou job async + notification</li>
          <li>Colonnes : menu + persistance localStorage (userId + tableId)</li>
        </DocUl>
      </section>

      <section className="space-y-4">
        <DocH2 id="dashboard-kpi">11. Dashboard et visualisation</DocH2>
        <DocP>
          Widgets depuis <code className="text-xs">GET /dashboard/summary</code> : parc actif, en panne, preventifs
          retard, DI ouvertes, CQ retard, stock critique, cout maintenance (phase 2), MTBF/MTTR (phase 2), top
          defaillants (phase 3). Grille responsive 12 colonnes desktop, 1 colonne mobile.
        </DocP>
      </section>

      <section className="space-y-4">
        <DocH2 id="responsive">12. Responsive</DocH2>
        <DocTable>
          <thead>
            <tr>
              <DocTh>Viewport</DocTh>
              <DocTh>Comportement</DocTh>
            </tr>
          </thead>
          <tbody>
            <tr>
              <DocTd>≥1280px</DocTd>
              <DocTd>Sidebar complete, colonnes table par defaut</DocTd>
            </tr>
            <tr>
              <DocTd>768–1279px</DocTd>
              <DocTd>Sidebar icones, filtres en sheet</DocTd>
            </tr>
            <tr>
              <DocTd>&lt;768px</DocTd>
              <DocTd>Bottom nav optionnelle ; scroll horizontal tables + hint</DocTd>
            </tr>
          </tbody>
        </DocTable>
        <DocP>Zones tactiles ≥ 44px pour actions terrain.</DocP>
      </section>

      <section className="space-y-4">
        <DocH2 id="securite">13. Securite frontend</DocH2>
        <DocUl>
          <li>Preferer cookies httpOnly (BFF) ; eviter localStorage pour access token</li>
          <li>Middleware Next : session avant zone (app)</li>
          <li>Matrice route → permission ; composant Can</li>
          <li>Ne pas exposer stack ; logger requestId support</li>
          <li>Upload : taille max, MIME, message generique si rejet serveur</li>
        </DocUl>
      </section>

      <section className="space-y-4">
        <DocH2 id="mvp">14. MVP frontend</DocH2>
        <DocH3 id="mvp-p1">Phase 1</DocH3>
        <DocUl>
          <li>Login, refresh, /auth/me</li>
          <li>Layout shell + selecteur site</li>
          <li>Dashboard simple</li>
          <li>Liste + fiche equipement</li>
          <li>DI liste + creation + detail + conversion OT</li>
          <li>OT liste + detail + saisie + pieces + cloture</li>
          <li>Stock niveaux + mouvements simples</li>
        </DocUl>
        <DocH3 id="mvp-p2">Phase 2</DocH3>
        <DocUl>
          <li>Planning calendrier, CQ, achats, documents + PDF, kits, exports</li>
        </DocUl>
        <DocH3 id="mvp-p3">Phase 3</DocH3>
        <DocUl>
          <li>Dashboard analytique, investissement, mobile offline (hors scope initial)</li>
        </DocUl>
      </section>

      <section className="space-y-4">
        <DocH2 id="roadmap">15. Roadmap implementation</DocH2>
        <DocTable>
          <thead>
            <tr>
              <DocTh>Sprint</DocTh>
              <DocTh>Livrables</DocTh>
            </tr>
          </thead>
          <tbody>
            <tr>
              <DocTd>S1</DocTd>
              <DocTd>Auth, layout, navigation config, client API, Query provider, design tokens</DocTd>
            </tr>
            <tr>
              <DocTd>S2</DocTd>
              <DocTd>Equipements liste + fiche + timeline</DocTd>
            </tr>
            <tr>
              <DocTd>S3</DocTd>
              <DocTd>DI + OT liste/detail + formulaires Zod</DocTd>
            </tr>
            <tr>
              <DocTd>S4</DocTd>
              <DocTd>Stock + integration pieces OT</DocTd>
            </tr>
            <tr>
              <DocTd>S5</DocTd>
              <DocTd>Dashboard summary + alertes</DocTd>
            </tr>
            <tr>
              <DocTd>S6–S8</DocTd>
              <DocTd>Planning, CQ, procurement, documents, kits, admin</DocTd>
            </tr>
            <tr>
              <DocTd>S9</DocTd>
              <DocTd>Responsive, i18n EN, perf (virtualisation), E2E Playwright parcours panne</DocTd>
            </tr>
          </tbody>
        </DocTable>
        <DocP>
          <strong>Definition of Done</strong> : focus visible, Lighthouse perf dashboard cible &gt; 85, E2E sur workflow
          curatif complet.
        </DocP>
      </section>

      <footer className="border-t border-slate-200 pt-6 text-xs text-slate-500">
        Document interne K&apos;BIO Conseil — evolution suivant les releases produit. Reference implementation : stack
        decrite section 1.
      </footer>
    </div>
  );
}
