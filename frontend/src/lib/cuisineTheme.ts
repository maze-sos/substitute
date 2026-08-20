interface CuisineTheme {
  gradient: string;
}

const THEMES: Record<string, CuisineTheme> = {
  italian: { gradient: "from-terracotta/80 to-terracotta-dark" },
  mexican: { gradient: "from-terracotta to-olive" },
  indian: { gradient: "from-olive to-terracotta-dark" },
  chinese: { gradient: "from-terracotta-dark to-ink-soft" },
  thai: { gradient: "from-olive-dark to-terracotta" },
  japanese: { gradient: "from-ink-soft to-olive-dark" },
  mediterranean: { gradient: "from-olive to-olive-dark" },
  american: { gradient: "from-terracotta to-terracotta-dark" },
  french: { gradient: "from-sand-dark to-terracotta" },
  "middle-eastern": { gradient: "from-terracotta-dark to-olive" },
};

const DEFAULT_THEME: CuisineTheme = { gradient: "from-sand-dark to-muted" };

export function getCuisineTheme(cuisine: string | null | undefined): CuisineTheme {
  if (!cuisine) return DEFAULT_THEME;
  return THEMES[cuisine] ?? DEFAULT_THEME;
}

export function formatCuisineName(cuisine: string | null | undefined): string {
  if (!cuisine) return "Unknown cuisine";
  return cuisine
    .split("-")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}
