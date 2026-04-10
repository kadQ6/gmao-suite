-- CreateEnum
CREATE TYPE "BiomedSiteKind" AS ENUM ('HOPITAL', 'CLINIQUE', 'CENTRE_SANTE', 'DISPENSAIRE', 'LABORATOIRE', 'AUTRE');

-- CreateEnum
CREATE TYPE "BiomedRoomKind" AS ENUM ('BLOC_OP', 'REANIMATION', 'URGENCES', 'RADIOLOGIE', 'LABORATOIRE_LOCAL', 'CONSULTATION', 'HOSPITALISATION', 'STERILISATION', 'PHARMACIE', 'MAGASIN', 'TECHNIQUE', 'AUTRE_LOCAL');

-- CreateEnum
CREATE TYPE "BiomedCritLevel" AS ENUM ('CRITIQUE', 'ELEVE', 'MOYEN', 'FAIBLE');

-- CreateEnum
CREATE TYPE "BiomedIecClass" AS ENUM ('IEC_I', 'IEC_IIA', 'IEC_IIB', 'IEC_III', 'NON_MEDICAL');

-- CreateEnum
CREATE TYPE "BiomedMpPeriodicity" AS ENUM ('MENSUEL', 'TRIMESTRIEL', 'SEMESTRIEL', 'ANNUEL', 'BIENNAL');

-- CreateEnum
CREATE TYPE "BiomedEquipmentStatus" AS ENUM ('EN_SERVICE', 'EN_PANNE', 'EN_MAINTENANCE', 'IMMOBILISE', 'HORS_SERVICE', 'REFORME', 'REMPLACE', 'EN_ATTENTE_PIECE', 'SOUS_GARANTIE', 'EN_STOCK', 'EN_TRANSIT');

-- CreateEnum
CREATE TYPE "BiomedEquipmentCondition" AS ENUM ('EXCELLENT', 'BON', 'MOYEN', 'MAUVAIS', 'HORS_SERVICE_COND');

-- CreateEnum
CREATE TYPE "BiomedInterventionUrgency" AS ENUM ('CRITIQUE', 'URGENT', 'NORMAL', 'FAIBLE');

-- CreateEnum
CREATE TYPE "BiomedDiStatus" AS ENUM ('OUVERTE', 'AFFECTEE', 'EN_COURS', 'EN_ATTENTE_PIECE', 'RESOLUE', 'CLOTUREE', 'ANNULEE');

-- CreateEnum
CREATE TYPE "BiomedPmStatus" AS ENUM ('PLANIFIEE', 'EN_COURS', 'REALISEE', 'EN_RETARD', 'ANNULEE');

-- CreateEnum
CREATE TYPE "BiomedPmResult" AS ENUM ('CONFORME', 'NON_CONFORME', 'PARTIEL', 'A_REVOIR');

-- CreateEnum
CREATE TYPE "BiomedMcRootCause" AS ENUM ('USURE', 'CHOC', 'SURTENSION', 'ERREUR_UTILISATION', 'DEFAUT_FABRICATION', 'DEFAUT_INSTALLATION', 'MANQUE_MAINTENANCE', 'AGE', 'AUTRE');

-- CreateEnum
CREATE TYPE "BiomedMcFinalStatus" AS ENUM ('RESOLU', 'PARTIEL', 'NON_RESOLU', 'EN_ATTENTE_PIECE_MC', 'RENVOYE_FABRICANT');

-- CreateEnum
CREATE TYPE "BiomedCqType" AS ENUM ('METROLOGIQUE', 'ELECTRIQUE', 'PERFORMANCE', 'SECURITE', 'REGLEMENTAIRE', 'AUTRE_CQ');

-- CreateEnum
CREATE TYPE "BiomedCqStatus" AS ENUM ('PLANIFIE', 'REALISE', 'EN_RETARD', 'NON_CONFORME');

-- CreateEnum
CREATE TYPE "BiomedTechnicianSpecialty" AS ENUM ('BIOMED', 'ELECTRIQUE', 'MECANIQUE', 'INFORMATIQUE', 'FROID', 'GENERALISTE', 'EXTERNE');

-- CreateEnum
CREATE TYPE "BiomedTechnicianLevel" AS ENUM ('NIVEAU1', 'NIVEAU2', 'NIVEAU3', 'INGENIEUR', 'EXPERT');

