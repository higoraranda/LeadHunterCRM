import * as React from 'react';
import { cn } from '@/lib/utils';

type Variant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type Size = 'sm' | 'default' | 'lg' | 'icon';

const variants: Record<Variant, string> = {
  default: 'gradient-primary text-primary-foreground shadow-glow hover:brightness-110',
  secondary: 'bg-muted text-foreground hover:bg-muted/70',
  outline: 'border border-border bg-card text-foreground hover:bg-muted hover:border-ring/40',
  ghost: 'text-foreground hover:bg-muted',
  destructive: 'bg-destructive text-destructive-foreground hover:brightness-110',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 rounded-md px-3 text-xs gap-1.5',
  default: 'h-10 rounded-lg px-4 text-sm gap-2',
  lg: 'h-11 rounded-lg px-6 text-sm gap-2',
  icon: 'h-9 w-9 rounded-lg',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex select-none items-center justify-center whitespace-nowrap font-medium transition-all',
        'active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = 'Button';

export default Button;
