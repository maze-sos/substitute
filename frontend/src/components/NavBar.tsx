import { NavLink } from "react-router-dom";

const linkBase =
  "rounded-full px-4 py-2 text-sm font-medium transition";

export function NavBar() {
  return (
    <header className="sticky top-0 z-10 border-b border-sand bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <NavLink to="/" className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
          <span aria-hidden="true">🥘</span>
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
            What can I cook?
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
