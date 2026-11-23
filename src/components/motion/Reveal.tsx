import type { ElementType, ReactNode } from 'react';
import { useReveal } from '../../hooks';

/**
 * Restrained scroll reveal. Use sparingly: section headings and key images only.
 * kind="rise": opacity + 14px lift. kind="unveil": image clip-path reveal.
 */
export function Reveal({
  as: Tag = 'div',
  kind = 'rise',
  delay = 0,
  className = '',
  children,
}: {
  as?: ElementType;
  kind?: 'rise' | 'unveil' | 'fade';
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  const ref = useReveal<HTMLElement>();
  return (
    <Tag ref={ref} className={`reveal reveal--${kind} ${className}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </Tag>
  );
}
