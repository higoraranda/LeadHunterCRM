import * as React from 'react';
import { cn } from '@/lib/utils';
import type { StatusNegociacao } from '@/types';
import { STATUS_META } from '@/lib/status';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Quando informado, renderiza a pílula colorida do status do funil. */
  status?: StatusNegociacao;
}

export function Badge({ status, className, children, ...props }: BadgeProps) {
  const meta = status ? STATUS_META[status] : null;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        meta ? meta.badge : 'bg-muted text-muted-foreground ring-border',
        className
      )}
      {...props}
    >
      {meta && <span className={cn('h-1.5 w-1.5 rounded-full', meta.dot)} />}
      {meta ? meta.label : children}
    </span>
  );
}

export default Badge;
