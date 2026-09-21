// Interrupteur réutilisable pour les formulaires du backoffice (case à cocher accessible).
export function Switch({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm font-medium">
      <input type="checkbox" name={name} className="peer sr-only" defaultChecked={defaultChecked} />
      <span className="relative h-7 w-12 shrink-0 rounded-full bg-ink/25 transition-colors after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-cream-soft after:shadow after:transition-transform peer-checked:bg-emerald peer-checked:after:translate-x-5 peer-focus-visible:ring-4 peer-focus-visible:ring-blue/40" />
      {label}
    </label>
  );
}
