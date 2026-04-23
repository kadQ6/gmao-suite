export type Mission = {
  slug: string;
  title: string;
  location: string;
  type: "biomedical" | "architecture" | "amo";
  status: "en-cours" | "realisee";
  zone: "france" | "international";
  year: string;
  image: string;
  summary: string;
  stats?: { label: string; value: string }[];
  description?: string[];
  scope?: string[];
};

export const missions: Mission[] = [
  {
    slug: "ch-rives",
    title: "CH Rives",
    location: "Isère, France",
    type: "biomedical",
    status: "en-cours",
    zone: "france",
    year: "Depuis octobre 2016",
    image: "/missions/ch-rives.webp",
    summary:
      "Mission d'ingenierie biomedicale sur 2 sites hospitaliers.",
    stats: [
      { label: "Lits", value: "302" },
      { label: "Sites", value: "2" },
      { label: "Equipements suivis", value: "275" },
    ],
    description: [
      "Accompagnement du service biomedical du Centre Hospitalier de Rives, etablissement multi-sites de l'agglomeration grenobloise.",
      "Gestion du parc d'equipements medicaux, planification des maintenances preventives et curatives, et optimisation de la politique d'investissement.",
    ],
    scope: [
      "Audit de parc et inventaire technique",
      "Plan pluriannuel de maintenance",
      "Suivi des indicateurs (MTBF, MTTR) et reporting",
      "Assistance aux appels d'offres",
    ],
  },
  {
    slug: "medipole",
    title: "Medipole Lyon-Villeurbanne",
    location: "Lyon-Villeurbanne, France",
    type: "amo",
    status: "realisee",
    zone: "france",
    year: "Mars 2017 - Mars 2019",
    image: "/missions/medipole.webp",
    summary:
      "Regroupement de 7 etablissements de sante lyonnais sur un seul site.",
    stats: [
      { label: "Etablissements", value: "7" },
      { label: "Surface", value: "60 000 m2" },
      { label: "Blocs operatoires", value: "29" },
    ],
    description: [
      "Cooperation entre le groupe CAPIO et RESAMUT pour regrouper 7 etablissements de sante lyonnais sur un site unique de 60 000 m2.",
      "K'BIO est intervenu sur la programmation biomedicale, l'integration des equipements et la coordination des lots techniques.",
    ],
    scope: [
      "Etat des lieux des etablissements existants",
      "Identification des besoins et analyse des ecarts",
      "Integration equipements et batiment",
      "Coordination des achats et mises en service",
    ],
  },
  {
    slug: "chi-compiegne",
    title: "CHI Compiegne-Noyon",
    location: "Oise, France",
    type: "architecture",
    status: "realisee",
    zone: "france",
    year: "2015 - 2018",
    image: "/missions/chi-compiegne.webp",
    summary:
      "Bloc operatoire et ambulatoire en deux phases.",
    stats: [
      { label: "Phases", value: "2" },
      { label: "Salles de bloc", value: "8" },
      { label: "Places ambulatoire", value: "24" },
    ],
    description: [
      "Programmation biomedicale du nouveau bloc operatoire et du plateau ambulatoire du Centre Hospitalier Intercommunal Compiegne-Noyon.",
      "Projet mene en deux phases successives pour maintenir la continuite d'activite de l'etablissement.",
    ],
    scope: [
      "Programmation fonctionnelle bloc",
      "Specifications equipements",
      "Flux patient et logistique",
      "Phasage et coordination travaux",
    ],
  },
  {
    slug: "chi-poissy",
    title: "CHI Poissy-Saint-Germain",
    location: "Yvelines, France",
    type: "amo",
    status: "realisee",
    zone: "france",
    year: "Fevrier 2018 - 2020",
    image: "/missions/chi-poissy.webp",
    summary:
      "Identification des impacts biomedicaux et validation des besoins pour un nouveau batiment.",
    stats: [
      { label: "Etages", value: "6" },
      { label: "Surface", value: "58 390 m2" },
      { label: "Lits reanimation", value: "42" },
    ],
    description: [
      "Nouveau batiment medico-technique de 58 390 m2 sur 6 etages pour le Centre Hospitalier Intercommunal Poissy-Saint-Germain-en-Laye.",
      "K'BIO a assure l'identification des impacts biomedicaux sur les operations de travaux et l'audit de validation des besoins.",
    ],
    scope: [
      "Identification des impacts biomedicaux travaux",
      "Audit et validation des besoins",
      "Programmation et conception",
      "Suivi de realisation",
    ],
  },
  {
    slug: "ghsif-melun",
    title: "GHSIF Melun",
    location: "Melun, France",
    type: "amo",
    status: "realisee",
    zone: "france",
    year: "Mars 2017 - Avril 2018",
    image: "/missions/ghsif-melun.webp",
    summary:
      "Demenagement du Centre Hospitalier de Melun sur un nouveau site.",
    stats: [
      { label: "Lits", value: "750" },
      { label: "Naissances / an", value: "2 800" },
      { label: "Dispositifs medicaux", value: "500" },
    ],
    description: [
      "Demenagement du Centre Hospitalier de Melun sur un nouveau site, creant le Groupement Hospitalier Sud Ile-de-France, hub central du GHT Sud 77.",
      "K'BIO a assure l'execution du plan d'investissement, les marches, la planification des achats, la reception et la formation des utilisateurs.",
    ],
    scope: [
      "Execution du plan d'investissement",
      "Benchmarking produits et marches",
      "Planification et suivi des achats",
      "Installation, reception et formation",
    ],
  },
  {
    slug: "ch-trevoux",
    title: "CH Trevoux",
    location: "Ain, France",
    type: "biomedical",
    status: "realisee",
    zone: "france",
    year: "Mars 2017 - Juin 2018",
    image: "/missions/ch-trevoux.webp",
    summary:
      "Audit et gestion biomedicale multi-sites (340 lits, 350 equipements).",
    stats: [
      { label: "Lits", value: "340" },
      { label: "Sites", value: "2" },
      { label: "Dispositifs medicaux", value: "350" },
    ],
    description: [
      "Accompagnement du Centre Hospitalier de Trevoux (GHT Rhone Nord Beaujolais Dombes) pour la gestion biomedicale sur deux sites hospitaliers.",
      "Audit de l'activite biomedicale, inventaire du parc d'equipements et mise en place d'un systeme de gestion par objectifs.",
    ],
    scope: [
      "Audit de l'activite biomedicale",
      "Inventaire du parc d'equipements medicaux",
      "Systeme de gestion par objectifs",
      "Plan de maintenance et renouvellement",
    ],
  },
  {
    slug: "hm6-bouskoura",
    title: "Hopital HM6 Bouskoura",
    location: "Casablanca, Maroc",
    type: "architecture",
    status: "realisee",
    zone: "international",
    year: "2017 - 2019",
    image: "/missions/hm6-bouskoura.svg",
    summary:
      "Programmation biomedicale d'un hopital prive marocain.",
    description: [
      "Programmation biomedicale d'un nouvel hopital prive a Bouskoura, dans la region de Casablanca.",
      "Specifications techniques, selection des equipements et coordination avec les fournisseurs internationaux.",
    ],
    scope: [
      "Programme biomedical complet",
      "Specifications techniques",
      "Selection fournisseurs",
      "Appui a la reception",
    ],
  },
  {
    slug: "chr-gabon",
    title: "CHR Gabon",
    location: "Gabon",
    type: "amo",
    status: "realisee",
    zone: "international",
    year: "2018 - 2020",
    image: "/missions/chr-gabon.svg",
    summary:
      "Assistance a maitrise d'ouvrage pour un Centre Hospitalier Regional.",
    description: [
      "AMO biomedicale pour un Centre Hospitalier Regional au Gabon, projet finance par bailleur international.",
      "Coordination technique des lots biomedicaux et reporting aux financeurs.",
    ],
    scope: [
      "Cadrage et programmation",
      "Pilotage appels d'offres",
      "Validation technique",
      "Reporting bailleur",
    ],
  },
  {
    slug: "beira-mozambique",
    title: "Hopital de Beira",
    location: "Mozambique",
    type: "amo",
    status: "realisee",
    zone: "international",
    year: "2019 - 2021",
    image: "/missions/beira.svg",
    summary:
      "Programmation et coordination biomedicale d'un hopital africain.",
    description: [
      "Mission d'appui au projet de reconstruction et de modernisation de l'Hopital Central de Beira apres le cyclone Idai.",
      "Programme biomedical, specifications et coordination avec les bailleurs internationaux.",
    ],
    scope: [
      "Diagnostic des besoins",
      "Programme biomedical",
      "Specifications equipements",
      "Coordination bailleurs",
    ],
  },
];

