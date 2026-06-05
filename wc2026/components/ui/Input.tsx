import { cn } from '@/lib/utils/cn'

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }

export function Input({ label, error, className, id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          'h-11 w-full rounded-chip bg-pitch-800 border border-pitch-600 px-4 text-white text-sm',
          'placeholder:text-slate-600 transition-colors duration-150',
          'focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon',
          error && 'border-result-lose focus:border-result-lose focus:ring-result-lose',
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-result-lose">{error}</span>}
    </div>
  )
}