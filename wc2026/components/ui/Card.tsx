import { cn } from '@/lib/utils/cn'

type CardProps = React.HTMLAttributes<HTMLDivElement> & { glow?: 'neon' | 'gold' | 'none' }

export function Card({ className, glow = 'none', children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'relative rounded-card bg-card-gradient border border-pitch-600 shadow-card',
        'transition-all duration-200',
        glow === 'neon' && 'border-neon/30 shadow-neon-sm',
        glow === 'gold' && 'border-gold/30 shadow-gold',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-5 pt-5 pb-3 border-b border-pitch-600', className)} {...props} />
}

export function CardBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-5 py-4', className)} {...props} />
}