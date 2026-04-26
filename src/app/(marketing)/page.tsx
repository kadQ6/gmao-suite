import Link from "next/link";
import { HeroSlider } from "@/components/marketing/hero-slider";
import { PartnersMarquee } from "@/components/marketing/partners-marquee";
import { missions } from "@/components/marketing/data";

const activities = [
  {
        id: "architecture",
        href: "/services#architecture",
        title: "Architecture hospitalière",
        description:
                "Expertise biomédicale dans les projets de conception architecturale hospitalière, de réorganisation, de réaménagement, de déménagement.",
        image: "/missions/chi-compiegne.webp",
        color: "#3ab5c6",
  },
  {
        id: "conseil-biomedical",
        href: "/services#conseil-biomedical",
        title: "Ingénierie Biomédicale",
        description:
                "Accompagnement gestion biomédicale interne et audit biomédical.",
        image: "/missions/biomedical-pc.webp",
        color: "#5b9bd5",
  },
  ];

const descriptionTexts = [
    "Expertise biomédicale dans les projets de conception architecturale hospitalière, de réorganisation, de réaménagement, de déménagement.",
    "Accompagnement gestion biomédicale interne et audit biomédical.",
    "Forts de notre vision transversale et des outils développés, nous réalisons la jonction si importante entre les différents corps de métier.",
  ];

const featured = [
    "hm6-bouskoura",
    "chi-compiegne",
    "chi-poissy",
    "chr-gabon",
    "medipole",
    "beira-mozambique",
  ];

