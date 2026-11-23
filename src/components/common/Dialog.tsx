import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Accessible title, rendered as the dialog heading. */
  title: ReactNode;
  children: ReactNode;
  className?: string;
  /** Visual style: centred panel or full-height side sheet. */
  variant?: 'panel' | 'sheet';
  hideTitle?: boolean;
}

/**
 * Accessible dialog built on the native <dialog> element: focus is trapped, the page is
 * inert, Escape closes it, and focus returns to the trigger. Backdrop clicks close it too.
 */
export function Dialog({ open, onClose, title, children, className = '', variant = 'panel', hideTitle }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) {
      returnFocus.current = document.activeElement as HTMLElement;
      el.showModal();
      document.documentElement.classList.add('has-dialog');
    } else if (!open && el.open) {
      el.close();
    }
  }, [open]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handleClose = () => {
      document.documentElement.classList.remove('has-dialog');
      returnFocus.current?.focus?.();
      onClose();
    };
    el.addEventListener('close', handleClose);
    return () => el.removeEventListener('close', handleClose);
  }, [onClose]);

  useEffect(() => () => document.documentElement.classList.remove('has-dialog'), []);

  return (
    <dialog
      ref={ref}
      className={`dialog dialog--${variant} ${className}`}
      aria-labelledby={titleId}
      onClick={(e) => {
        // Click on the backdrop (the dialog element itself, outside the inner panel)
        if (e.target === ref.current) ref.current?.close();
      }}
    >
      {open && (
        <div className="dialog__inner">
          <header className="dialog__header">
            <h2 id={titleId} className={hideTitle ? 'visually-hidden' : 'dialog__title'}>
              {title}
            </h2>
            <button type="button" className="dialog__close" onClick={() => ref.current?.close()} aria-label="Close">
              <X size={20} strokeWidth={1.6} />
            </button>
          </header>
          <div className="dialog__body">{children}</div>
        </div>
      )}
    </dialog>
  );
}
