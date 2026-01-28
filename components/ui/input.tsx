import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-foreground placeholder:text-muted-foreground selection:bg-blue-600 selection:text-white dark:bg-input/30 border-blue-200 dark:border-blue-800 h-9 w-full min-w-0 rounded-md border bg-white dark:bg-slate-900 px-3 py-1 text-base shadow-xs transition-all duration-200 ease-in-out outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:border-blue-500 focus-visible:ring-blue-500/30 focus-visible:ring-[3px] focus-visible:shadow-md',
        'hover:border-blue-300 dark:hover:border-blue-700',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
