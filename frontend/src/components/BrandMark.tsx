/**
 * BrandMark — authored mark for InventorEx.
 *
 * One idea: the dot of an "i" is a box lid seen in isometric.
 * Two shapes only, drawn on a 32-unit grid so it stays crisp at 16px.
 * The lid takes the accent; the stem inherits the surrounding text colour.
 */
interface BrandMarkProps {
  size?: number;
  className?: string;
  /** Paint the stem in the accent too, for single-colour contexts. */
  monochrome?: boolean;
}

export function BrandMark({ size = 28, className, monochrome = false }: BrandMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {/* Box lid — isometric top face */}
      <path d="M16 3.5 L24 8 L16 12.5 L8 8 Z" fill="var(--accent)" />
      {/* Stem */}
      <rect
        x="13.5"
        y="14.5"
        width="5"
        height="13.5"
        rx="2.5"
        fill={monochrome ? 'var(--accent)' : 'currentColor'}
      />
    </svg>
  );
}
