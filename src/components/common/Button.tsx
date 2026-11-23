import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';

type Variant = 'primary' | 'secondary' | 'quiet' | 'brass';

interface Common {
  variant?: Variant;
  /** Use on dark surfaces. */
  onDark?: boolean;
  size?: 'md' | 'sm';
  icon?: ReactNode;
  loading?: boolean;
  block?: boolean;
}

const classes = ({ variant = 'primary', onDark, size = 'md', block, loading }: Common, extra = '') =>
  ['btn', `btn--${variant}`, onDark && 'btn--on-dark', size === 'sm' && 'btn--sm', block && 'btn--block', loading && 'is-loading', extra]
    .filter(Boolean)
    .join(' ');

export const Button = forwardRef<HTMLButtonElement, Common & ButtonHTMLAttributes<HTMLButtonElement>>(function Button(
  { variant, onDark, size, icon, loading, block, className, children, disabled, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={classes({ variant, onDark, size, block, loading }, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <span className="btn__spinner" aria-hidden="true" />}
      <span className="btn__label">{children}</span>
      {icon && !loading && <span className="btn__icon" aria-hidden="true">{icon}</span>}
    </button>
  );
});

export function ButtonLink({ variant, onDark, size, icon, block, className, children, ...rest }: Common & LinkProps) {
  return (
    <Link className={classes({ variant, onDark, size, block }, className)} {...rest}>
      <span className="btn__label">{children}</span>
      {icon && <span className="btn__icon" aria-hidden="true">{icon}</span>}
    </Link>
  );
}

export function ExternalButton({ variant, onDark, size, icon, block, className, children, ...rest }: Common & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={classes({ variant, onDark, size, block }, className)} target="_blank" rel="noopener noreferrer" {...rest}>
      <span className="btn__label">{children}</span>
      {icon && <span className="btn__icon" aria-hidden="true">{icon}</span>}
    </a>
  );
}
