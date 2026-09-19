interface Props {
  size?: number;
  className?: string;
}

/** Two interlocked rings (infinity/lemniscate) — the love2 mark.
 *  Left ring: coral. Right ring: navy. Center overlap: soft blush. */
export function RingsLogo({ size = 40, className }: Props): React.ReactElement {
  return (
    <svg
      width={size}
      height={Math.round(size * 0.5)}
      viewBox="0 0 60 30"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <circle cx="18" cy="15" r="12" stroke="hsl(var(--rings-primary))" strokeWidth="3" />
      <circle cx="42" cy="15" r="12" stroke="hsl(var(--rings-secondary))" strokeWidth="3" />
      <path
        d="M 24 5 A 12 12 0 0 1 36 5 M 24 25 A 12 12 0 0 0 36 25"
        fill="hsl(var(--rings-blush))"
        fillOpacity="0.5"
        stroke="none"
      />
    </svg>
  );
}
