export function HowItWorks() {
  return (
    <section className="mt-16 border-t border-ink/15 pt-10">
      <h2 className="font-display text-3xl tracking-[-.02em]">Three ways to read an idea</h2>
      <div className="mt-6 grid gap-8 text-sm leading-6 text-pencil md:grid-cols-3">
        <p>
          <strong className="mb-2 block font-display text-xl font-medium text-ink">
            Common pairings
          </strong>
          What recipes often put together.
        </p>
        <p>
          <strong className="mb-2 block font-display text-xl font-medium text-ink">
            Balanced possibilities
          </strong>
          A meeting point between recipe patterns and flavour chemistry.
        </p>
        <p>
          <strong className="mb-2 block font-display text-xl font-medium text-ink">
            Flavour surprises
          </strong>
          Ingredients with a related flavour-compound profile.
        </p>
      </div>
    </section>
  );
}
