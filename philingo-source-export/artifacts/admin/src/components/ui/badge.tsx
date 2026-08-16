import * as React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  // @replit
  // Whitespace-nowrap: Badges should never wrap.
  'whitespace-nowrap inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2' +
    ' hover-elevate ',
  {
    variants: {
      variant: {
        default:
          // @replit shadow-xs instead of shadow, no hover because we use hover-elevate
          'border-transparent bg-primary text-primary-foreground shadow-xs',
        secondary:
          // @replit no hover because we use hover-elevate
          'border-transparent bg-secondary text-secondary-foreground',
        destructive:
          // @replit shadow-xs instead of shadow, no hover because we use hover-elevate
          'border-transparent bg-destructive text-destructive-foreground shadow-xs',
        // @replit shadow-xs" - use badge outline variable
        outline: 'text-foreground border [border-color:var(--badge-outline)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

// ── Convenience badges used across admin pages ────────────────────────────────

export function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge variant={isActive ? 'default' : 'secondary'}>
      {isActive ? 'Active' : 'Inactive'}
    </Badge>
  );
}

export function FeaturedBadge({ isFeatured }: { isFeatured: boolean }) {
  return isFeatured ? <Badge variant="default">Featured</Badge> : null;
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800 border-blue-200',
  in_progress: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  replied: 'bg-green-100 text-green-800 border-green-200',
  closed: 'bg-gray-100 text-gray-600 border-gray-200',
};
const statusLabels: Record<string, string> = {
  new: 'New', in_progress: 'In Progress', replied: 'Replied', closed: 'Closed',
};

export function ContactStatusBadge({ status }: { status: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold', statusColors[status] ?? 'bg-gray-100 text-gray-600')}>
      {statusLabels[status] ?? status}
    </span>
  );
}

const formTypeLabels: Record<string, string> = {
  contact: 'Contact', apply: 'Apply', consult: 'Consult',
  quotation: 'Quote', scholarship: 'Scholarship', seminar: 'Seminar',
};
const formTypeColors: Record<string, string> = {
  contact: 'bg-gray-100 text-gray-700 border-gray-200',
  apply: 'bg-blue-100 text-blue-700 border-blue-200',
  consult: 'bg-purple-100 text-purple-700 border-purple-200',
  quotation: 'bg-orange-100 text-orange-700 border-orange-200',
  scholarship: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  seminar: 'bg-green-100 text-green-700 border-green-200',
};

export function FormTypeBadge({ type }: { type: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold', formTypeColors[type] ?? 'bg-gray-100 text-gray-700')}>
      {formTypeLabels[type] ?? type}
    </span>
  );
}
