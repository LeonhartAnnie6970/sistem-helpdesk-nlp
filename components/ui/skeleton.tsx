import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md', className)}
      {...props}
    />
  )
}

// Card Skeleton - untuk loading card dengan header dan content
function CardSkeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 space-y-4',
        className
      )}
      {...props}
    >
      <div className="space-y-2">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  )
}

// Stats Card Skeleton - untuk loading statistik cards
function StatsCardSkeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6',
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
      <Skeleton className="h-3 w-32 mt-4" />
    </div>
  )
}

// Table Row Skeleton - untuk loading baris tabel
function TableRowSkeleton({ columns = 4, className, ...props }: React.ComponentProps<'div'> & { columns?: number }) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-700',
        className
      )}
      {...props}
    >
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            i === 0 ? 'w-12' : i === columns - 1 ? 'w-20' : 'flex-1'
          )}
        />
      ))}
    </div>
  )
}

// Table Skeleton - untuk loading tabel lengkap
function TableSkeleton({ rows = 5, columns = 4, className, ...props }: React.ComponentProps<'div'> & { rows?: number; columns?: number }) {
  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden',
        className
      )}
      {...props}
    >
      {/* Header */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn(
              'h-4',
              i === 0 ? 'w-12' : i === columns - 1 ? 'w-20' : 'flex-1'
            )}
          />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <TableRowSkeleton key={i} columns={columns} />
      ))}
    </div>
  )
}

// Ticket Card Skeleton - untuk loading tiket cards
function TicketCardSkeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 space-y-3',
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-20 rounded" />
        <Skeleton className="h-5 w-16 rounded" />
      </div>
    </div>
  )
}

// Image Card Skeleton - untuk loading gallery/image cards
function ImageCardSkeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden',
        className
      )}
      {...props}
    >
      <Skeleton className="aspect-video w-full" />
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <Skeleton className="h-4 w-3/4" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  )
}

// Chart Skeleton - untuk loading charts
function ChartSkeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6',
        className
      )}
      {...props}
    >
      <div className="space-y-2 mb-6">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="flex items-end justify-between gap-2 h-48">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-t"
            style={{ height: `${Math.random() * 60 + 40}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-8" />
        ))}
      </div>
    </div>
  )
}

// List Item Skeleton - untuk loading list items
function ListItemSkeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 p-3 rounded-lg',
        className
      )}
      {...props}
    >
      <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      <Skeleton className="h-4 w-16" />
    </div>
  )
}

// Avatar Skeleton
function AvatarSkeleton({ size = 'md', className, ...props }: React.ComponentProps<'div'> & { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  }
  return (
    <Skeleton
      className={cn('rounded-full', sizeClasses[size], className)}
      {...props}
    />
  )
}

// Button Skeleton
function ButtonSkeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <Skeleton
      className={cn('h-10 w-24 rounded-md', className)}
      {...props}
    />
  )
}

// Text Line Skeleton
function TextSkeleton({ lines = 3, className, ...props }: React.ComponentProps<'div'> & { lines?: number }) {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            i === lines - 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  )
}

// Dashboard Stats Grid Skeleton
function DashboardStatsSkeleton({ count = 4, className, ...props }: React.ComponentProps<'div'> & { count?: number }) {
  return (
    <div
      className={cn('grid gap-4', className)}
      style={{ gridTemplateColumns: `repeat(${Math.min(count, 4)}, minmax(0, 1fr))` }}
      {...props}
    >
      {Array.from({ length: count }).map((_, i) => (
        <StatsCardSkeleton key={i} />
      ))}
    </div>
  )
}

// Ticket List Skeleton
function TicketListSkeleton({ count = 5, className, ...props }: React.ComponentProps<'div'> & { count?: number }) {
  return (
    <div className={cn('space-y-4', className)} {...props}>
      {Array.from({ length: count }).map((_, i) => (
        <TicketCardSkeleton key={i} />
      ))}
    </div>
  )
}

// Image Gallery Skeleton
function ImageGallerySkeleton({ count = 6, className, ...props }: React.ComponentProps<'div'> & { count?: number }) {
  return (
    <div
      className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4', className)}
      {...props}
    >
      {Array.from({ length: count }).map((_, i) => (
        <ImageCardSkeleton key={i} />
      ))}
    </div>
  )
}

export {
  Skeleton,
  CardSkeleton,
  StatsCardSkeleton,
  TableRowSkeleton,
  TableSkeleton,
  TicketCardSkeleton,
  ImageCardSkeleton,
  ChartSkeleton,
  ListItemSkeleton,
  AvatarSkeleton,
  ButtonSkeleton,
  TextSkeleton,
  DashboardStatsSkeleton,
  TicketListSkeleton,
  ImageGallerySkeleton
}
