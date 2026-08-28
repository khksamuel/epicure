import { NavLink, Outlet } from "react-router-dom";
import styles from "../App.module.css";

const NAV_ITEMS = [
  ["/", "Field book"],
  ["/explore", "Explore ingredients"],
  ["/recipe-lab", "Recipe lab"],
  ["/swap", "Swap ingredients"],
  ["/steer", "Steer flavour"],
];

export function AppShell() {
  return (
    <main className={`${styles.pageAtmosphere} min-h-[100dvh] text-ink`}>
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        <header className="mb-8 border-b border-ink/15 pb-4">
          <div className="flex items-center justify-between gap-4">
            <NavLink
              className="font-display text-2xl font-semibold tracking-[-.02em] text-moss"
              to="/"
            >
              Kitchen Compass
            </NavLink>
            <span className="hidden font-display italic text-pencil sm:block">
              A cook's flavour field book
            </span>
          </div>
          <nav className="mt-4 flex flex-wrap gap-2 pb-1" aria-label="Main navigation">
            {NAV_ITEMS.map(([to, label]) => (
              <NavLink
                className={({ isActive }) =>
                  `shrink-0 rounded-full px-3 py-2 text-sm font-semibold transition ${isActive ? "bg-moss text-paper" : "text-pencil hover:bg-leaf/20 hover:text-ink"}`
                }
                end={to === "/"}
                key={to}
                to={to}
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </header>
        <Outlet />
        <footer className="mt-16 border-t border-ink/15 py-8 text-sm text-pencil sm:flex sm:items-center sm:justify-between">
          <span>Kitchen Compass</span>
          <span className="mt-2 block font-display italic sm:mt-0">
            Ideas for cooks, not rules for cooking.
          </span>
        </footer>
      </div>
    </main>
  );
}
