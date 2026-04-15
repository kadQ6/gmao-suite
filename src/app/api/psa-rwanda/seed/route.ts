import { NextResponse } from "next/server";
import { PsaEquipmentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/psa-rwanda/seed
 *
 * Idempotent seed: deletes existing PSA data then inserts 3 Rwanda sites
 * with realistic PSA (Pressure Swing Adsorption) oxygen plant equipment,
 * maintenance history, and spare-parts needs.
 */
export async function POST() {
  // Wipe existing PSA demo data (cascade deletes children)
  await prisma.psaPieceNeed.deleteMany();
  await prisma.psaMaintenance.deleteMany();
  await prisma.psaEquipment.deleteMany();
  await prisma.psaSite.deleteMany();

  // ── 3 PSA sites audited in Rwanda ───────────────────────────
  const sites = await Promise.all([
    prisma.psaSite.create({
      data: {
        code: "PSA-RW-01",
        nom: "Hôpital de District de Kibagabaga",
        localisation: "Kigali, Gasabo",
        region: "Kigali",
        capaciteO2: "50 Nm³/h",
        description:
          "PSA oxygène installé en 2021. Unité principale alimentant le bloc opératoire, la réanimation et les urgences. Audit réalisé en mars 2026.",
        contactNom: "Dr. MUKAMANA Jeanne",
        contactTel: "+250 788 123 456",
        latitude: -1.9403,
        longitude: 30.1048,
      },
    }),
    prisma.psaSite.create({
      data: {
        code: "PSA-RW-02",
        nom: "Hôpital de District de Rwamagana",
        localisation: "Rwamagana, Province de l'Est",
        region: "Est",
        capaciteO2: "30 Nm³/h",
        description:
          "PSA de capacité moyenne installé en 2022 par NOVAIR. Dessert les services de médecine interne, pédiatrie et maternité. Audit réalisé en mars 2026.",
        contactNom: "Ing. HABIMANA Patrick",
        contactTel: "+250 788 654 321",
        latitude: -1.9498,
        longitude: 30.4345,
      },
    }),
    prisma.psaSite.create({
      data: {
        code: "PSA-RW-03",
        nom: "Hôpital de District de Nyagatare",
        localisation: "Nyagatare, Province de l'Est",
        region: "Est",
        capaciteO2: "20 Nm³/h",
        description:
          "Plus petite unité PSA, installée en 2023. Usage principalement en médecine interne et urgences. Audit réalisé en mars 2026.",
        contactNom: "RWANYIRU Jose",
        contactTel: "+250 788 987 654",
        latitude: -1.2917,
        longitude: 30.3278,
      },
    }),
  ]);

  const [siteKiba, siteRwam, siteNyag] = sites;

  // ── Helper to create equipment + maintenance + spare parts ──
  type EquipSeed = {
    siteId: string;
    code: string;
    designation: string;
    marque: string;
    modele: string;
    type: string;
    numeroSerie: string;
    statut: PsaEquipmentStatus;
    dateMiseEnService: Date;
    dateFinGarantie?: Date;
    observation?: string;
    maintenances: {
      dateMaintenance: Date;
      type: string;
      description: string;
      technicien: string;
      dureeHeures: number;
      resultat: string;
      piecesUtilisees?: string;
      kitMaintenance?: string;
      coutTotal?: number;
      numeroPV: string;
    }[];
    pieces: {
      designation: string;
      reference?: string;
      quantite: number;
      prixUnitaire: number;
      fournisseur?: string;
      urgence: boolean;
      enStock: boolean;
      commandee: boolean;
      observations?: string;
    }[];
  };

  const equipData: EquipSeed[] = [
    // ═══════════════════════════════════════════════════════════
    // SITE 1 — Kibagabaga (50 Nm³/h) — 8 equipment
    // ═══════════════════════════════════════════════════════════
    {
      siteId: siteKiba.id,
      code: "PSA-RW01-COMP-01",
      designation: "Compresseur d'air principal",
      marque: "Atlas Copco",
      modele: "GA 30+",
      type: "Compresseur à vis",
      numeroSerie: "AC-GA30-2021-4587",
      statut: "FONCTIONNEL",
      dateMiseEnService: new Date("2021-06-15"),
      dateFinGarantie: new Date("2024-06-15"),
      maintenances: [
        {
          dateMaintenance: new Date("2025-12-10"),
          type: "Préventive",
          description: "Remplacement filtre air + filtre huile + séparateur air/huile. Vidange 8L huile Roto-Xtend.",
          technicien: "HAKITIMANA Fabrice",
          dureeHeures: 4,
          resultat: "Conforme",
          piecesUtilisees: "Filtre air 1621 7378 00, Filtre huile 1613 6105 00, Séparateur 2906 0564 00, Huile Roto-Xtend 8L",
          kitMaintenance: "Kit PM-4000h Atlas Copco GA30",
          coutTotal: 850,
          numeroPV: "PV-KIB-2025-001",
        },
        {
          dateMaintenance: new Date("2026-03-15"),
          type: "Corrective",
          description: "Alarme haute température. Nettoyage échangeur + vérification ventilateur refroidissement.",
          technicien: "HAKITIMANA Fabrice",
          dureeHeures: 3,
          resultat: "Résolu",
          piecesUtilisees: "Courroie ventilateur",
          coutTotal: 120,
          numeroPV: "PV-KIB-2026-002",
        },
      ],
      pieces: [],
    },
    {
      siteId: siteKiba.id,
      code: "PSA-RW01-COMP-02",
      designation: "Compresseur d'air de secours",
      marque: "Atlas Copco",
      modele: "GA 30+",
      type: "Compresseur à vis",
      numeroSerie: "AC-GA30-2021-4588",
      statut: "EN_PANNE",
      dateMiseEnService: new Date("2021-06-15"),
      dateFinGarantie: new Date("2024-06-15"),
      observation: "Roulement moteur HS — bruit anormal constaté lors de l'audit du 12/03/2026. Arrêt immédiat.",
      maintenances: [
        {
          dateMaintenance: new Date("2026-03-12"),
          type: "Corrective",
          description: "Diagnostic panne roulement moteur. Bruit métallique, vibrations excessives. Arrêt de sécurité déclenché.",
          technicien: "HAKITIMANA Fabrice",
          dureeHeures: 2,
          resultat: "Non résolu — pièce manquante",
          numeroPV: "PV-KIB-2026-003",
        },
      ],
      pieces: [
        {
          designation: "Roulement moteur 6312-2RS",
          reference: "SKF-6312-2RS1",
          quantite: 2,
          prixUnitaire: 185,
          fournisseur: "Atlas Copco / SKF",
          urgence: true,
          enStock: false,
          commandee: false,
          observations: "Indispensable pour remise en service du compresseur de secours",
        },
        {
          designation: "Kit joints moteur GA30",
          reference: "AC-2906-0883-00",
          quantite: 1,
          prixUnitaire: 95,
          fournisseur: "Atlas Copco",
          urgence: true,
          enStock: false,
          commandee: false,
        },
      ],
    },
    {
      siteId: siteKiba.id,
      code: "PSA-RW01-SECH-01",
      designation: "Sécheur d'air par adsorption",
      marque: "Atlas Copco",
      modele: "CD 35+",
      type: "Sécheur par adsorption",
      numeroSerie: "AC-CD35-2021-1102",
      statut: "FONCTIONNEL",
      dateMiseEnService: new Date("2021-06-15"),
      maintenances: [
        {
          dateMaintenance: new Date("2025-09-20"),
          type: "Préventive",
          description: "Remplacement cartouches dessiccant (alumine activée). Vérification vannes de commutation.",
          technicien: "RWANGWA Bosco",
          dureeHeures: 6,
          resultat: "Conforme",
          piecesUtilisees: "Alumine activée 2x25kg",
          coutTotal: 620,
          numeroPV: "PV-KIB-2025-004",
        },
      ],
      pieces: [
        {
          designation: "Alumine activée grade F-200 (sac 25kg)",
          reference: "ALU-F200-25",
          quantite: 2,
          prixUnitaire: 210,
          fournisseur: "BASF / local",
          urgence: false,
          enStock: false,
          commandee: false,
          observations: "Stock tampon recommandé pour prochain remplacement",
        },
      ],
    },
    {
      siteId: siteKiba.id,
      code: "PSA-RW01-GEN-01",
      designation: "Générateur d'oxygène PSA",
      marque: "NOVAIR",
      modele: "NOVOXY 600",
      type: "Générateur O₂ PSA",
      numeroSerie: "NOV-600-2021-RW-001",
      statut: "FONCTIONNEL",
      dateMiseEnService: new Date("2021-07-01"),
      maintenances: [
        {
          dateMaintenance: new Date("2025-07-01"),
          type: "Préventive",
          description: "Maintenance annuelle complète : vérification colonnes zéolite, test pureté O₂ (93.2%), étalonnage analyseur, contrôle vannes.",
          technicien: "HAKITIMANA Fabrice",
          dureeHeures: 8,
          resultat: "Conforme — pureté 93.2%",
          kitMaintenance: "Kit annuel NOVOXY 600",
          coutTotal: 1200,
          numeroPV: "PV-KIB-2025-005",
        },
        {
          dateMaintenance: new Date("2026-01-15"),
          type: "Préventive",
          description: "Contrôle semestriel : pureté O₂ 92.8%, pression colonnes OK, vannes OK.",
          technicien: "RWANGWA Bosco",
          dureeHeures: 3,
          resultat: "Conforme — pureté 92.8%",
          numeroPV: "PV-KIB-2026-001",
        },
      ],
      pieces: [
        {
          designation: "Zéolite OXYSIV MDX (fût 100L)",
          reference: "UOP-MDX-100L",
          quantite: 1,
          prixUnitaire: 3500,
          fournisseur: "Honeywell UOP",
          urgence: false,
          enStock: false,
          commandee: false,
          observations: "Prochaine recharge estimée dans 18 mois",
        },
      ],
    },
    {
      siteId: siteKiba.id,
      code: "PSA-RW01-RES-01",
      designation: "Réservoir tampon O₂ (1000L)",
      marque: "NOVAIR",
      modele: "RES-1000-OX",
      type: "Réservoir tampon",
      numeroSerie: "NOV-RES-2021-008",
      statut: "FONCTIONNEL",
      dateMiseEnService: new Date("2021-07-01"),
      maintenances: [
        {
          dateMaintenance: new Date("2025-07-01"),
          type: "Préventive",
          description: "Contrôle visuel, test soupape de sécurité, vérification manomètre.",
          technicien: "RWANYIRU Jose",
          dureeHeures: 1.5,
          resultat: "Conforme",
          numeroPV: "PV-KIB-2025-006",
        },
      ],
      pieces: [],
    },
    {
      siteId: siteKiba.id,
      code: "PSA-RW01-ANA-01",
      designation: "Analyseur de pureté O₂",
      marque: "Teledyne",
      modele: "3000TA",
      type: "Analyseur O₂",
      numeroSerie: "TEL-3000-2021-2244",
      statut: "EN_ATTENTE",
      dateMiseEnService: new Date("2021-07-01"),
      observation: "Cellule de mesure en fin de vie. Mesures erratiques. Fonctionne mais non fiable — remplacement cellule nécessaire.",
      maintenances: [
        {
          dateMaintenance: new Date("2026-03-12"),
          type: "Corrective",
          description: "Cellule galvanique en fin de vie. Lectures fluctuent entre 88% et 96%. Calibration impossible à stabiliser.",
          technicien: "HAKITIMANA Fabrice",
          dureeHeures: 1,
          resultat: "Non résolu — pièce commandée",
          numeroPV: "PV-KIB-2026-004",
        },
      ],
      pieces: [
        {
          designation: "Cellule O₂ galvanique Teledyne C-3",
          reference: "TEL-C3-CELL",
          quantite: 1,
          prixUnitaire: 380,
          fournisseur: "Teledyne Analytical",
          urgence: true,
          enStock: false,
          commandee: true,
          observations: "Commandée le 20/03/2026, délai 4-6 semaines",
        },
      ],
    },
    {
      siteId: siteKiba.id,
      code: "PSA-RW01-FILL-01",
      designation: "Station de remplissage bouteilles",
      marque: "NOVAIR",
      modele: "NOXFILL 200",
      type: "Rampe remplissage",
      numeroSerie: "NOV-FILL-2021-RW-003",
      statut: "FONCTIONNEL",
      dateMiseEnService: new Date("2021-08-01"),
      maintenances: [
        {
          dateMaintenance: new Date("2025-11-20"),
          type: "Préventive",
          description: "Remplacement joints haute pression, test étanchéité réseau, vérification détendeurs.",
          technicien: "RWANGWA Bosco",
          dureeHeures: 4,
          resultat: "Conforme",
          piecesUtilisees: "Kit joints HP NOXFILL",
          coutTotal: 280,
          numeroPV: "PV-KIB-2025-007",
        },
      ],
      pieces: [],
    },
    {
      siteId: siteKiba.id,
      code: "PSA-RW01-BOOST-01",
      designation: "Surpresseur haute pression",
      marque: "NOVAIR",
      modele: "BOOST-200",
      type: "Surpresseur HP",
      numeroSerie: "NOV-BOOST-2021-005",
      statut: "EN_PANNE",
      dateMiseEnService: new Date("2021-08-01"),
      observation: "Clapet anti-retour HP bloqué. Station de remplissage opérationnelle en mode dégradé (pression réduite).",
      maintenances: [
        {
          dateMaintenance: new Date("2026-02-05"),
          type: "Corrective",
          description: "Clapet anti-retour HP bloqué en position ouverte. Pression insuffisante pour remplissage complet des bouteilles.",
          technicien: "HAKITIMANA Fabrice",
          dureeHeures: 2,
          resultat: "Non résolu — pièce non disponible",
          numeroPV: "PV-KIB-2026-005",
        },
      ],
      pieces: [
        {
          designation: "Clapet anti-retour HP 200 bar",
          reference: "NOV-CLAP-HP-200",
          quantite: 1,
          prixUnitaire: 450,
          fournisseur: "NOVAIR",
          urgence: true,
          enStock: false,
          commandee: false,
          observations: "Critique pour remise en pression complète du surpresseur",
        },
        {
          designation: "Kit joints HP surpresseur BOOST-200",
          reference: "NOV-KIT-BOOST-HP",
          quantite: 1,
          prixUnitaire: 320,
          fournisseur: "NOVAIR",
          urgence: false,
          enStock: false,
          commandee: false,
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════
    // SITE 2 — Rwamagana (30 Nm³/h) — 7 equipment
    // ═══════════════════════════════════════════════════════════
    {
      siteId: siteRwam.id,
      code: "PSA-RW02-COMP-01",
      designation: "Compresseur d'air principal",
      marque: "Atlas Copco",
      modele: "GA 22",
      type: "Compresseur à vis",
      numeroSerie: "AC-GA22-2022-7891",
      statut: "FONCTIONNEL",
      dateMiseEnService: new Date("2022-03-20"),
      dateFinGarantie: new Date("2025-03-20"),
      maintenances: [
        {
          dateMaintenance: new Date("2025-09-15"),
          type: "Préventive",
          description: "PM 4000h : vidange, filtres air/huile/séparateur.",
          technicien: "HABIMANA Patrick",
          dureeHeures: 4,
          resultat: "Conforme",
          kitMaintenance: "Kit PM-4000h Atlas Copco GA22",
          coutTotal: 720,
          numeroPV: "PV-RWA-2025-001",
        },
      ],
      pieces: [],
    },
    {
      siteId: siteRwam.id,
      code: "PSA-RW02-SECH-01",
      designation: "Sécheur d'air frigorifique",
      marque: "Atlas Copco",
      modele: "FX 11",
      type: "Sécheur frigorifique",
      numeroSerie: "AC-FX11-2022-3344",
      statut: "EN_PANNE",
      dateMiseEnService: new Date("2022-03-20"),
      observation: "Fuite de réfrigérant R134a. Point de rosée non conforme (+12°C au lieu de +3°C). Recharge nécessaire après réparation.",
      maintenances: [
        {
          dateMaintenance: new Date("2026-02-18"),
          type: "Corrective",
          description: "Fuite réfrigérant détectée au raccord compresseur frigorifique. Gaz R134a insuffisant. Point de rosée dégradé.",
          technicien: "HABIMANA Patrick",
          dureeHeures: 2,
          resultat: "Non résolu — brasure et recharge requises",
          numeroPV: "PV-RWA-2026-001",
        },
      ],
      pieces: [
        {
          designation: "Gaz réfrigérant R134a (bouteille 12kg)",
          reference: "R134A-12KG",
          quantite: 1,
          prixUnitaire: 95,
          fournisseur: "Froid local Kigali",
          urgence: true,
          enStock: false,
          commandee: false,
        },
        {
          designation: "Baguette brasure cuivre-argent",
          reference: "BRAS-CU-AG-2mm",
          quantite: 5,
          prixUnitaire: 8,
          fournisseur: "Froid local Kigali",
          urgence: true,
          enStock: true,
          commandee: false,
        },
      ],
    },
    {
      siteId: siteRwam.id,
      code: "PSA-RW02-GEN-01",
      designation: "Générateur d'oxygène PSA",
      marque: "NOVAIR",
      modele: "NOVOXY 350",
      type: "Générateur O₂ PSA",
      numeroSerie: "NOV-350-2022-RW-010",
      statut: "FONCTIONNEL",
      dateMiseEnService: new Date("2022-04-01"),
      maintenances: [
        {
          dateMaintenance: new Date("2026-03-10"),
          type: "Préventive",
          description: "Maintenance annuelle : pureté O₂ 93.5%, colonnes conformes, vannes OK, analyseur calibré.",
          technicien: "HAKITIMANA Fabrice",
          dureeHeures: 6,
          resultat: "Conforme — pureté 93.5%",
          kitMaintenance: "Kit annuel NOVOXY 350",
          coutTotal: 980,
          numeroPV: "PV-RWA-2026-002",
        },
      ],
      pieces: [],
    },
    {
      siteId: siteRwam.id,
      code: "PSA-RW02-RES-01",
      designation: "Réservoir tampon O₂ (500L)",
      marque: "NOVAIR",
      modele: "RES-500-OX",
      type: "Réservoir tampon",
      numeroSerie: "NOV-RES-2022-015",
      statut: "FONCTIONNEL",
      dateMiseEnService: new Date("2022-04-01"),
      maintenances: [
        {
          dateMaintenance: new Date("2026-03-10"),
          type: "Préventive",
          description: "Contrôle visuel cuve, test soupape, vérification manomètre.",
          technicien: "HAKITIMANA Fabrice",
          dureeHeures: 1,
          resultat: "Conforme",
          numeroPV: "PV-RWA-2026-003",
        },
      ],
      pieces: [],
    },
    {
      siteId: siteRwam.id,
      code: "PSA-RW02-ANA-01",
      designation: "Analyseur de pureté O₂",
      marque: "Teledyne",
      modele: "3000TA",
      type: "Analyseur O₂",
      numeroSerie: "TEL-3000-2022-5566",
      statut: "FONCTIONNEL",
      dateMiseEnService: new Date("2022-04-01"),
      maintenances: [],
      pieces: [
        {
          designation: "Cellule O₂ galvanique Teledyne C-3 (remplacement préventif)",
          reference: "TEL-C3-CELL",
          quantite: 1,
          prixUnitaire: 380,
          fournisseur: "Teledyne Analytical",
          urgence: false,
          enStock: false,
          commandee: false,
          observations: "Cellule actuelle OK mais recommandé d'en avoir une de stock",
        },
      ],
    },
    {
      siteId: siteRwam.id,
      code: "PSA-RW02-RESEAU-01",
      designation: "Réseau de distribution O₂ (cuivre médical)",
      marque: "Installation locale",
      modele: "Réseau Cu DN15/DN22",
      type: "Réseau distribution",
      numeroSerie: "N/A",
      statut: "EN_ATTENTE",
      dateMiseEnService: new Date("2022-04-15"),
      observation: "Deux prises murales défectueuses au service Pédiatrie (+fuites constatées). Réseau fonctionnel mais dégradé.",
      maintenances: [
        {
          dateMaintenance: new Date("2026-03-11"),
          type: "Corrective",
          description: "2 prises murales BS (AFNOR) défectueuses en Pédiatrie — fuite détectée au savonnage. 1 détendeur mural grippé en Médecine Interne.",
          technicien: "RWANGWA Bosco",
          dureeHeures: 3,
          resultat: "Partiel — 1 prise remplacée, 2 en attente",
          piecesUtilisees: "1x prise murale AFNOR O₂",
          coutTotal: 85,
          numeroPV: "PV-RWA-2026-004",
        },
      ],
      pieces: [
        {
          designation: "Prise murale AFNOR O₂ BS",
          reference: "PM-AFNOR-O2",
          quantite: 2,
          prixUnitaire: 65,
          fournisseur: "Air Liquide Medical / local",
          urgence: true,
          enStock: false,
          commandee: false,
        },
        {
          designation: "Détendeur mural O₂ 0-15 L/min",
          reference: "DET-O2-15L",
          quantite: 1,
          prixUnitaire: 120,
          fournisseur: "Air Liquide Medical",
          urgence: false,
          enStock: false,
          commandee: false,
        },
      ],
    },
    {
      siteId: siteRwam.id,
      code: "PSA-RW02-ELEC-01",
      designation: "Armoire électrique / Automate PSA",
      marque: "Siemens",
      modele: "S7-1200 + HMI KTP700",
      type: "Automate + supervision",
      numeroSerie: "SIE-S7-2022-RW-042",
      statut: "FONCTIONNEL",
      dateMiseEnService: new Date("2022-03-20"),
      maintenances: [
        {
          dateMaintenance: new Date("2026-03-10"),
          type: "Préventive",
          description: "Vérification automate, test séquences sécurité, nettoyage armoire, serrage borniers. Sauvegarde programme API.",
          technicien: "HABIMANA Patrick",
          dureeHeures: 3,
          resultat: "Conforme",
          numeroPV: "PV-RWA-2026-005",
        },
      ],
      pieces: [],
    },

    // ═══════════════════════════════════════════════════════════
    // SITE 3 — Nyagatare (20 Nm³/h) — 6 equipment
    // ═══════════════════════════════════════════════════════════
    {
      siteId: siteNyag.id,
      code: "PSA-RW03-COMP-01",
      designation: "Compresseur d'air principal",
      marque: "Kaeser",
      modele: "ASD 40",
      type: "Compresseur à vis",
      numeroSerie: "KAE-ASD40-2023-1122",
      statut: "FONCTIONNEL",
      dateMiseEnService: new Date("2023-01-15"),
      dateFinGarantie: new Date("2026-01-15"),
      maintenances: [
        {
          dateMaintenance: new Date("2025-07-10"),
          type: "Préventive",
          description: "PM 2000h : remplacement filtre air, filtre huile. Vidange Sigma Fluid S-460.",
          technicien: "RWANYIRU Jose",
          dureeHeures: 3,
          resultat: "Conforme",
          kitMaintenance: "Kit PM-2000h Kaeser ASD40",
          coutTotal: 580,
          numeroPV: "PV-NYA-2025-001",
        },
      ],
      pieces: [
        {
          designation: "Filtre air Kaeser ASD40",
          reference: "KAE-6.2182.0",
          quantite: 1,
          prixUnitaire: 65,
          fournisseur: "Kaeser",
          urgence: false,
          enStock: true,
          commandee: false,
          observations: "Stock 1 unité pour PM suivante",
        },
      ],
    },
    {
      siteId: siteNyag.id,
      code: "PSA-RW03-SECH-01",
      designation: "Sécheur d'air par adsorption",
      marque: "Kaeser",
      modele: "DC 9.0",
      type: "Sécheur par adsorption",
      numeroSerie: "KAE-DC9-2023-8877",
      statut: "FONCTIONNEL",
      dateMiseEnService: new Date("2023-01-15"),
      maintenances: [
        {
          dateMaintenance: new Date("2026-01-20"),
          type: "Préventive",
          description: "Contrôle sonde point de rosée, vérification cycle régénération, nettoyage filtres.",
          technicien: "RWANYIRU Jose",
          dureeHeures: 2,
          resultat: "Conforme",
          numeroPV: "PV-NYA-2026-001",
        },
      ],
      pieces: [],
    },
    {
      siteId: siteNyag.id,
      code: "PSA-RW03-GEN-01",
      designation: "Générateur d'oxygène PSA",
      marque: "NOVAIR",
      modele: "NOVOXY 200",
      type: "Générateur O₂ PSA",
      numeroSerie: "NOV-200-2023-RW-020",
      statut: "EN_PANNE",
      dateMiseEnService: new Date("2023-02-01"),
      observation: "Électrovanne colonne B bloquée fermée. Production O₂ réduite à 60% de la capacité nominale. Pureté 89.5% (seuil min = 90%).",
      maintenances: [
        {
          dateMaintenance: new Date("2026-03-14"),
          type: "Corrective",
          description: "Pureté O₂ tombée à 89.5%. Diagnostic : électrovanne colonne B bloquée en position fermée. Cycle PSA asymétrique.",
          technicien: "HAKITIMANA Fabrice",
          dureeHeures: 4,
          resultat: "Non résolu — pièce en attente",
          numeroPV: "PV-NYA-2026-002",
        },
        {
          dateMaintenance: new Date("2025-08-01"),
          type: "Préventive",
          description: "Maintenance annuelle : pureté 93.1%, colonnes OK, vannes OK.",
          technicien: "RWANYIRU Jose",
          dureeHeures: 5,
          resultat: "Conforme — pureté 93.1%",
          kitMaintenance: "Kit annuel NOVOXY 200",
          coutTotal: 750,
          numeroPV: "PV-NYA-2025-002",
        },
      ],
      pieces: [
        {
          designation: "Électrovanne PSA 2 voies ASCO (colonne B)",
          reference: "ASCO-SCG353A047",
          quantite: 1,
          prixUnitaire: 890,
          fournisseur: "Emerson / ASCO",
          urgence: true,
          enStock: false,
          commandee: false,
          observations: "CRITIQUE : sans cette pièce, le PSA ne produit qu'à 60%. Pureté en dessous du seuil",
        },
        {
          designation: "Kit membrane électrovanne ASCO (préventif)",
          reference: "ASCO-KIT-302280",
          quantite: 2,
          prixUnitaire: 145,
          fournisseur: "Emerson / ASCO",
          urgence: false,
          enStock: false,
          commandee: false,
          observations: "Pour maintenance préventive des autres vannes",
        },
      ],
    },
    {
      siteId: siteNyag.id,
      code: "PSA-RW03-RES-01",
      designation: "Réservoir tampon O₂ (300L)",
      marque: "NOVAIR",
      modele: "RES-300-OX",
      type: "Réservoir tampon",
      numeroSerie: "NOV-RES-2023-021",
      statut: "FONCTIONNEL",
      dateMiseEnService: new Date("2023-02-01"),
      maintenances: [
        {
          dateMaintenance: new Date("2026-01-20"),
          type: "Préventive",
          description: "Contrôle visuel, test soupape, vérification pression.",
          technicien: "RWANYIRU Jose",
          dureeHeures: 1,
          resultat: "Conforme",
          numeroPV: "PV-NYA-2026-003",
        },
      ],
      pieces: [],
    },
    {
      siteId: siteNyag.id,
      code: "PSA-RW03-ANA-01",
      designation: "Analyseur de pureté O₂",
      marque: "Teledyne",
      modele: "3000TA",
      type: "Analyseur O₂",
      numeroSerie: "TEL-3000-2023-9988",
      statut: "FONCTIONNEL",
      dateMiseEnService: new Date("2023-02-01"),
      maintenances: [],
      pieces: [],
    },
    {
      siteId: siteNyag.id,
      code: "PSA-RW03-ELEC-01",
      designation: "Armoire électrique / Automate PSA",
      marque: "Schneider",
      modele: "M241 + Magelis HMI",
      type: "Automate + supervision",
      numeroSerie: "SCH-M241-2023-RW-055",
      statut: "EN_ATTENTE",
      dateMiseEnService: new Date("2023-01-15"),
      observation: "Écran HMI Magelis avec pixel mort et rétroéclairage faible. Lisibilité réduite. Fonctionnel mais remplacement recommandé.",
      maintenances: [
        {
          dateMaintenance: new Date("2026-03-14"),
          type: "Préventive",
          description: "Contrôle automate OK. HMI Magelis : rétroéclairage dégradé, zone pixel mort en haut à droite. Fonctionnement API non impacté.",
          technicien: "HAKITIMANA Fabrice",
          dureeHeures: 2,
          resultat: "Partiel — HMI à remplacer",
          numeroPV: "PV-NYA-2026-004",
        },
      ],
      pieces: [
        {
          designation: "Écran HMI Schneider Magelis HMIGXU3512",
          reference: "HMIGXU3512",
          quantite: 1,
          prixUnitaire: 680,
          fournisseur: "Schneider Electric",
          urgence: false,
          enStock: false,
          commandee: false,
          observations: "Remplacement recommandé mais non critique",
        },
      ],
    },
  ];

  // ── Insert equipment, maintenance, spare parts in bulk ──
  let totalEquip = 0;
  let totalMaint = 0;
  let totalPiece = 0;

  for (const eq of equipData) {
    const equip = await prisma.psaEquipment.create({
      data: {
        code: eq.code,
        designation: eq.designation,
        marque: eq.marque,
        modele: eq.modele,
        type: eq.type,
        numeroSerie: eq.numeroSerie,
        statut: eq.statut,
        dateMiseEnService: eq.dateMiseEnService,
        dateFinGarantie: eq.dateFinGarantie ?? null,
        observation: eq.observation ?? null,
        siteId: eq.siteId,
      },
    });
    totalEquip++;

    for (const m of eq.maintenances) {
      await prisma.psaMaintenance.create({
        data: {
          equipementId: equip.id,
          dateMaintenance: m.dateMaintenance,
          type: m.type,
          description: m.description,
          technicien: m.technicien,
          dureeHeures: m.dureeHeures,
          resultat: m.resultat,
          piecesUtilisees: m.piecesUtilisees ?? null,
          kitMaintenance: m.kitMaintenance ?? null,
          coutTotal: m.coutTotal ?? null,
          numeroPV: m.numeroPV,
        },
      });
      totalMaint++;
    }

    for (const p of eq.pieces) {
      await prisma.psaPieceNeed.create({
        data: {
          equipementId: equip.id,
          designation: p.designation,
          reference: p.reference ?? null,
          quantite: p.quantite,
          prixUnitaire: p.prixUnitaire,
          devise: "EUR",
          fournisseur: p.fournisseur ?? null,
          urgence: p.urgence,
          enStock: p.enStock,
          commandee: p.commandee,
          observations: p.observations ?? null,
        },
      });
      totalPiece++;
    }
  }

  return NextResponse.json({
    ok: true,
    summary: {
      sites: sites.length,
      equipements: totalEquip,
      maintenances: totalMaint,
      piecesDetachees: totalPiece,
    },
    sites: sites.map((s) => ({ id: s.id, code: s.code, nom: s.nom })),
  });
}
