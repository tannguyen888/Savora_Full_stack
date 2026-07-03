import { cn } from '@/lib/util'

export function Badge({ className, variant = 'default', ...props }) {
  const styles = variant === 'outline'
    ? 'border border-border bg-card text-card-foreground'
    : variant === 'secondary'
      ? 'bg-secondary text-secondary-foreground'
      : 'bg-primary/10 text-primary'

  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium', styles, className)} {...props} />
}