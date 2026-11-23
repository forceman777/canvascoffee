import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';

interface FieldShell {
  label: string;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
  className?: string;
}

function Shell({ id, label, hint, error, optional, className = '', children }: FieldShell & { id: string; children: ReactNode }) {
  return (
    <div className={`field ${error ? 'has-error' : ''} ${className}`}>
      <label className="field__label" htmlFor={id}>
        {label}
        {optional && <span className="field__optional"> (optional)</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="field__hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
      {error && (
        <p className="field__error" id={`${id}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

const describedBy = (id: string, hint: unknown, error: unknown) =>
  [error ? `${id}-error` : hint ? `${id}-hint` : ''].filter(Boolean).join(' ') || undefined;

export function TextField({ label, hint, error, optional, className, id: given, ...input }: FieldShell & InputHTMLAttributes<HTMLInputElement>) {
  const auto = useId();
  const id = given ?? auto;
  return (
    <Shell id={id} label={label} hint={hint} error={error} optional={optional} className={className}>
      <input
        id={id}
        className="field__control"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        required={!optional}
        {...input}
      />
    </Shell>
  );
}

export function TextArea({ label, hint, error, optional, className, id: given, ...input }: FieldShell & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const auto = useId();
  const id = given ?? auto;
  return (
    <Shell id={id} label={label} hint={hint} error={error} optional={optional} className={className}>
      <textarea
        id={id}
        className="field__control field__control--area"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        required={!optional}
        rows={3}
        {...input}
      />
    </Shell>
  );
}

export function SelectField({ label, hint, error, optional, className, id: given, children, ...input }: FieldShell & SelectHTMLAttributes<HTMLSelectElement>) {
  const auto = useId();
  const id = given ?? auto;
  return (
    <Shell id={id} label={label} hint={hint} error={error} optional={optional} className={className}>
      <div className="field__select">
        <select
          id={id}
          className="field__control"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, hint, error)}
          required={!optional}
          {...input}
        >
          {children}
        </select>
      </div>
    </Shell>
  );
}

/** Hidden field that only bots fill in. Submissions with a value are dropped silently. */
export function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="honeypot" aria-hidden="true">
      <label>
        Leave this empty
        <input tabIndex={-1} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} />
      </label>
    </div>
  );
}
