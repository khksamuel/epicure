import { Link } from "react-router-dom";
import styles from "../App.module.css";
import { useRandomFlavourNote } from "../hooks/useKitchenQueries";
import { humanName } from "../utils/format";

const WORKSPACES = [
  [
    "/explore",
    "Explore ingredients",
    "See familiar, balanced, and chemistry-led possibilities for any starting ingredient.",
    "01",
  ],
  [
    "/recipe-lab",
    "Remix a recipe",
    "Develop a draft dish while keeping the ingredients you already have in view.",
    "02",
  ],
  [
    "/swap",
    "Swap an ingredient",
    "Find a substitute that supports the role an ingredient plays in the dish.",
    "03",
  ],
  [
    "/steer",
    "Steer flavour",
    "Move an ingredient from familiar territory toward a cuisine direction with intention.",
    "04",
  ],
];

export function HomePage() {
  const flavourNote = useRandomFlavourNote();

  return (
    <>
      <section
        className={`${styles.journalCover} ${styles.homeHero} ${styles.heroReveal} rounded-2xl px-6 py-8 text-paper sm:px-10 sm:py-10 lg:px-14 lg:py-14`}
      >
        <div className={styles.heroCopy}>
          <p className="mb-6 text-xs font-bold uppercase tracking-[.2em] text-leaf">
            A cook&apos;s flavour field book
          </p>
          <h1 className="max-w-[11ch] text-balance font-display text-5xl leading-[.92] tracking-[-.045em] sm:text-7xl lg:text-8xl">
            Cook from curiosity, not a script.
          </h1>
          <p className="mt-7 max-w-[51ch] text-base leading-7 text-paper/78 sm:text-lg sm:leading-8">
            Epicure helps you find the next good idea — whether you are pairing an ingredient,
            rebuilding a dish, or following a flavour somewhere new.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a className="action action-accent" href="#workspaces">
              Find a starting point
              <span aria-hidden="true" className="ml-2 text-lg leading-none">
                →
              </span>
            </a>
            <Link
              className="action border border-paper/35 text-paper hover:bg-paper/10"
              to="/explore"
            >
              Explore ingredients
            </Link>
          </div>
        </div>
        <FlavourNoteCard query={flavourNote} />
      </section>

      <section className="mt-16 lg:mt-24" id="workspaces">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-clay">
            Choose your question
          </p>
          <h2 className="section-title mt-4">There is more than one way into a dish.</h2>
          <p className="section-copy text-base">
            Pick the kind of decision you are making. The tools stay practical; the creative call
            remains yours.
          </p>
        </div>
        <div className="mt-9 grid overflow-hidden rounded-2xl border border-ink/15 bg-paper md:grid-cols-2">
          {WORKSPACES.map(([to, title, copy, number], index) => (
            <Link
              className={`group relative min-h-60 p-6 transition duration-200 hover:bg-leaf/20 sm:p-8 ${index < 2 ? "border-b border-ink/15" : ""} ${index % 2 === 0 ? "md:border-r md:border-ink/15" : ""} ${index === 2 ? "border-b border-ink/15 md:border-b-0" : ""}`}
              to={to}
              key={to}
            >
              <span className="text-xs font-bold tracking-[.16em] text-clay">{number}</span>
              <h3 className="mt-8 font-display text-3xl tracking-[-.02em] group-hover:text-moss">
                {title}
              </h3>
              <p className="mt-3 max-w-[42ch] text-sm leading-6 text-pencil">{copy}</p>
              <span
                className="absolute bottom-6 right-6 grid size-10 place-items-center rounded-full border border-ink/15 text-lg transition duration-200 group-hover:border-moss group-hover:bg-moss group-hover:text-paper sm:bottom-8 sm:right-8"
                aria-hidden="true"
              >
                →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section
        className={`${styles.flavourNote} mt-16 overflow-hidden rounded-2xl border border-ink/15 lg:mt-24 lg:grid lg:grid-cols-[.85fr_1.15fr]`}
      >
        <div className="bg-clay px-7 py-10 text-paper sm:px-10 sm:py-14">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-leaf">A better prompt</p>
          <h2 className="mt-5 max-w-[11ch] font-display text-4xl leading-[.98] tracking-[-.035em] sm:text-5xl">
            Start with what is already on the bench.
          </h2>
        </div>
        <div className="notePaper px-7 py-10 sm:px-10 sm:py-14">
          <p className="max-w-[51ch] text-lg leading-8 text-ink">
            The most useful cooking tools leave space for your judgment. Epicure brings possible
            directions into view, so you can decide what belongs in the dish.
          </p>
          <Link className="action action-primary mt-8" to="/recipe-lab">
            Take a recipe somewhere new
            <span aria-hidden="true" className="ml-2 text-lg leading-none">
              →
            </span>
          </Link>
        </div>
      </section>
    </>
  );
}

function FlavourNoteCard({ query }) {
  if (query.isPending) {
    return (
      <div className={styles.heroSpecimen} aria-busy="true" aria-live="polite">
        <div className={styles.specimenEyebrow}>
          <span>Field note</span>
          <span>Loading</span>
        </div>
        <div className={styles.specimenCenter}>
          <span className={styles.specimenDot} aria-hidden="true" />
          <p className="font-display text-3xl italic text-paper/70 sm:text-4xl">
            Finding a fresh starting point…
          </p>
        </div>
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className={styles.heroSpecimen} role="alert">
        <div className={styles.specimenEyebrow}>
          <span>Field note</span>
          <span>Unavailable</span>
        </div>
        <div className={styles.specimenCenter}>
          <p className="max-w-[22ch] text-center font-display text-3xl italic leading-tight sm:text-4xl">
            We could not find a pairing just now.
          </p>
        </div>
        <button
          className="action border border-paper/35 text-paper hover:bg-paper/10"
          onClick={() => query.refetch()}
          type="button"
        >
          Try another ingredient
        </button>
      </div>
    );
  }

  const [firstPairing, secondPairing] = query.data.pairings;
  return (
    <div
      className={styles.heroSpecimen}
      aria-label={`An example flavour pairing with ${humanName(query.data.ingredient)}`}
    >
      <div className={styles.specimenEyebrow}>
        <span>Field note</span>
        <span>Recipe patterns</span>
      </div>
      <div className={styles.specimenCenter}>
        <span className={styles.specimenDot} aria-hidden="true" />
        <p className="font-display text-4xl italic leading-none tracking-[-.03em] sm:text-5xl">
          {humanName(query.data.ingredient)}
        </p>
      </div>
      <div className={styles.specimenPairing}>
        <div>
          <span>Try with</span>
          <strong>{humanName(firstPairing.ingredient)}</strong>
        </div>
        <span className="text-leaf" aria-hidden="true">
          ↗
        </span>
        <div>
          <span>Then add</span>
          <strong>{humanName(secondPairing.ingredient)}</strong>
        </div>
      </div>
      <p className="mt-6 border-t border-paper/20 pt-4 text-sm leading-6 text-paper/65">
        Two recipe-pattern neighbours to take as a starting point. Taste, adjust, and make the dish
        your own.
      </p>
      <button
        className="mt-5 text-sm font-semibold text-leaf underline decoration-leaf/45 underline-offset-4 transition hover:text-paper"
        onClick={() => query.refetch()}
        type="button"
      >
        Draw another field note
      </button>
    </div>
  );
}
