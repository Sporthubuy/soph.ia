/**
 * SOPH.IA logo. The isotype below is a PLACEHOLDER hexagonal "S" mesh — swap
 * the inner paths for the official traced isotype once the clean SVG lands in
 * public/. The wordmark follows the brand: lowercase "soph.ia" with ".ia"
 * emphasized in the electric-blue accent.
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
    {/* hexagon frame */}
    <path
      d="M16 2.6 27.6 9.3v13.4L16 29.4 4.4 22.7V9.3L16 2.6Z"
      stroke="var(--star-1)"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    {/* angular S mesh (placeholder for the official isotype) */}
    <path
      d="M21 10.5 11.5 10.5 11.5 15.8 20.5 15.8 20.5 21.5 11 21.5"
      stroke="var(--azure)"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11.5 10.5 20.5 15.8 11.5 15.8 20.5 21.5"
      stroke="var(--cyan)"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.7"
    />
  </svg>
);

export const Wordmark = ({ className }: { className?: string }) => (
  <span
    className={`inline-flex items-baseline tracking-tight text-[var(--star-1)] ${className ?? ""}`}
  >
    <span className="font-medium">soph</span>
    <span className="font-extrabold text-[var(--azure)]">.</span>
    <span className="font-extrabold">ia</span>
  </span>
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
  <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
    <LogoMark size={markSize} />
    <span className="flex flex-col leading-none">
      <Wordmark className="text-[17px]" />
      {subtitle && (
        <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--star-3)]">
          Knowledge OS
        </span>
      )}
    </span>
  </span>
);
