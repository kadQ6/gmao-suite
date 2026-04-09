# Moteur d’import Excel — GMAO K’BIO

Document de conception : **module d’import uniquement**. Objectif : ingérer des classeurs métiers hétérogènes vers des données structurées, sans supposer un format unique.

**Stack cible** : Next.js (App Router), Server Actions / Route Handlers, Prisma, PostgreSQL, Zod, parsing serveur (ex. `xlsx` / SheetJS en mode lecture).

---

## 1. Architecture technique du moteur d’import

### 1.1 Couches

```
┌─────────────────────────────────────────────────────────────┐
│  UI (wizard multi-étapes, mapping, preview, rapport)        │
└────────────────────────────┬────────────────────────────────┘
                               │
┌──────────────────────────────▼────────────────────────────────┐
│  API / Server Actions                                         │
│  - createUploadSession, listSheets, parseHeaders              │
│  - saveMapping, validatePreview, runImport(dryRun|commit)     │
│  - listTemplates, saveTemplate                                │
└──────────────────────────────┬────────────────────────────────┘
                               │
┌──────────────────────────────▼────────────────────────────────┐
│  Import Engine (service pur, testable)                        │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐  │
│  │ FileParser   │ │ ColumnMapper │ │ RowValidator         │  │
│  │ (.xlsx)      │ │ (template +  │ │ (Zod + règles métier)│  │
│  │              │ │  user map)   │ │                      │  │
│  └──────────────┘ └──────────────┘ └──────────────────────┘  │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐  │
│  │ Deduper      │ │ ImportWriter │ │ ReportBuilder        │  │
│  │ (clés métier)│ │ (transactions│ │ (agrégats, CSV err)  │  │
│  │              │ │  par chunk)  │ │                      │  │
│  └──────────────┘ └──────────────┘ └──────────────────────┘  │
└──────────────────────────────┬────────────────────────────────┘
                               │
┌──────────────────────────────▼────────────────────────────────┐
│  Prisma + PostgreSQL (ImportBatch, ImportRow, entités métier) │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Stockage fichier

- **Upload** : `multipart/form-data` → fichier écrit dans un répertoire **hors webroot** ou **objet temporaire** (clé UUID), chemin / clé stockés dans `ImportBatch.storagePath`.
- **Durée de vie** : TTL (ex. 7 j) + suppression après import `COMMITTED` ou `ABANDONED`.
- **Sécurité** : taille max, types MIME `.xlsx` / `.xlsm`, scan optionnel, accès réservé aux rôles autorisés.

### 1.3 Parsing

- Bibliothèque : lecture **streaming** ou **workbook en mémoire** selon taille ; plafond de lignes (ex. 50k) configurable.
- **Feuilles** : liste des noms ; première ligne = en-têtes (trim, dédoublonnage suffixé `_2` si collision).
- **Types cellules** : normalisation dates (Excel serial → ISO), nombres, texte ; cellules vides → `null`.

### 1.4 Orchestration

- Chaque import = un **`ImportBatch`** avec statut machine : `UPLOADED` → `MAPPING` → `VALIDATED` → `PREVIEWED` → `RUNNING` → `PARTIAL|SUCCESS|FAILED`.
- Moteur **idempotent côté batch** : un `commit` ne s’exécute qu’une fois ; re-run = nouveau batch ou action `retryFailedRows` explicite.

---

## 2. Workflow UX complet

### 2.1 Parcours utilisateur (wizard)

1. **Choix du contexte**  
   - Projet obligatoire (`projectId`).  
   - Type d’import : *Inventaire*, *Plan MP*, *Stock*, *Kit*, *Achat*, *Technicien*, *Site*, *Établissement*, *Fournisseur*, *Service*.

2. **Upload**  
   - Glisser-déposer ou fichier ; affichage nom, taille, type.

3. **Sélection de la feuille**  
   - Liste déroulante des onglets ; aperçu des 5 premières lignes brutes (grille).

4. **Ligne d’en-tête**  
   - Par défaut ligne 1 ; possibilité de choisir ligne 2–N si titres décalés.

5. **Mapping des colonnes**  
   - Colonne gauche : en-têtes Excel détectées.  
   - Colonne droite : champs cible (filtrés par *type d’import*), + option *Ignorer* / *Champ libre (JSON)* pour colonnes inconnues.  
   - Bouton **« Charger un modèle »** : liste `ImportTemplate` du projet ou globaux K’BIO.  
   - Bouton **« Enregistrer comme modèle »** : nom + description.

6. **Règles d’import**  
   - Mode : **Création seule** | **Mise à jour seule** | **Upsert** | **Fusion** (voir §8).  
   - Clé de déduplication : choix parmi clés proposées selon type (ex. inventaire : `numéro GMAO` OU `marque+modèle+série`).  
   - Case **Simulation** (dry-run) cochée par défaut sur premier run.

7. **Validation**  
   - Clic **« Valider le mapping »** : contrôle champs obligatoires mappés, types cohérents ; sinon messages inline.

8. **Prévisualisation**  
   - Table paginée : N lignes (ex. 50) avec statut par ligne : `OK` | `Warning` | `Error`.  
   - Filtres : erreurs seulement, doublons détectés.  
   - Résumé : X OK, Y warnings, Z erreurs, W doublons.

9. **Exécution**  
   - **Lancer la simulation** → rapport sans écriture BD.  
   - **Confirmer l’import** → écriture ; barre de progression (SSE ou polling sur `ImportBatch`).

10. **Rapport final**  
    - Créés / mis à jour / ignorés / en erreur.  
    - Téléchargement **CSV des lignes en échec** + **JSON résumé**.  
    - Lien « Réimporter uniquement les lignes en erreur » (nouveau batch pré-rempli).

### 2.2 Parcours secondaires

- **Abandon** : depuis n’importe quelle étape avant commit → statut `ABANDONED`, fichier purgé.  
- **Import partiel** : autorisé (voir §7) ; l’UI affiche clairement ce qui a été écrit.  
- **Client lecture seule** : pas d’accès à ce module (réservé rôles avec `canWriteData` + droit import si affiné plus tard).

---

## 3. Tables nécessaires (Prisma)

### 3.1 Cœur import

| Modèle | Rôle |
|--------|------|
| `ImportTemplate` | Nom, `importType`, `projectId` nullable (global K’BIO), `mappingJson`, `dedupeKey`, `headerRowIndex`, `defaultMode`, `createdById`, timestamps |
| `ImportBatch` | `projectId`, `importType`, `status`, `fileName`, `storagePath`, `sheetName`, `headerRow`, `mappingSnapshotJson`, `mode`, `dedupeStrategy`, `dryRun`, `statsJson`, `startedAt`, `finishedAt`, `createdById` |
| `ImportRow` | `batchId`, `rowIndex`, `rawJson`, `normalizedJson`, `status` (`PENDING\|VALID\|ERROR\|SKIPPED\|APPLIED`), `entityType`, `entityId` (après succès), `errorCode`, `errorMessage` |
| `ImportError` | Optionnel si tout est sur `ImportRow` ; sinon détail multi-erreurs par ligne |

### 3.2 Index & contraintes

- `ImportBatch(projectId, createdAt)`, `ImportBatch(status)`.  
- `ImportRow(batchId, rowIndex)` unique.  
- `ImportTemplate(projectId, name)` unique partiel si besoin.

### 3.3 Évolution

- Les entités métier (`Asset`, `SparePart`, …) restent la cible ; pas de table « import » par entité, seulement le journal générique ci-dessus.

---

## 4. Validations métier (par type d’import)

Règles communes : trim strings, dates parseables, nombres ≥ 0 où pertinent, références existantes (`projectId` cohérent).

### 4.1 Inventaire équipements

- **Obligatoires (minimum)** : au moins un identifiant parmi `gmaoNumber` OU (`manufacturer` + `model` + `serialNumber`).  
- **Formats** : date acquisition / mise en service ; criticité dans enum ; statut équipement enum.  
- **Référentiels** : si `siteName` / `departmentName` fournis → résolution ou création contrôlée selon politique (strict vs auto-create).  
- **Doublons** : même clé dans le fichier ; collision avec BD selon mode (§8).

### 4.2 Plan de maintenance

- Lien `equipment` résolvable ; `frequency` normalisée ; `nextDue` ou calcul à partir fréquence + date de départ.

### 4.3 Stock pièces / kits

- `partCode` unique dans périmètre ; quantités entières ; coût unitaire décimal.

### 4.4 Achats

- Lignes avec `orderRef`, dates commande / réception, montants.

### 4.5 Techniciens

- Email unique ; rôle compatible ; pas de doublon `User.email`.

### 4.6 Sites / établissements / services / fournisseurs

- Unicité `(projectId, code)` ou `(projectId, name)` selon règle produit ; normalisation casse/espaces.

Chaque type = **schéma Zod** `RowSchema` + **fonction** `validateBusinessRules(row, ctx)` (async, accès Prisma pour lookups).

---

## 5. Pseudo-code backend

```text
// --- Types ---
enum ImportType { EQUIPMENT_INVENTORY, MAINTENANCE_PLAN, SPARE_STOCK, KIT, PURCHASE, TECHNICIAN, SITE, HOSPITAL, SUPPLIER, SERVICE }
enum BatchStatus { UPLOADED, MAPPING, VALIDATED, PREVIEWED, RUNNING, SUCCESS, PARTIAL, FAILED, ABANDONED }
enum RowStatus { PENDING, VALID, WARNING, ERROR, SKIPPED, APPLIED }
enum ImportMode { CREATE_ONLY, UPDATE_ONLY, UPSERT, MERGE }

