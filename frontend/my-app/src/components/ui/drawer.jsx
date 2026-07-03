import * as DialogPrimitive from '@radix-ui/react-dialog'

import { cn } from '@/lib/util'

export const Drawer = DialogPrimitive.Root
export const DrawerTrigger = DialogPrimitive.Trigger
export const DrawerClose = DialogPrimitive.Close

export function DrawerContent({ className, children, ...props }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/30" />
      <DialogPrimitive.Content
        className={cn('fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl border border-border bg-card p-4 shadow-2xl', className)}
        {...props}
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-border" />
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

export function DrawerHeader({ className, ...props }) {
  return <div className={cn('mb-4 flex flex-col space-y-1.5', className)} {...props} />
}

export function DrawerTitle({ className, ...props }) {
  return <DialogPrimitive.Title className={cn('font-heading text-lg font-semibold', className)} {...props} />
}