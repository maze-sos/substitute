interface CuisineTheme {
  emoji: string;
  gradient: string;
}

const THEMES: Record<string, CuisineTheme> = {
  italian: { emoji: "🍝", gradient: "from-terracotta/80 to-terracotta-dark" },
  mexican: { emoji: "🌮", gradient: "from-terracotta to-olive" },
  indian: { emoji: "🍛", gradient: "from-olive to-terracotta-dark" },
  chinese: { emoji: "🥢", gradient: "from-terracotta-dark to-ink-soft" },
  thai: { emoji: "🍜", gradient: "from-olive-dark to-terracotta" },
  japanese: { emoji: "🍣", gradient: "from-ink-soft to-olive-dark" },
  mediterranean: { emoji: "🫒", gradient: "from-olive to-olive-dark" },
  american: { emoji: "🍔", gradient: "from-terracotta to-terracotta-dark" },
  french: { emoji: "🥐", gradient: "from-sand-dark to-terracotta" },
  "middle-eastern": { emoji: "🧆", gradient: "from-terracotta-dark to-olive" },
};

const DEFAULT_THEME: CuisineTheme = { emoji: "🍽️", gradient: "from-sand-dark to-muted" };

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
