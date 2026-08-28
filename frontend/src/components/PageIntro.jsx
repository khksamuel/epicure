export function PageIntro({ title, description, note }) {
  return (
    <header className="mb-10 grid gap-5 border-b border-ink/15 pb-8 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
      <div>
        <h1 className="max-w-[14ch] font-display text-5xl leading-[.98] tracking-[-.03em] text-ink sm:text-6xl">
          {title}
        </h1>
        <p className="mt-4 max-w-[60ch] text-base leading-7 text-pencil">{description}</p>
      </div>
      {note && (
        <p className="max-w-[34ch] border-t border-ink/15 pt-4 font-display text-xl italic leading-7 text-moss lg:justify-self-end">
          {note}
        </p>
      )}
    </header>
  );
}
