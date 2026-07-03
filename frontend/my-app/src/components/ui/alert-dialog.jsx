import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'

import { cn } from '@/lib/util'
import { Button } from '@/components/ui/button'

export const AlertDialog = AlertDialogPrimitive.Root
export const AlertDialogTrigger = AlertDialogPrimitive.Trigger
export const AlertDialogCancel = AlertDialogPrimitive.Cancel
export const AlertDialogAction = AlertDialogPrimitive.Action

export function AlertDialogContent({ className, children, ...props }) {
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/30" />
      <AlertDialogPrimitive.Content
        className={cn('fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-6 shadow-xl', className)}
        {...props}
      >
        {children}
      </AlertDialogPrimitive.Content>
    </AlertDialogPrimitive.Portal>
  )
}

export function AlertDialogHeader({ className, ...props }) {
  return <div className={cn('flex flex-col space-y-2', className)} {...props} />
}

export function AlertDialogTitle({ className, ...props }) {
  return <AlertDialogPrimitive.Title className={cn('font-heading text-lg font-semibold', className)} {...props} />
}

export function AlertDialogDescription({ className, ...props }) {
  return <AlertDialogPrimitive.Description className={cn('text-sm text-muted-foreground', className)} {...props} />
}

export function AlertDialogFooter({ className, ...props }) {
  return <div className={cn('mt-6 flex items-center justify-end gap-3', className)} {...props} />
}

AlertDialogCancel.displayName = 'AlertDialogCancel'
AlertDialogAction.displayName = 'AlertDialogAction'

const originalCancel = AlertDialogCancel
const originalAction = AlertDialogAction

export function AlertDialogCancelButton({ className, ...props }) {
  return (
    <originalCancel asChild>
      <Button variant="outline" className={className} {...props} />
    </originalCancel>
  )
}

export function AlertDialogActionButton({ className, ...props }) {
  return (
    <originalAction asChild>
      <Button className={className} {...props} />
    </originalAction>
  )
}