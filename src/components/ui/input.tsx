import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full min-w-0 rounded-[8px] border border-[var(--edge)] bg-[var(--sky-3)] px-2.5 py-1 text-base text-[var(--star-1)] transition-all outline-none placeholder:text-[var(--star-3)] focus-visible:border-[var(--azure)] focus-visible:ring-3 focus-visible:ring-[var(--azure)]/15 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-[var(--danger)] aria-invalid:ring-3 aria-invalid:ring-[var(--danger)]/20 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
