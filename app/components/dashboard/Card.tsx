import { clsx } from 'clsx'

export function Card({
  variant = 'default',
  className,
  children,
  ...rest
}: {
  variant?: 'default' | 'elevated'
  className?: string
  children: React.ReactNode
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        'rounded-[var(--radius-md)] bg-[var(--color-bg-primary)] p-4',
        variant === 'default'
          ? 'border border-[var(--color-border)] shadow-[var(--shadow-sm)]'
          : 'shadow-[var(--shadow-md)]',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  )
}