export type Partner = { name: string; logo: string };

export const partners: Partner[] = [
  { name: "Anios", logo: "/partners/anios.png" },
  { name: "Biomedia", logo: "/partners/biomedia.png" },
  { name: "DMS Imaging", logo: "/partners/dms-imaging.png" },
  { name: "B.Braun", logo: "/partners/braun.png" },
  { name: "Fujifilm", logo: "/partners/fujifilm.svg" },
  { name: "Dräger", logo: "/partners/drager.svg" },
  { name: "Fresenius Kabi", logo: "/partners/fresenius.png" },
  { name: "GE Healthcare", logo: "/partners/ge-healthcare.svg" },
  { name: "Hitachi", logo: "/partners/hitachi.svg" },
  { name: "Medline", logo: "/partners/medline.png" },
  { name: "Olympus Medical", logo: "/partners/olympus.svg" },
  { name: "Roche", logo: "/partners/roche.svg" },
  { name: "Socofite", logo: "/partners/socofite.png" },
  { name: "Sysmex", logo: "/partners/sysmex.svg" },
  { name: "Steris", logo: "/partners/steris.svg" },
  { name: "Veolia", logo: "/partners/veolia.svg" },
  { name: "Resamut", logo: "/partners/resamut.png" },
  { name: "Vygon", logo: "/partners/vygon.png" },
  { name: "Medtronic", logo: "/partners/medtronic.svg" },
  { name: "CNSS", logo: "/partners/cnss.png" },
  { name: "DMP", logo: "/partners/dmp.png" },
  { name: "Humatem", logo: "/partners/humatem.png" },
  { name: "Integral Process", logo: "/partners/integral-process.jpg" },
  { name: "HGP", logo: "/partners/hgp.jpg" },
  { name: "Ptit Biomed", logo: "/partners/ptit-biomed.png" },
];

export const heroSlides = [
  {
    eyebrow: "Ingenierie biomedicale",
    title: "Concevoir des hopitaux qui fonctionnent.",
    subtitle:
      "Audit de parc, programmation et AMO pour des etablissements de sante plus surs et mieux pilotes.",
    image: "/missions/medipole.webp",
  },
  {
    eyebrow: "Architecture hospitaliere",
    title: "Du programme a la reception.",
    subtitle:
      "Programmation fonctionnelle, integration des equipements critiques et coordination des lots techniques.",
    image: "/missions/chi-poissy.webp",
  },
  {
    eyebrow: "Projets internationaux",
    title: "Accompagner les projets de sante.",
    subtitle:
      "Appui technique aux bailleurs, coordination terrain et reporting pour des deploiements en Afrique et au-dela.",
    image: "/missions/chi-compiegne.webp",
  },
];
