export default function SectionTag({
  index,
  label,
}: {
  index: string;
  label: string;
}) {
  return (
    <div
      data-reveal
      className="mb-10 flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-paper-dim md:mb-14"
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber" />
      <span className="shrink-0">
        {index} — {label}
      </span>
      <span className="h-px flex-1 bg-white/10" />
    </div>
  );
}
