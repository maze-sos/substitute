import { getCuisineTheme } from "../lib/cuisineTheme";

interface Props {
  cuisine: string | null | undefined;
  className?: string;
}

export function RecipePlaceholderArt({ cuisine, className = "" }: Props) {
  const theme = getCuisineTheme(cuisine);
  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br ${theme.gradient} ${className}`}
      aria-hidden="true"
    >
      <span className="text-4xl drop-shadow-sm">{theme.emoji}</span>
    </div>
  );
}