// --- 1. Upload ---
function handleUpload(file, projectId, userId):
  validateMimeAndSize(file)
  path = storeSecureTemp(file)
  batch = prisma.importBatch.create({
    projectId, status: UPLOADED, storagePath: path, fileName: file.name, createdById: userId
  })
  return { batchId: batch.id }

// --- 2. Parse sheets ---
function listSheets(batchId):
  batch = loadBatch(batchId)
  wb = parseWorkbook(batch.storagePath)
  return wb.sheetNames

// --- 3. Headers ---
function getHeaders(batchId, sheetName, headerRowIndex):
  rows = readSheetRows(batch, sheetName, maxRow: headerRowIndex + 5)
  headers = normalizeHeaders(rows[headerRowIndex - 1])
  prisma.importBatch.update({ sheetName, headerRow: headerRowIndex, status: MAPPING })
  return { headers, previewRows: rows.slice(headerRowIndex, headerRowIndex + 5) }

// --- 4. Suggest mapping (IA optionnelle = regex + synonymes) ---
function suggestMapping(headers, importType):
  targets = FIELD_DEFINITIONS[importType]  // { key, label, required, synonyms[] }
  map = {}
  for h in headers:
    map[h] = bestMatch(h, targets)  // score sur synonyms + fuzzy
  return map

