import { forwardRef } from 'react'

import { cn } from '@/lib/util'

export const Label = forwardRef(function Label({ className, ...props }, ref) {
  return <label ref={ref} className={cn('text-sm font-medium text-foreground', className)} {...props} />
})