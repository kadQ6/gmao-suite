/** Taille max fichier Excel (octets). */
export const GMAO_IMPORT_MAX_FILE_BYTES = 12 * 1024 * 1024;

/** Nombre max de lignes données (hors en-tête) traitées par batch. */
export const GMAO_IMPORT_MAX_DATA_ROWS = 5000;

/** Extensions acceptées (normalisées en minuscules). */
export const GMAO_IMPORT_ALLOWED_EXT = new Set([".xlsx", ".xlsm"]);