// --- 5. Save mapping ---
function saveMapping(batchId, mappingJson, mode, dedupeKey, templateId?):
  validateMappingCompleteness(mappingJson, importType)  // throws ValidationError
  prisma.importBatch.update({
    mappingSnapshotJson: mappingJson, mode, dedupeStrategy: dedupeKey, status: VALIDATED
  })

// --- 6. Validate all rows (in memory or streaming) ---
function validateBatch(batchId):
  batch = loadBatch(batchId)
  mapping = batch.mappingSnapshotJson
  for (i, rawRow) in iterateDataRows(batch, batch.sheetName, batch.headerRow):
    normalized = mapRow(rawRow, mapping)
    result = RowSchema[importType].safeParse(normalized)
    if !result.success:
      saveImportRow(batchId, i, rawRow, ERROR, flattenZodErrors(result))
      continue
    biz = await validateBusinessRules(result.data, batch.projectId, importType)
    if biz.hardErrors.length:
      saveImportRow(batchId, i, rawRow, ERROR, biz.hardErrors)
    else if biz.warnings.length:
      saveImportRow(batchId, i, rawRow, WARNING, biz.warnings, normalized)
    else:
      saveImportRow(batchId, i, rawRow, VALID, [], normalized)

  dup = detectDuplicatesInFile(batchId, dedupeKey)
  markRowsDuplicate(batchId, dup)

  prisma.importBatch.update({ status: PREVIEWED, statsJson: computeStats(batchId) })

// --- 7. Run import ---
async function runImport(batchId, dryRun: boolean):
  batch = loadBatch(batchId)
  assert batch.status == PREVIEWED
  prisma.importBatch.update({ status: RUNNING, dryRun })

  stats = { created: 0, updated: 0, skipped: 0, errors: 0 }

  for chunk in chunks(loadApplicableRows(batchId), size: 100):
    await prisma.$transaction(async (tx) => {
      for row in chunk:
        if row.status == ERROR: continue  // ou SKIP selon politique
        try:
          outcome = await applyRow(tx, row.normalizedJson, batch.importType, batch.mode, batch.dedupeStrategy)
          if dryRun:
            row.simulatedOutcome = outcome
          else:
            persistEntity(tx, outcome)
            markRowApplied(tx, row.id, outcome.entityId)
          stats[outcome.kind]++
        catch (e):
          if !dryRun: markRowError(tx, row.id, e)
          stats.errors++
    }, { timeout: 30000 })

  finalStatus = stats.errors == 0 ? SUCCESS : (stats.created + stats.updated > 0 ? PARTIAL : FAILED)
  prisma.importBatch.update({ status: finalStatus, statsJson: stats, finishedAt: now() })
  if !dryRun: schedulePurgeTempFile(batch.storagePath)

  return buildReport(batchId, stats)
