import { ChefHat } from "lucide-react";
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
      <ChefHat className="text-cream/90 drop-shadow-sm" size={32} strokeWidth={1.5} />
    </div>
  );
}