-- CreateEnum
CREATE TYPE "BiomedStockMvtType" AS ENUM ('ENTREE', 'SORTIE', 'INVENTAIRE', 'RETOUR', 'REFORME', 'TRANSFERT');

-- CreateEnum
CREATE TYPE "BiomedPurchaseType" AS ENUM ('EQUIPEMENT', 'PIECE_DETACHEE', 'CONSOMMABLE', 'SERVICE', 'KIT_ACHAT');

-- CreateEnum
CREATE TYPE "BiomedPurchaseStatus" AS ENUM ('BROUILLON', 'SOUMIS', 'VALIDE', 'COMMANDE', 'RECU', 'ANNULE');

-- CreateEnum
CREATE TYPE "BiomedImmobilisationDecision" AS ENUM ('REPARATION', 'REFORME', 'REMPLACEMENT', 'EN_ATTENTE_IMMO');

-- CreateEnum
CREATE TYPE "BiomedRenewalPriority" AS ENUM ('URGENT', 'HAUTE', 'NORMALE', 'BASSE');

-- CreateEnum
CREATE TYPE "BiomedInvestmentPriority" AS ENUM ('P1', 'P2', 'P3', 'P4');

-- CreateEnum
CREATE TYPE "BiomedInvestmentBudgetStatus" AS ENUM ('PROPOSE', 'VALIDE', 'APPROUVE', 'FINANCE', 'REALISE', 'REPORTE', 'ANNULE_INV');

-- CreateEnum
CREATE TYPE "BiomedInvestmentQuarter" AS ENUM ('T1', 'T2', 'T3', 'T4');

-- CreateEnum
CREATE TYPE "BiomedProtocolMaintenanceKind" AS ENUM ('PREVENTIVE', 'CURATIVE', 'CONTROLE_QUALITE', 'VERIFICATION');

-- CreateEnum
CREATE TYPE "BiomedDocumentType" AS ENUM ('PV_MAINTENANCE', 'RAPPORT_INTERVENTION', 'FICHE_TECHNIQUE', 'MANUEL', 'CERTIFICAT', 'CONTRAT', 'FACTURE', 'PHOTO', 'PLAN', 'RAPPORT_CQ', 'AUTRE_DOC');

