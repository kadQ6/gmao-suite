import {
  DocH2,
  DocH3,
  DocP,
  DocTable,
  DocTd,
  DocTh,
  DocUl,
} from "@/components/portal/docs/doc-prose";

/** SPEC-GMAO-BACKEND v1.0 — synthese affichee dans le portail. */
export function GmaoBackendSpecContent() {
  return (
    <div className="space-y-10">
      <header className="space-y-2 border-b border-slate-200 pb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-kbio-teal">Specification technique</p>
        <h1 className="text-2xl font-semibold text-kbio-navy">GMAO biomedicale — Backend et donnees (synthese)</h1>
        <p className="text-sm text-slate-600">
          Document <strong>SPEC-GMAO-BACKEND v1.0</strong> — extrait pour consultation dans le portail. Detail complet :
          tables, contraintes, services et endpoints dans le depot technique.
        </p>
      </header>

      <section className="space-y-4">
        <DocH2 id="stack-be">1. Stack backend</DocH2>
        <DocTable>
          <tbody>
            <tr>
              <DocTd>Runtime</DocTd>
              <DocTd>Node.js 20 LTS, TypeScript strict</DocTd>
            </tr>
            <tr>
              <DocTd>Framework</DocTd>
              <DocTd>NestJS (ou Fastify + structure modulaire equivalente)</DocTd>
            </tr>
            <tr>
              <DocTd>ORM / SGBD</DocTd>
              <DocTd>Prisma + PostgreSQL 16+</DocTd>
            </tr>
            <tr>
              <DocTd>Jobs</DocTd>
              <DocTd>Redis + BullMQ (ou pg-boss)</DocTd>
            </tr>
            <tr>
              <DocTd>Auth</DocTd>
              <DocTd>OIDC / SSO + JWT access + refresh</DocTd>
            </tr>
            <tr>
              <DocTd>Fichiers</DocTd>
              <DocTd>S3-compatible, metadonnees en base</DocTd>
            </tr>
            <tr>
              <DocTd>Validation</DocTd>
              <DocTd>Zod ou class-validator</DocTd>
            </tr>
            <tr>
              <DocTd>Logs</DocTd>
              <DocTd>Pino JSON + requestId</DocTd>
            </tr>
          </tbody>
        </DocTable>
      </section>

      <section className="space-y-4">
        <DocH2 id="modules-be">2. Modules backend</DocH2>
        <DocP>
          organization, equipment, numbering, maintenance, protocol, planning, quality, inventory, purchase,
          asset-lifecycle, document, alert, audit, import, reporting — chacun avec controller mince et service
          transactionnel.
        </DocP>
      </section>

      <section className="space-y-4">
        <DocH2 id="tables-be">3. Tables principales (minimum)</DocH2>
        <DocUl>
          <li>users, roles, permissions, user_roles, technician_profiles</li>
          <li>sites, buildings, departments, rooms</li>
          <li>equipment_categories, manufacturers, equipment_models, equipments, equipment_status_history</li>
          <li>corrective_requests, work_orders, corrective_work_orders, work_order_status_history</li>
          <li>work_order_assignments, work_order_spare_part_usages, stock_movements, stock_levels</li>
          <li>spare_parts, stock_locations, number_sequences, audit_logs</li>
          <li>maintenance_protocols, protocol_tasks, preventive_maintenance_plans, quality_controls</li>
          <li>purchase_requests, purchase_orders, equipment_documents, import_batches</li>
        </DocUl>
      </section>

      <section className="space-y-4">
        <DocH2 id="numerotation-be">4. Numerotation</DocH2>
        <DocP>
          Table <code className="text-xs">number_sequences</code> avec verrou ligne (<code className="text-xs">FOR UPDATE</code>
          ) dans transaction ; formats type EQ-SITE-000001, DI-YYYY-000001, CWO-YYYY-000001, PO-YYYY-000001 ; numeros
          jamais reutilises.
        </DocP>
      </section>

      <section className="space-y-4">
        <DocH2 id="regles-be">5. Regles metier critiques</DocH2>
        <DocUl>
          <li>Unicite gmao_number et serial_number (index partiel actifs)</li>
          <li>Changements statut / localisation → historique + audit</li>
          <li>Cloture OT avec pieces : transaction stock + usages</li>
          <li>Multi-site : filtrage systematique selon droits utilisateur</li>
        </DocUl>
      </section>

      <section className="space-y-4">
        <DocH2 id="api-be">6. API REST (prefixe /api/v1)</DocH2>
        <DocH3 id="api-mvp">MVP</DocH3>
        <DocUl>
          <li>POST/GET auth, refresh, me</li>
          <li>CRUD equipements + status + location + history</li>
          <li>DI + conversion OT</li>
          <li>work-orders assign, parts, close</li>
          <li>stock levels, movements in/out</li>
          <li>GET /dashboard/summary</li>
        </DocUl>
      </section>

      <section className="space-y-4">
        <DocH2 id="jobs-be">7. Jobs planifies</DocH2>
        <DocUl>
          <li>Generation preventifs (quotidien)</li>
          <li>Retards preventifs / CQ (quotidien)</li>
          <li>Stock critique (horaire ou quotidien)</li>
          <li>Garanties expirantes (hebdo)</li>
        </DocUl>
      </section>

      <section className="space-y-4">
        <DocH2 id="mvp-be">8. MVP backend — phases</DocH2>
        <DocTable>
          <thead>
            <tr>
              <DocTh>Phase</DocTh>
              <DocTh>Perimetre</DocTh>
            </tr>
          </thead>
          <tbody>
            <tr>
              <DocTd>1</DocTd>
              <DocTd>Orga + EQ + DI/OT + stock lie + audit + numerotation</DocTd>
            </tr>
            <tr>
              <DocTd>2</DocTd>
              <DocTd>Protocoles, preventif planifie, CQ, achats, PDF, alertes riches</DocTd>
            </tr>
            <tr>
              <DocTd>3</DocTd>
              <DocTd>Investissement multi-annees, integrations, BI lourd</DocTd>
            </tr>
          </tbody>
        </DocTable>
      </section>

      <footer className="border-t border-slate-200 pt-6 text-xs text-slate-500">
        Pour le detail des champs SQL, FK, UK et la liste complete des endpoints, se referer au document technique
        complet dans le depot ou demander une exportation PDF.
      </footer>
    </div>
  );
}
