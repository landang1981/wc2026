import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-pill font-body font-semibold text-sm transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon disabled:pointer-events-none disabled:opacity-40 select-none',
  {
    variants: {
      variant: {
        primary: 'bg-neon text-pitch-950 hover:bg-neon-dim shadow-neon-sm hover:shadow-neon active:scale-95',
        secondary: 'bg-pitch-700 text-white border border-pitch-600 hover:border-neon hover:text-neon active:scale-95',
        ghost: 'text-slate-400 hover:text-white hover:bg-pitch-700 active:scale-95',
        danger: 'bg-result-lose/10 text-result-lose border border-result-lose/30 hover:bg-result-lose hover:text-white active:scale-95',
        gold: 'bg-gold-gradient text-pitch-950 font-bold hover:shadow-gold active:scale-95',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-5 text-sm',
        lg: 'h-12 px-8 text-base',
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
)

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { isLoading?: boolean }

export function Button({ className, variant, size, isLoading, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      )}
      {children}
    </button>
  )
}