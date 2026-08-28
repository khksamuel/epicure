import { Link } from "react-router-dom";
import styles from "../App.module.css";

const WORKSPACES = [
  ["/explore", "Explore ingredients", "See common, balanced, and chemistry-led possibilities."],
  ["/recipe-lab", "Remix a recipe", "Develop a draft dish and work within your pantry."],
  ["/swap", "Swap an ingredient", "Find alternatives through the lens that suits the dish."],
  [
    "/steer",
    "Steer flavour",
    "Move an ingredient from familiar territory toward a cuisine direction.",
  ],
];

export function HomePage() {
  return (
    <>
      <section
        className={`${styles.journalCover} ${styles.heroReveal} rounded-2xl px-7 py-12 text-paper sm:px-12 sm:py-16 lg:grid lg:grid-cols-[1.35fr_.65fr] lg:items-end lg:gap-12`}
      >
        <div>
          <h1 className="max-w-[10ch] font-display text-5xl leading-[.96] tracking-[-.03em] sm:text-7xl">
            Make room for a better idea.
          </h1>
          <p className="mt-6 max-w-[46ch] text-base leading-7 text-paper/72">
            Explore pairings, remix a dish, find substitutions, and steer flavour while the creative
            decision remains yours.
          </p>
        </div>
        <div className="mt-10 border-t border-paper/25 pt-5 lg:mt-0">
          <p className="font-display text-2xl italic leading-snug text-leaf">
            Begin with what is already on the bench.
          </p>
          <p className="mt-3 text-sm leading-6 text-paper/60">
            Choose a workspace for the question you are trying to answer.
          </p>
        </div>
      </section>
      <section className="mt-12">
        <h2 className="section-title">Choose a way into the dish.</h2>
        <div className="mt-7 grid overflow-hidden rounded-2xl border border-ink/15 bg-paper md:grid-cols-2">
          {WORKSPACES.map(([to, title, copy], index) => (
            <Link
              className={`group p-6 transition hover:bg-leaf/15 sm:p-8 ${index < 2 ? "border-b border-ink/15" : ""} ${index % 2 === 0 ? "md:border-r md:border-ink/15" : ""} ${index === 2 ? "border-b border-ink/15 md:border-b-0" : ""}`}
              to={to}
              key={to}
            >
              <h3 className="font-display text-3xl tracking-[-.02em] group-hover:text-moss">
                {title}
              </h3>
              <p className="mt-3 max-w-[42ch] text-sm leading-6 text-pencil">{copy}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
