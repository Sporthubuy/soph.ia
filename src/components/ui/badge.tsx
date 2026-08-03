import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-[var(--azure)] text-white [a]:hover:bg-[var(--azure-bright)]",
        secondary:
          "bg-[var(--sky-3)] text-[var(--star-1)] [a]:hover:bg-[var(--sky-4)]",
        destructive:
          "bg-[var(--danger)]/10 text-[var(--danger)] [a]:hover:bg-[var(--danger)]/20",
        outline:
          "border border-[var(--edge)] text-[var(--star-1)] [a]:hover:bg-[var(--sky-3)]",
        ghost:
          "hover:bg-[var(--sky-3)] text-[var(--star-2)] hover:text-[var(--star-1)]",
        link: "text-[var(--azure)] underline-offset-4 hover:underline",
        verified: "bg-[var(--verified)] text-white font-semibold [a]:hover:bg-[var(--verified)]/90",
        pending: "bg-[var(--pending)] text-[#1a1a1a] font-semibold [a]:hover:bg-[var(--pending)]/90",
        draft: "bg-[var(--draft)] text-white font-semibold [a]:hover:bg-[var(--draft)]/90",
        archived: "bg-[var(--archived)] text-white font-semibold [a]:hover:bg-[var(--archived)]/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