```

`applyRow` délègue à des **stratégies** par `ImportType` (factory pattern).

---

## 6. Composants front-end (React)

| Composant | Rôle |
|-----------|------|
| `ImportWizardLayout` | Stepper (étapes 1–N), navigation Précédent / Suivant |
| `ImportTypeSelect` | Cartes ou select pour le type métier |
| `ExcelDropzone` | Upload + contraintes + progression |
| `SheetPicker` | Select feuilles + mini preview |
| `HeaderRowPicker` | Input numéro ligne en-tête |
| `ColumnMappingTable` | Table : colonne Excel → Select champ cible + indicateur obligatoire |
| `MappingTemplatePicker` | Modal liste templates + appliquer |
| `SaveTemplateDialog` | Nom, description, défaut projet/global |
| `ImportOptionsForm` | Mode, clé dédup, checkbox simulation |
| `ValidationSummary` | Compteurs OK / warning / erreur |
| `ImportPreviewTable` | TanStack Table, pagination, filtres statut, export CSV erreurs |
| `ImportProgress` | Polling `GET /api/imports/[batchId]` ou EventSource |
| `ImportReportCard` | Résumé final + liens téléchargement |
| `ErrorRowDrawer` | Détail erreurs Zod + métier pour une ligne |

Tous les composants interactifs en **client components** ; données initiales via **Server Components** parent.

---

## 7. Stratégie de gestion des erreurs

### 7.1 Niveaux

- **Erreur bloquante (ligne)** : la ligne n’est pas importée ; message stocké sur `ImportRow` ; compteur `errors++`.  
- **Warning** : ligne importable avec valeur par défaut ou champ nullable ; journalisé ; utilisateur a validé en preview.  
- **Erreur batch** : fichier illisible, mapping incomplet avant run → statut `FAILED`, pas d’écriture métier.

### 7.2 Import partiel

- Transaction **par chunk** (ex. 50–100 lignes) : si une ligne échoue dans le chunk, politique configurable :  
  - **A (recommandé)** : rollback du chunk uniquement, marquer ces lignes en erreur, continuer chunks suivants → `PARTIAL`.  
  - **B** : tout le batch en une transaction → tout ou rien (rare pour gros fichiers).

### 7.3 Rapport

- `statsJson` : `{ created, updated, skipped, errors, warnings, duplicatesInternal, duplicatesDb }`.  
- Export CSV : colonnes `rowIndex`, `raw`, `errorCode`, `errorMessage`.  
- Logs serveur structurés `import_batch_id` pour support.

### 7.4 Idempotence

- `ImportBatch` avec `status SUCCESS` : bouton « Dupliquer en nouveau batch » pour rejouer avec autre mapping, pas de double commit automatique.

---

## 8. Stratégie de mise à jour / fusion des données existantes

### 8.1 Modes

| Mode | Comportement |
|------|----------------|
| **CREATE_ONLY** | Si clé existe en BD → ligne **SKIPPED** ou **ERROR** (paramétrable). |
| **UPDATE_ONLY** | Si clé absente → skip/error. Si présente → mise à jour champs mappés uniquement. |
| **UPSERT** | Absent → créer ; présent → mettre à jour (tous champs mappés non vides). |
| **MERGE** | Comme UPSERT mais **ne pas écraser** les champs BD non vides si la cellule Excel est vide (préserve la donnée existante). |

### 8.2 Clés de déduplication (exemples)

- **Inventaire** : `gmaoNumber` prioritaire ; sinon hash stable `manufacturer|model|serialNumber` normalisé.  
- **Pièce** : `(projectId, internalCode)`.  
- **Site** : `(projectId, code)` ou nom normalisé si pas de code.  
- **Fournisseur** : `(projectId, supplierCode)` ou email.

### 8.3 Doublons dans le fichier

- Première occurrence **gagne** ; suivantes marquées `ERROR` ou `SKIPPED` avec message « doublon ligne N ».

### 8.4 Doublons fichier ↔ base

- Résolu par le mode + clé ; en **MERGE**, conflit sur champs obligatoires différents → **ERROR** explicite « conflit avec enregistrement existant ».

### 8.5 Référentiels (site, service)

- **STRICT** : nom inconnu → erreur.  
- **AUTO_CREATE** : création entité référencée si droits admin import (à flaguer sur le batch).

---

## 9. Ordre d’implémentation recommandé

1. Schéma Prisma `ImportTemplate`, `ImportBatch`, `ImportRow` + migration.  
2. Service `FileParser` + stockage temp + `listSheets` / `getHeaders`.  
3. UI wizard jusqu’à mapping + sauvegarde template.  
4. `validateBatch` + preview UI.  
5. `applyRow` pour **un** type (ex. inventaire équipements) + modes UPSERT/MERGE.  
6. Étendre aux autres types + rapports CSV + purge fichiers.

---

*Ce document est la référence produit/tech pour le module d’import ; il peut être affiné dès réception des premiers fichiers Excel réels.*
