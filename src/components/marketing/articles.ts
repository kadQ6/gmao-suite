export type Article = {
  slug: string;
  title: string;
  date: string;
  category: "biomedical" | "architecture" | "international" | "actualite";
  summary: string;
  image?: string;
  body: string[];
};

export const articles: Article[] = [
  {
    slug: "audit-biomedical-djibouti-2024",
    title: "Mission d'audit biomédicale à Djibouti — retour d'expérience",
    date: "2024-11-15",
    category: "international",
    summary:
      "K'BIO a conduit un audit complet du parc d'équipements médicaux de deux hôpitaux djiboutiens, dans le cadre d'un programme de renforcement du système de santé.",
    image: "/missions/biomedical-pc.webp",
    body: [
      "En novembre 2024, K'BIO est intervenu à Djibouti pour réaliser un audit approfondi des équipements médicaux de l'Hôpital Général Peltier et du Centre Hospitalier Paul Faure.",
      "Cette mission s'inscrit dans un programme de coopération technique visant à renforcer les capacités biomédicales locales. L'équipe K'BIO a inventorié plus de 600 dispositifs médicaux, évalué leur état fonctionnel et proposé un plan de renouvellement priorisé.",
      "Les recommandations ont été transmises au Ministère de la Santé djiboutien et aux partenaires techniques internationaux pour financement. Ce type de mission illustre l'engagement de K'BIO en faveur de systèmes de santé durables en Afrique.",
    ],
  },
  {
    slug: "programmation-biomedical-bloc-operatoire",
    title: "Programmation biomédicale d'un bloc opératoire : notre méthode",
    date: "2024-09-03",
    category: "biomedical",
    summary:
      "Comment K'BIO approche la programmation biomédicale d'un nouveau bloc opératoire, de l'état des lieux à la réception des équipements.",
    image: "/missions/chi-compiegne.webp",
    body: [
      "La programmation biomédicale d'un bloc opératoire est une étape critique dans tout projet de construction ou de rénovation hospitalière. Elle conditionne l'efficacité opérationnelle et la sécurité des soins pour des décennies.",
      "Chez K'BIO, notre approche repose sur quatre phases complémentaires : l'analyse des activités existantes et projetées, la définition des besoins en équipements par spécialité, la rédaction des programmes techniques détaillés, et l'assistance à la réception.",
      "Cette méthode, éprouvée sur des projets comme le CHI Compiègne-Noyon (8 salles de bloc, 24 places d'ambulatoire) ou le Médipole Lyon-Villeurbanne (29 blocs opératoires), garantit une intégration optimale des équipements dans le projet architectural.",
    ],
  },
  {
    slug: "amo-biomedical-construction-hospitaliere",
    title: "L'AMO biomédicale : un levier clé pour les projets de construction",
    date: "2024-06-20",
    category: "architecture",
    summary:
      "L'assistance à maîtrise d'ouvrage biomédicale est souvent sous-estimée dans les projets hospitaliers. K'BIO explique pourquoi elle est indispensable.",
    image: "/missions/chi-poissy.webp",
    body: [
      "Dans tout projet de construction ou de réhabilitation hospitalière, l'aspect biomédicale est trop souvent traité en aval, comme une contrainte technique de second rang. Cette approche génère des surcoûts, des délais et parfois des incompatibilités fonctionnelles majeures.",
      "L'AMO biomédicale, portée par K'BIO dès la phase de programmation, permet d'anticiper les besoins en équipements, d'intégrer les contraintes techniques (fluides médicaux, électricité, poids, dimensions) dans les plans architecturaux, et de coordonner les achats avec le calendrier des travaux.",
      "Sur le projet du CHI Poissy-Saint-Germain (58 390 m², 6 étages), cette intervention précoce a permis d'éviter plusieurs reprises coûteuses et d'assurer une mise en service dans les délais. Une économie substantielle par rapport au coût de notre mission.",
    ],
  },
  {
    slug: "gestion-parc-equipements-medicaux",
    title: "Optimiser la gestion de votre parc d'équipements médicaux",
    date: "2024-03-12",
    category: "biomedical",
    summary:
      "Les indicateurs MTBF, MTTR et le taux de disponibilité sont les trois piliers d'une gestion efficace du parc biomédicale. K'BIO vous explique comment les mettre en place.",
    body: [
      "Un parc d'équipements médicaux bien géré, c'est moins de pannes imprévues, des coûts de maintenance maîtrisés et une meilleure disponibilité pour les équipes soignantes. Mais comment mesurer l'efficacité de cette gestion ?",
      "Les indicateurs MTBF (Mean Time Between Failures — temps moyen entre deux pannes) et MTTR (Mean Time To Repair — temps moyen de réparation) sont les références internationales. Associés au taux de disponibilité global, ils permettent de piloter objectivement la performance biomédicale.",
      "K'BIO accompagne les établissements dans la mise en place de ces tableaux de bord, la définition de seuils d'alerte et la planification des maintenances préventives. Notre mission au CH Rives (Isère) illustre cette démarche : depuis 2016, nous assurons le suivi de 275 équipements sur 2 sites.",
    ],
  },
];

export function getArticle(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export const categoryLabels: Record<Article["category"], string> = {
  biomedical: "Ingénierie biomédicale",
  architecture: "Architecture hospitalière",
  international: "International",
  actualite: "Actualité",
};

export const categoryColors: Record<Article["category"], string> = {
  biomedical: "bg-kbio-teal/10 text-kbio-teal",
  architecture: "bg-indigo-100 text-indigo-600",
  international: "bg-amber-100 text-amber-700",
  actualite: "bg-emerald-100 text-emerald-700",
};