-- CreateTable
CREATE TABLE "BiomedSite" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "typeEtablissement" "BiomedSiteKind" NOT NULL DEFAULT 'HOPITAL',
    "adresse" TEXT,
    "ville" TEXT,
    "region" TEXT,
    "pays" TEXT NOT NULL DEFAULT 'France',
    "codePostal" TEXT,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "contactNom" TEXT,
    "contactTel" TEXT,
    "contactEmail" TEXT,
    "telephone" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "remarques" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BiomedSite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BiomedBuilding" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "remarques" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BiomedBuilding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BiomedRoom" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "batimentId" TEXT,
    "etage" TEXT,
    "service" TEXT,
    "unite" TEXT,
    "typeLocal" "BiomedRoomKind" NOT NULL DEFAULT 'AUTRE_LOCAL',
    "niveauCriticite" "BiomedCritLevel" NOT NULL DEFAULT 'MOYEN',
    "remarques" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BiomedRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BiomedFamily" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "parentId" TEXT,
    "classeIEC" "BiomedIecClass" NOT NULL DEFAULT 'IEC_IIA',
    "periodiciteDefaut" "BiomedMpPeriodicity" NOT NULL DEFAULT 'ANNUEL',
    "dureeVieDefaut" INTEGER NOT NULL DEFAULT 10,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BiomedFamily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BiomedMaintenanceKit" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "typeEquipementConcerne" TEXT,
    "marque" TEXT,
    "modele" TEXT,
    "frequenceUtilisation" "BiomedMpPeriodicity",
    "coutEstime" DECIMAL(12,2),
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "observations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BiomedMaintenanceKit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BiomedSparePart" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "categorie" TEXT,
    "marqueCompatible" TEXT,
    "modeleCompatible" TEXT,
    "stockDisponible" INTEGER NOT NULL DEFAULT 0,
    "stockMinimum" INTEGER NOT NULL DEFAULT 1,
    "stockMaximum" INTEGER NOT NULL DEFAULT 10,
    "unite" TEXT NOT NULL DEFAULT 'piece',
    "prixUnitaire" DECIMAL(12,2),
    "devise" TEXT NOT NULL DEFAULT 'EUR',
    "fournisseur" TEXT,
    "referenceFournisseur" TEXT,
    "emplacementMagasin" TEXT,
    "siteId" TEXT,
    "delaiApprovisionJours" INTEGER,
    "criticiteStock" "BiomedCritLevel" NOT NULL DEFAULT 'MOYEN',
    "datePeremption" TIMESTAMP(3),
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "observations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BiomedSparePart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BiomedKitPart" (
    "id" TEXT NOT NULL,
    "kitId" TEXT NOT NULL,
    "pieceId" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "BiomedKitPart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BiomedProtocol" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "familleId" TEXT,
    "marqueCompatible" TEXT,
    "modeleCompatible" TEXT,
    "typeMaintenance" "BiomedProtocolMaintenanceKind" NOT NULL DEFAULT 'PREVENTIVE',
    "frequence" "BiomedMpPeriodicity" NOT NULL DEFAULT 'ANNUEL',
    "operationsJson" JSONB,
    "controleObligatoiresJson" JSONB,
    "outillageJson" JSONB,
    "kitMaintenanceId" TEXT,
    "piecesRecommandeesJson" JSONB,
    "tempsStandardMinutes" INTEGER NOT NULL DEFAULT 60,
    "niveauTechnicienRequis" "BiomedTechnicianLevel" NOT NULL DEFAULT 'NIVEAU2',
    "consignesSecuriteJson" JSONB,
    "referencesDocumentairesJson" JSONB,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "observations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BiomedProtocol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BiomedTechnician" (
    "id" TEXT NOT NULL,
    "matricule" TEXT,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "specialite" "BiomedTechnicianSpecialty" NOT NULL DEFAULT 'BIOMED',
    "niveauQualification" "BiomedTechnicianLevel" NOT NULL DEFAULT 'NIVEAU2',
    "habilitations" JSONB,
    "zoneIntervention" TEXT,
    "employeur" TEXT,
    "telephone" TEXT,
    "email" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT,
    "remarques" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BiomedTechnician_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BiomedEquipment" (
    "id" TEXT NOT NULL,
    "numeroGMAO" TEXT NOT NULL,
    "numeroInventaire" TEXT,
    "numeroSerie" TEXT,
    "codeBarreQR" TEXT,
    "designation" TEXT NOT NULL,
    "familleId" TEXT NOT NULL,
    "marque" TEXT,
    "modele" TEXT,
    "fabricant" TEXT,
    "fournisseur" TEXT,
    "distributeur" TEXT,
    "referenceInterne" TEXT,
    "classeIEC" "BiomedIecClass" NOT NULL DEFAULT 'IEC_IIA',
    "criticite" "BiomedCritLevel" NOT NULL DEFAULT 'MOYEN',
    "usageClinique" TEXT,
    "siteId" TEXT NOT NULL,
    "localId" TEXT,
    "responsableId" TEXT,
    "dateAchat" TIMESTAMP(3),
    "dateMiseEnService" TIMESTAMP(3),
    "dateFinGarantie" TIMESTAMP(3),
    "dureeVieEstimee" INTEGER NOT NULL DEFAULT 10,
    "anneeFabrication" INTEGER,
    "coutAchat" DECIMAL(12,2),
    "valeurActuelle" DECIMAL(12,2),
    "devise" TEXT NOT NULL DEFAULT 'EUR',
    "sousGarantie" BOOLEAN NOT NULL DEFAULT false,
    "sousContrat" BOOLEAN NOT NULL DEFAULT false,
    "typeContrat" TEXT,
    "fournisseurContrat" TEXT,
    "dateDebutContrat" TIMESTAMP(3),
    "dateFinContrat" TIMESTAMP(3),
    "statut" "BiomedEquipmentStatus" NOT NULL DEFAULT 'EN_SERVICE',
    "etatGeneral" "BiomedEquipmentCondition" NOT NULL DEFAULT 'BON',
    "protocoleId" TEXT,
    "periodiciteMP" "BiomedMpPeriodicity" NOT NULL DEFAULT 'ANNUEL',
    "derniereMPDate" TIMESTAMP(3),
    "prochaineMPDate" TIMESTAMP(3),
    "dernierePanneDate" TIMESTAMP(3),
    "prochainCQDate" TIMESTAMP(3),
    "dernierCQDate" TIMESTAMP(3),
    "nbrePannes" INTEGER NOT NULL DEFAULT 0,
    "nbreMP" INTEGER NOT NULL DEFAULT 0,
    "coutMaintenanceCumul" DECIMAL(12,2) DEFAULT 0,
    "tempsArretCumul" DECIMAL(10,2) DEFAULT 0,
    "photoPath" TEXT,
    "manuelPath" TEXT,
    "observations" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BiomedEquipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BiomedInterventionRequest" (
    "id" TEXT NOT NULL,
    "numeroDI" TEXT NOT NULL,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "demandeurId" TEXT,
    "demandeurNom" TEXT,
    "demandeurService" TEXT,
    "demandeurTel" TEXT,
    "siteId" TEXT NOT NULL,
    "localId" TEXT,
    "equipementId" TEXT NOT NULL,
    "descriptionPanne" TEXT NOT NULL,
    "niveauUrgence" "BiomedInterventionUrgency" NOT NULL DEFAULT 'NORMAL',
    "criticiteEquipement" "BiomedCritLevel" NOT NULL DEFAULT 'MOYEN',
    "statut" "BiomedDiStatus" NOT NULL DEFAULT 'OUVERTE',
    "technicienId" TEXT,
    "dateAffectation" TIMESTAMP(3),
    "dateIntervention" TIMESTAMP(3),
    "dateCloture" TIMESTAMP(3),
    "tempsArretHeures" DECIMAL(8,2),
    "cause" TEXT,
    "diagnostic" TEXT,
    "actionRealisee" TEXT,
    "piecesUtiliseesJson" JSONB,
    "coutTotal" DECIMAL(12,2),
    "coutMainOeuvre" DECIMAL(12,2),
    "coutPieces" DECIMAL(12,2),
    "validationFinale" BOOLEAN NOT NULL DEFAULT false,
    "validePar" TEXT,
    "observations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BiomedInterventionRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BiomedPreventiveMaintenance" (
    "id" TEXT NOT NULL,
    "numeroMP" TEXT NOT NULL,
    "equipementId" TEXT NOT NULL,
    "protocoleId" TEXT,
    "frequence" "BiomedMpPeriodicity",
    "datePrevue" TIMESTAMP(3) NOT NULL,
    "dateRealisee" TIMESTAMP(3),
    "technicienId" TEXT,
    "tempsPasseMinutes" INTEGER,
    "statut" "BiomedPmStatus" NOT NULL DEFAULT 'PLANIFIEE',
    "resultat" "BiomedPmResult",
    "anomaliesJson" JSONB,
    "actionsCorrectivesJson" JSONB,
    "piecesUtiliseesJson" JSONB,
    "kitUtiliseId" TEXT,
    "prochainPassage" TIMESTAMP(3),
    "numeroPV" TEXT,
    "observations" TEXT,
    "coutTotal" DECIMAL(12,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BiomedPreventiveMaintenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BiomedCorrectiveMaintenance" (
    "id" TEXT NOT NULL,
    "numeroMC" TEXT NOT NULL,
    "diId" TEXT,
    "equipementId" TEXT NOT NULL,
    "panneConstatee" TEXT,
    "diagnostic" TEXT,
    "causeRacine" "BiomedMcRootCause",
    "actionCorrective" TEXT,
    "piecesChangeeJson" JSONB,
    "technicienId" TEXT,
    "dateDebut" TIMESTAMP(3),
    "dateFin" TIMESTAMP(3),
    "dureeHeures" DECIMAL(8,2),
    "coutTotal" DECIMAL(12,2),
    "coutMainOeuvre" DECIMAL(12,2),
    "coutPieces" DECIMAL(12,2),
    "statutFinal" "BiomedMcFinalStatus" NOT NULL DEFAULT 'RESOLU',
    "equipeReforme" BOOLEAN NOT NULL DEFAULT false,
    "validation" BOOLEAN NOT NULL DEFAULT false,
    "validePar" TEXT,
    "observations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BiomedCorrectiveMaintenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BiomedQualityControl" (
    "id" TEXT NOT NULL,
    "numeroCQ" TEXT NOT NULL,
    "equipementId" TEXT NOT NULL,
    "typeControle" "BiomedCqType" NOT NULL DEFAULT 'PERFORMANCE',
    "norme" TEXT,
    "periodicite" "BiomedMpPeriodicity" NOT NULL DEFAULT 'ANNUEL',
    "datePrevue" TIMESTAMP(3),
    "dateRealisee" TIMESTAMP(3),
    "technicienId" TEXT,
    "resultat" TEXT,
    "conforme" BOOLEAN,
    "ecartsJson" JSONB,
    "actionsRequises" TEXT,
    "rapportPath" TEXT,
    "statut" "BiomedCqStatus" NOT NULL DEFAULT 'PLANIFIE',
    "observations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BiomedQualityControl_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BiomedStockMovement" (
    "id" TEXT NOT NULL,
    "numeroMvt" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "BiomedStockMvtType" NOT NULL,
    "pieceId" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL,
    "quantiteAvant" INTEGER,
    "quantiteApres" INTEGER,
    "motif" TEXT,
    "equipementId" TEXT,
    "siteId" TEXT,
    "magasin" TEXT,
    "userId" TEXT,
    "numeroOT" TEXT,
    "coutUnitaire" DECIMAL(12,2),
    "commentaire" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BiomedStockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BiomedPurchaseRequest" (
    "id" TEXT NOT NULL,
    "numeroDA" TEXT NOT NULL,
    "date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "demandeurId" TEXT,
    "typeAchat" "BiomedPurchaseType" NOT NULL DEFAULT 'PIECE_DETACHEE',
    "equipementId" TEXT,
    "pieceId" TEXT,
    "designation" TEXT,
    "quantite" INTEGER NOT NULL DEFAULT 1,
    "prixEstimatif" DECIMAL(12,2),
    "fournisseurPressenti" TEXT,
    "justification" TEXT,
    "urgence" BOOLEAN NOT NULL DEFAULT false,
    "statut" "BiomedPurchaseStatus" NOT NULL DEFAULT 'BROUILLON',
    "dateValidation" TIMESTAMP(3),
    "validePar" TEXT,
    "dateCommande" DATE,
    "numeroCommande" TEXT,
    "dateReception" DATE,
    "quantiteRecue" INTEGER,
    "montantFinal" DECIMAL(12,2),
    "facturePath" TEXT,
    "observations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BiomedPurchaseRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BiomedAssetFreeze" (
    "id" TEXT NOT NULL,
    "numeroImmo" TEXT,
    "equipementId" TEXT NOT NULL,
    "dateImmobilisation" TIMESTAMP(3) NOT NULL,
    "cause" TEXT,
    "dureePrevisionnelle" INTEGER,
    "dateLevee" TIMESTAMP(3),
    "decision" "BiomedImmobilisationDecision" NOT NULL DEFAULT 'EN_ATTENTE_IMMO',
    "reforme" BOOLEAN NOT NULL DEFAULT false,
    "dateReforme" TIMESTAMP(3),
    "motifReforme" TEXT,
    "remplacementPrevu" BOOLEAN NOT NULL DEFAULT false,
    "budgetRemplacement" DECIMAL(12,2),
    "anneeRemplacement" INTEGER,
    "prioriteRenouvellement" "BiomedRenewalPriority" NOT NULL DEFAULT 'NORMALE',
    "decisionPar" TEXT,
    "observations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BiomedAssetFreeze_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BiomedInvestmentPlan" (
    "id" TEXT NOT NULL,
    "numeroPDI" TEXT,
    "annee" INTEGER NOT NULL,
    "siteId" TEXT NOT NULL,
    "familleId" TEXT,
    "equipementId" TEXT,
    "designationNouveau" TEXT,
    "justification" TEXT,
    "criticite" "BiomedCritLevel" NOT NULL DEFAULT 'MOYEN',
    "vetustePercent" INTEGER,
    "coutRemplacement" DECIMAL(14,2),
    "priorite" "BiomedInvestmentPriority" NOT NULL DEFAULT 'P3',
    "statutBudgetaire" "BiomedInvestmentBudgetStatus" NOT NULL DEFAULT 'PROPOSE',
    "financementPrevu" TEXT,
    "trimestrePrevue" "BiomedInvestmentQuarter",
    "commentaire" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BiomedInvestmentPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BiomedDocument" (
    "id" TEXT NOT NULL,
    "numeroDoc" TEXT,
    "typeDocument" "BiomedDocumentType" NOT NULL DEFAULT 'AUTRE_DOC',
    "equipementId" TEXT,
    "referenceLiee" TEXT,
    "date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "auteurId" TEXT,
    "auteurNom" TEXT,
    "titre" TEXT,
    "cheminFichier" TEXT,
    "nomOriginal" TEXT,
    "tailleFichier" INTEGER,
    "mimeType" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "commentaire" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BiomedDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BiomedSequence" (
    "id" TEXT NOT NULL,
    "entite" TEXT NOT NULL,
    "annee" INTEGER,
    "dernierNumero" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BiomedSequence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BiomedSite_code_key" ON "BiomedSite"("code");

-- CreateIndex
CREATE INDEX "BiomedBuilding_siteId_idx" ON "BiomedBuilding"("siteId");

-- CreateIndex
CREATE UNIQUE INDEX "BiomedBuilding_siteId_code_key" ON "BiomedBuilding"("siteId", "code");

-- CreateIndex
CREATE INDEX "BiomedRoom_siteId_idx" ON "BiomedRoom"("siteId");

-- CreateIndex
CREATE UNIQUE INDEX "BiomedRoom_siteId_code_key" ON "BiomedRoom"("siteId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "BiomedFamily_code_key" ON "BiomedFamily"("code");

-- CreateIndex
CREATE UNIQUE INDEX "BiomedMaintenanceKit_code_key" ON "BiomedMaintenanceKit"("code");

-- CreateIndex
CREATE UNIQUE INDEX "BiomedSparePart_reference_key" ON "BiomedSparePart"("reference");

-- CreateIndex
CREATE INDEX "BiomedSparePart_siteId_idx" ON "BiomedSparePart"("siteId");

-- CreateIndex
CREATE UNIQUE INDEX "BiomedKitPart_kitId_pieceId_key" ON "BiomedKitPart"("kitId", "pieceId");

-- CreateIndex
CREATE UNIQUE INDEX "BiomedProtocol_code_key" ON "BiomedProtocol"("code");

-- CreateIndex
CREATE UNIQUE INDEX "BiomedTechnician_matricule_key" ON "BiomedTechnician"("matricule");

-- CreateIndex
CREATE UNIQUE INDEX "BiomedEquipment_numeroGMAO_key" ON "BiomedEquipment"("numeroGMAO");

-- CreateIndex
CREATE UNIQUE INDEX "BiomedEquipment_numeroInventaire_key" ON "BiomedEquipment"("numeroInventaire");

-- CreateIndex
CREATE INDEX "BiomedEquipment_siteId_idx" ON "BiomedEquipment"("siteId");

-- CreateIndex
CREATE INDEX "BiomedEquipment_statut_idx" ON "BiomedEquipment"("statut");

-- CreateIndex
CREATE INDEX "BiomedEquipment_familleId_idx" ON "BiomedEquipment"("familleId");

-- CreateIndex
CREATE UNIQUE INDEX "BiomedInterventionRequest_numeroDI_key" ON "BiomedInterventionRequest"("numeroDI");

-- CreateIndex
CREATE INDEX "BiomedInterventionRequest_statut_idx" ON "BiomedInterventionRequest"("statut");

-- CreateIndex
CREATE INDEX "BiomedInterventionRequest_siteId_idx" ON "BiomedInterventionRequest"("siteId");

-- CreateIndex
CREATE INDEX "BiomedInterventionRequest_equipementId_idx" ON "BiomedInterventionRequest"("equipementId");

-- CreateIndex
CREATE UNIQUE INDEX "BiomedPreventiveMaintenance_numeroMP_key" ON "BiomedPreventiveMaintenance"("numeroMP");

-- CreateIndex
CREATE INDEX "BiomedPreventiveMaintenance_equipementId_idx" ON "BiomedPreventiveMaintenance"("equipementId");

-- CreateIndex
CREATE INDEX "BiomedPreventiveMaintenance_datePrevue_idx" ON "BiomedPreventiveMaintenance"("datePrevue");

-- CreateIndex
CREATE INDEX "BiomedPreventiveMaintenance_statut_idx" ON "BiomedPreventiveMaintenance"("statut");

-- CreateIndex
CREATE UNIQUE INDEX "BiomedCorrectiveMaintenance_numeroMC_key" ON "BiomedCorrectiveMaintenance"("numeroMC");

-- CreateIndex
CREATE INDEX "BiomedCorrectiveMaintenance_equipementId_idx" ON "BiomedCorrectiveMaintenance"("equipementId");

-- CreateIndex
CREATE UNIQUE INDEX "BiomedQualityControl_numeroCQ_key" ON "BiomedQualityControl"("numeroCQ");

-- CreateIndex
CREATE INDEX "BiomedQualityControl_equipementId_idx" ON "BiomedQualityControl"("equipementId");

-- CreateIndex
CREATE UNIQUE INDEX "BiomedStockMovement_numeroMvt_key" ON "BiomedStockMovement"("numeroMvt");

-- CreateIndex
CREATE INDEX "BiomedStockMovement_pieceId_idx" ON "BiomedStockMovement"("pieceId");

-- CreateIndex
CREATE INDEX "BiomedStockMovement_date_idx" ON "BiomedStockMovement"("date");

-- CreateIndex
CREATE UNIQUE INDEX "BiomedPurchaseRequest_numeroDA_key" ON "BiomedPurchaseRequest"("numeroDA");

-- CreateIndex
CREATE INDEX "BiomedPurchaseRequest_statut_idx" ON "BiomedPurchaseRequest"("statut");

-- CreateIndex
CREATE UNIQUE INDEX "BiomedAssetFreeze_numeroImmo_key" ON "BiomedAssetFreeze"("numeroImmo");

-- CreateIndex
CREATE INDEX "BiomedAssetFreeze_equipementId_idx" ON "BiomedAssetFreeze"("equipementId");

-- CreateIndex
CREATE UNIQUE INDEX "BiomedInvestmentPlan_numeroPDI_key" ON "BiomedInvestmentPlan"("numeroPDI");

-- CreateIndex
CREATE INDEX "BiomedInvestmentPlan_siteId_idx" ON "BiomedInvestmentPlan"("siteId");

-- CreateIndex
CREATE INDEX "BiomedInvestmentPlan_annee_idx" ON "BiomedInvestmentPlan"("annee");

-- CreateIndex
CREATE UNIQUE INDEX "BiomedDocument_numeroDoc_key" ON "BiomedDocument"("numeroDoc");

-- CreateIndex
CREATE INDEX "BiomedDocument_equipementId_idx" ON "BiomedDocument"("equipementId");

-- CreateIndex
CREATE UNIQUE INDEX "BiomedSequence_entite_key" ON "BiomedSequence"("entite");

-- AddForeignKey
ALTER TABLE "BiomedBuilding" ADD CONSTRAINT "BiomedBuilding_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "BiomedSite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiomedRoom" ADD CONSTRAINT "BiomedRoom_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "BiomedSite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiomedRoom" ADD CONSTRAINT "BiomedRoom_batimentId_fkey" FOREIGN KEY ("batimentId") REFERENCES "BiomedBuilding"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiomedFamily" ADD CONSTRAINT "BiomedFamily_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "BiomedFamily"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiomedSparePart" ADD CONSTRAINT "BiomedSparePart_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "BiomedSite"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiomedKitPart" ADD CONSTRAINT "BiomedKitPart_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "BiomedMaintenanceKit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiomedKitPart" ADD CONSTRAINT "BiomedKitPart_pieceId_fkey" FOREIGN KEY ("pieceId") REFERENCES "BiomedSparePart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiomedProtocol" ADD CONSTRAINT "BiomedProtocol_familleId_fkey" FOREIGN KEY ("familleId") REFERENCES "BiomedFamily"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiomedProtocol" ADD CONSTRAINT "BiomedProtocol_kitMaintenanceId_fkey" FOREIGN KEY ("kitMaintenanceId") REFERENCES "BiomedMaintenanceKit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiomedTechnician" ADD CONSTRAINT "BiomedTechnician_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiomedEquipment" ADD CONSTRAINT "BiomedEquipment_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "BiomedSite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiomedEquipment" ADD CONSTRAINT "BiomedEquipment_localId_fkey" FOREIGN KEY ("localId") REFERENCES "BiomedRoom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiomedEquipment" ADD CONSTRAINT "BiomedEquipment_familleId_fkey" FOREIGN KEY ("familleId") REFERENCES "BiomedFamily"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiomedEquipment" ADD CONSTRAINT "BiomedEquipment_protocoleId_fkey" FOREIGN KEY ("protocoleId") REFERENCES "BiomedProtocol"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiomedEquipment" ADD CONSTRAINT "BiomedEquipment_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiomedInterventionRequest" ADD CONSTRAINT "BiomedInterventionRequest_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "BiomedSite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiomedInterventionRequest" ADD CONSTRAINT "BiomedInterventionRequest_localId_fkey" FOREIGN KEY ("localId") REFERENCES "BiomedRoom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiomedInterventionRequest" ADD CONSTRAINT "BiomedInterventionRequest_equipementId_fkey" FOREIGN KEY ("equipementId") REFERENCES "BiomedEquipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiomedInterventionRequest" ADD CONSTRAINT "BiomedInterventionRequest_technicienId_fkey" FOREIGN KEY ("technicienId") REFERENCES "BiomedTechnician"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiomedPreventiveMaintenance" ADD CONSTRAINT "BiomedPreventiveMaintenance_equipementId_fkey" FOREIGN KEY ("equipementId") REFERENCES "BiomedEquipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiomedPreventiveMaintenance" ADD CONSTRAINT "BiomedPreventiveMaintenance_protocoleId_fkey" FOREIGN KEY ("protocoleId") REFERENCES "BiomedProtocol"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiomedPreventiveMaintenance" ADD CONSTRAINT "BiomedPreventiveMaintenance_technicienId_fkey" FOREIGN KEY ("technicienId") REFERENCES "BiomedTechnician"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiomedCorrectiveMaintenance" ADD CONSTRAINT "BiomedCorrectiveMaintenance_diId_fkey" FOREIGN KEY ("diId") REFERENCES "BiomedInterventionRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiomedCorrectiveMaintenance" ADD CONSTRAINT "BiomedCorrectiveMaintenance_equipementId_fkey" FOREIGN KEY ("equipementId") REFERENCES "BiomedEquipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiomedCorrectiveMaintenance" ADD CONSTRAINT "BiomedCorrectiveMaintenance_technicienId_fkey" FOREIGN KEY ("technicienId") REFERENCES "BiomedTechnician"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiomedQualityControl" ADD CONSTRAINT "BiomedQualityControl_equipementId_fkey" FOREIGN KEY ("equipementId") REFERENCES "BiomedEquipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiomedQualityControl" ADD CONSTRAINT "BiomedQualityControl_technicienId_fkey" FOREIGN KEY ("technicienId") REFERENCES "BiomedTechnician"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiomedStockMovement" ADD CONSTRAINT "BiomedStockMovement_pieceId_fkey" FOREIGN KEY ("pieceId") REFERENCES "BiomedSparePart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiomedStockMovement" ADD CONSTRAINT "BiomedStockMovement_equipementId_fkey" FOREIGN KEY ("equipementId") REFERENCES "BiomedEquipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiomedStockMovement" ADD CONSTRAINT "BiomedStockMovement_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "BiomedSite"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiomedStockMovement" ADD CONSTRAINT "BiomedStockMovement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiomedPurchaseRequest" ADD CONSTRAINT "BiomedPurchaseRequest_equipementId_fkey" FOREIGN KEY ("equipementId") REFERENCES "BiomedEquipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiomedPurchaseRequest" ADD CONSTRAINT "BiomedPurchaseRequest_pieceId_fkey" FOREIGN KEY ("pieceId") REFERENCES "BiomedSparePart"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiomedAssetFreeze" ADD CONSTRAINT "BiomedAssetFreeze_equipementId_fkey" FOREIGN KEY ("equipementId") REFERENCES "BiomedEquipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiomedInvestmentPlan" ADD CONSTRAINT "BiomedInvestmentPlan_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "BiomedSite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiomedInvestmentPlan" ADD CONSTRAINT "BiomedInvestmentPlan_familleId_fkey" FOREIGN KEY ("familleId") REFERENCES "BiomedFamily"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiomedInvestmentPlan" ADD CONSTRAINT "BiomedInvestmentPlan_equipementId_fkey" FOREIGN KEY ("equipementId") REFERENCES "BiomedEquipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiomedDocument" ADD CONSTRAINT "BiomedDocument_equipementId_fkey" FOREIGN KEY ("equipementId") REFERENCES "BiomedEquipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiomedDocument" ADD CONSTRAINT "BiomedDocument_auteurId_fkey" FOREIGN KEY ("auteurId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

