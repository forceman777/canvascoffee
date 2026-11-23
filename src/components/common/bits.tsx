import type { ReactNode } from 'react';
import { Minus, Plus, Info, Plug } from 'lucide-react';
import type { Diet } from '../../types/menu';
import { formatINR } from '../../utils/pricing';
import { Botanical } from './Botanical';
import { site } from '../../config/site';

export function Price({ amount, className = '' }: { amount: number; className?: string }) {
  return <span className={`price tabular ${className}`}>{formatINR(amount)}</span>;
}

/** Standard Indian food marks: green square + dot (veg), brown square + triangle (non-veg). */
export function DietMark({ diet }: { diet: Diet }) {
  if (!diet) return null;
  const label = diet === 'veg' ? 'Vegetarian' : 'Non-vegetarian';
  return (
    <span className={`diet diet--${diet}`} title={label}>
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
        <rect x="1" y="1" width="14" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
        {diet === 'veg' ? <circle cx="8" cy="8" r="3.6" fill="currentColor" /> : <path d="M8 4 L12.2 11.4 H3.8 Z" fill="currentColor" />}
      </svg>
      <span className="visually-hidden">{label}</span>
    </span>
  );
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 20,
  label,
  size = 'md',
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  label: string;
  size?: 'md' | 'sm';
}) {
  return (
    <div className={`stepper stepper--${size}`} role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={value - 1 < 1 ? 'Remove' : 'Decrease quantity'}>
        <Minus size={16} strokeWidth={1.8} />
      </button>
      <output className="tabular" aria-live="polite" aria-label="Quantity">
        {value}
      </output>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Increase quantity">
        <Plus size={16} strokeWidth={1.8} />
      </button>
    </div>
  );
}

/** Owner-facing setup hint, shown only in preview mode. */
export function DevHint({ children }: { children: ReactNode }) {
  return site.previewMode ? <p className="notice__dev">{children}</p> : null;
}

/** States whether a backend-dependent feature is connected. */
export function SetupNotice({ title, children, tone = 'light' }: { title: string; children: ReactNode; tone?: 'light' | 'dark' }) {
  return (
    <div className={`notice notice--setup notice--${tone}`} role="note">
      <Plug size={18} strokeWidth={1.6} aria-hidden="true" />
      <div>
        <p className="notice__title">{title}</p>
        <div className="notice__body">{children}</div>
      </div>
    </div>
  );
}

export function InfoNotice({ children, tone = 'light' }: { children: ReactNode; tone?: 'light' | 'dark' }) {
  return (
    <div className={`notice notice--info notice--${tone}`}>
      <Info size={18} strokeWidth={1.6} aria-hidden="true" />
      <div className="notice__body">{children}</div>
    </div>
  );
}

export function ErrorNotice({ children }: { children: ReactNode }) {
  return (
    <div className="notice notice--error" role="alert">
      <Info size={18} strokeWidth={1.6} aria-hidden="true" />
      <div className="notice__body">{children}</div>
    </div>
  );
}

export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="empty-state">
      <Botanical variant="cluster" className="empty-state__art" />
      <h2 className="empty-state__title">{title}</h2>
      {children && <div className="empty-state__body">{children}</div>}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
}

/** Thin brass rule with the ring motif, drawn in code. */
export function Ornament({ className = '' }: { className?: string }) {
  return (
    <div className={`ornament ${className}`} aria-hidden="true">
      <span />
      <i />
      <span />
    </div>
  );
}
