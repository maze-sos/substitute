import { NavLink } from "react-router-dom";
import { ChefHat } from "lucide-react";

const linkBase = "focus-ring rounded-full px-4 py-2 text-sm font-medium transition";

export function NavBar() {
  return (
    <header className="sticky top-0 z-10 border-b border-sand bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <NavLink
          to="/"
          className="focus-ring flex items-center gap-2 rounded-full font-display text-lg font-semibold text-ink"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-terracotta text-cream">
            <ChefHat aria-hidden="true" size={18} strokeWidth={2} />
          </span>
          Substitute
        </NavLink>
        <nav className="flex items-center gap-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `${linkBase} ${isActive ? "bg-terracotta text-cream" : "text-ink-soft hover:bg-sand"}`
            }
          >
            Recipes
          </NavLink>
          <NavLink
            to="/pantry"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? "bg-terracotta text-cream" : "text-ink-soft hover:bg-sand"}`
            }
          >
            <span className="hidden sm:inline">What can I cook?</span>
            <span className="sm:hidden">Pantry</span>
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