export default function MarketingHomePage() {
    const featuredMissions = featured
      .map((slug) => missions.find((m) => m.slug === slug))
      .filter(Boolean) as typeof missions;

  return (
        <main>
          {/* 1. Slider photo-seul */}
              <HeroSlider />
        
          {/* 2. Banniere tagline */}
              <div className="bg-kbio-navy py-7 text-center">
                      <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                                K&apos;BIO &ndash; ing&eacute;nierie biom&eacute;dicale
                      </h1>h1>
              </div>div>
        
          {/* 3. Nos activités — nouveau design 2 colonnes */}
              <section style={{ backgroundColor: "#d0dceb", padding: "3rem 1.5rem 3.5rem" }}>
                      <div style={{ maxWidth: "1152px", margin: "0 auto" }}>
                                <h2
                                              style={{
                                                              fontFamily: "var(--font-display, Inter, sans-serif)",
                                                              fontSize: "2.75rem",
                                                              fontWeight: 800,
                                                              color: "#003f72",
                                                              textAlign: "center",
                                                              marginBottom: "2.5rem",
                                                              letterSpacing: "-0.02em",
                                              }}
                                            >
                                            Nos activit&eacute;s
                                </h2>h2>
                                <div
                                              style={{
                                                              display: "grid",
                                                              gridTemplateColumns: "repeat(2, 1fr)",
                                                              gap: "2.5rem",
                                                              alignItems: "start",
                                              }}
                                            >
                                  {/* Colonne gauche : cartes activités */}
                                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                              {activities.map((a) => (
                                                              <Link
                                                                                  key={a.id}
                                                                                  href={a.href}
                                                                                  style={{
                                                                                                        textDecoration: "none",
                                                                                                        display: "flex",
                                                                                                        borderRadius: "0.375rem",
                                                                                                        overflow: "hidden",
                                                                                                        boxShadow: "0 2px 12px rgba(0,63,114,0.15)",
                                                                                    }}
                                                                                  aria-label={`${a.title} - En savoir plus`}
                                                                                >
                                                                                <div style={{ width: "155px", flexShrink: 0, overflow: "hidden", minHeight: "105px" }}>
                                                                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                                                    <img
                                                                                                                            src={a.image}
                                                                                                                            alt={a.title}
                                                                                                                            loading="lazy"
                                                                                                                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", minHeight: "105px" }}
                                                                                                                          />
                                                                                </div>div>
                                                                                <div
                                                                                                      style={{
                                                                                                                              flex: 1,
                                                                                                                              backgroundColor: a.color,
                                                                                                                              padding: "1rem 1.25rem",
                                                                                                                              display: "flex",
                                                                                                                              flexDirection: "column",
                                                                                                                              justifyContent: "center",
                                                                                                        }}
                                                                                                    >
                                                                                                    <h3
                                                                                                                            style={{
                                                                                                                                                      fontFamily: "var(--font-display, Inter, sans-serif)",
                                                                                                                                                      fontSize: "1.1rem",
                                                                                                                                                      fontWeight: 700,
                                                                                                                                                      color: "white",
                                                                                                                                                      margin: "0 0 0.35rem 0",
                                                                                                                                                      lineHeight: 1.3,
                                                                                                                              }}
                                                                                                                          >
                                                                                                      {a.title}
                                                                                                      </h3>h3>
                                                                                                    <span style={{ color: "white", fontSize: "0.875rem" }}>En savoir plus&hellip;</span>span>
                                                                                </div>div>
                                                              </Link>Link>
                                                            ))}
                                            </div>div>
                                
                                  {/* Colonne droite : textes descriptifs */}
                                            <div style={{ paddingTop: "0.25rem", textAlign: "justify" }}>
                                              {descriptionTexts.map((text, i) => (
                                                              <p
                                                                                  key={i}
                                                                                  style={{
                                                                                                        color: "#2d3748",
                                                                                                        fontSize: "0.9375rem",
                                                                                                        lineHeight: 1.75,
                                                                                                        marginBottom: i < descriptionTexts.length - 1 ? "1.25rem" : 0,
                                                                                                        fontFamily: "Inter, sans-serif",
                                                                                    }}
                                                                                >
                                                                {text}
                                                              </p>p>
                                                            ))}
                                            </div>div>
                                </div>div>
                      </div>div>
              </section>section>
        
          {/* 4. Nos dernières missions — galerie 3x2 */}
              <section style={{ backgroundColor: "#e8ecf0", padding: "3.5rem 1.5rem 4rem" }}>
                      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                                <h2
                                              style={{
                                                              fontFamily: "var(--font-display, Inter, sans-serif)",
                                                              fontSize: "2.75rem",
                                                              fontWeight: 800,
                                                              color: "#003f72",
                                                              textAlign: "center",
                                                              marginBottom: "2.5rem",
                                                              letterSpacing: "-0.01em",
                                              }}
                                            >
                                            Nos derni&egrave;res missions
                                </h2>h2>
                      
                                <div
                                              style={{
                                                              display: "grid",
                                                              gridTemplateColumns: "repeat(3, 1fr)",
                                                              gap: "1.25rem",
                                              }}
                                            >
                                  {featuredMissions.map((m) => (
                                                            <Link
                                                                              key={m.slug}
                                                                              href={`/references/${m.slug}`}
                                                                              style={{
                                                                                                  display: "block",
                                                                                                  borderRadius: "0.5rem",
                                                                                                  overflow: "hidden",
                                                                                                  boxShadow: "0 2px 10px rgba(0,0,0,0.12)",
                                                                                                  backgroundColor: "#fff",
                                                                                                  textDecoration: "none",
                                                                              }}
                                                                              aria-label={m.title}
                                                                            >
                                                              {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                            <img
                                                                                                src={m.image}
                                                                                                alt={m.title}
                                                                                                loading="lazy"
                                                                                                style={{
                                                                                                                      width: "100%",
                                                                                                                      aspectRatio: "4/3",
                                                                                                                      objectFit: "cover",
                                                                                                                      display: "block",
                                                                                                  }}
                                                                                              />
                                                            </Link>Link>
                                                          ))}
                                </div>div>
                      
                                <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
                                            <Link
                                                            href="/references"
                                                            style={{
                                                                              display: "inline-block",
                                                                              padding: "0.75rem 2rem",
                                                                              backgroundColor: "#003f72",
                                                                              color: "white",
                                                                              borderRadius: "2rem",
                                                                              fontFamily: "Inter, sans-serif",
                                                                              fontSize: "0.9375rem",
                                                                              fontWeight: 600,
                                                                              textDecoration: "none",
                                                                              letterSpacing: "0.01em",
                                                            }}
                                                          >
                                                          Voir toutes nos missions &rarr;
                                            </Link>Link>
                                </div>div>
                      </div>div>
              </section>section>
        
          {/* 5. Partenaires */}
              <PartnersMarquee />
        </main>main>
      );
}</main>
