import { forwardRef } from 'react'

import { cn } from '@/lib/util'

export const Textarea = forwardRef(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        'flex min-h-24 w-full rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:ring-2 focus:ring-ring',
        className,
      )}
      {...props}
    />
  )
})