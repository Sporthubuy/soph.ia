/**
 * SOPH.IA constellation mark — a knowledge node-cluster: satellite bodies
 * connected to a luminous azure core. Pure geometry (nodes + edges), the
 * brand's whole idea in one glyph. The wordmark carries an azure node for
 * the "." separator so the mark and the name speak the same language.
 */

export const LogoMark = ({
  size = 36,
  className,
}: {
  size?: number;
  className?: string;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    className={className}
    aria-hidden="true"
  >
    {/* edges */}
    <g stroke="var(--azure)" strokeWidth="1.4" strokeLinecap="round" opacity="0.55">
      <path d="M16 15.5 9 8.5" />
      <path d="M16 15.5 22.5 9.5" />
      <path d="M16 15.5 8.5 22.5" />
      <path d="M16 15.5 22 23" />
    </g>
    {/* satellite bodies */}
    <g fill="var(--sky-2)" stroke="var(--star-3)" strokeWidth="1.4">
      <circle cx="9" cy="8.5" r="2.1" />
      <circle cx="22.5" cy="9.5" r="2.1" />
      <circle cx="8.5" cy="22.5" r="2.1" />
      <circle cx="22" cy="23" r="2.1" />
    </g>
    {/* luminous core */}
    <circle cx="16" cy="15.5" r="3.4" fill="var(--azure)" />
    <circle cx="16" cy="15.5" r="3.4" fill="none" stroke="var(--azure)" strokeWidth="1.5" opacity="0.35" />
  </svg>
);

export const Logo = ({
  markSize = 36,
  className,
  subtitle = true,
}: {
  markSize?: number;
  className?: string;
  subtitle?: boolean;
}) => (
  <span className={`inline-flex items-center gap-3 ${className ?? ""}`}>
    <LogoMark size={markSize} />
    <span className="flex flex-col leading-none">
      <span className="flex items-baseline font-bold tracking-tight text-[15px] text-[var(--star-1)]">
        SOPH
        <span
          className="mx-[3px] inline-block h-[5px] w-[5px] rounded-full bg-[var(--azure)] align-middle"
          style={{ boxShadow: "0 0 6px 0 rgb(91 155 255 / 0.7)" }}
        />
        IA
      </span>
      {subtitle && (
        <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--star-3)]">
          Knowledge OS
        </span>
      )}
    </span>
  </span>
);
