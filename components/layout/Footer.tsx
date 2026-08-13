export function Footer() {
  return (
    <footer>
      <div className="layout-container flex flex-col gap-y-5 pb-10 pt-12 md:flex-row md:items-center md:justify-between">
        <span className="text-base font-semibold text-[var(--text-primary)]">Cineby</span>
        <p className="text-sm text-zinc-400">
          This site does not store any files on our server, we only linked to the media which is
          hosted on 3rd party services.
        </p>
        <a
          href="mailto:contact@cineby.at"
          className="text-xs text-zinc-400 transition-colors duration-150 hover:text-white"
        >
          contact@cineby.at
        </a>
      </div>
    </footer>
  );
}
