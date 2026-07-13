import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import styles from './FormField.module.css';

export interface FormFieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}

/**
 * Labels a control and reserves a slot for a hint or validation error below
 * it. Doesn't render the control itself — pass a TextInput/Textarea/Select/
 * Checkbox (or any custom control) as `children` and wire `htmlFor` to its `id`.
 */
export function FormField({ label, htmlFor, hint, error, children }: FormFieldProps) {
  const errorId = error ? `${htmlFor}-error` : undefined;
  const hintId = hint ? `${htmlFor}-hint` : undefined;

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint && !error && (
        <span id={hintId} className={styles.hint}>
          {hint}
        </span>
      )}
      {error && (
        <span id={errorId} role="alert" className={styles.error}>
          {error}
        </span>
      )}
    </div>
  );
}

function controlClassName(invalid: boolean | undefined, className?: string) {
  return [styles.control, invalid ? styles.controlInvalid : '', className]
    .filter(Boolean)
    .join(' ');
}

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ invalid, className, ...rest }, ref) => (
    <input ref={ref} className={controlClassName(invalid, className)} {...rest} />
  ),
);
TextInput.displayName = 'TextInput';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ invalid, className, ...rest }, ref) => (
    <textarea ref={ref} className={controlClassName(invalid, className)} {...rest} />
  ),
);
Textarea.displayName = 'Textarea';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ invalid, className, children, ...rest }, ref) => (
    <select ref={ref} className={controlClassName(invalid, className)} {...rest}>
      {children}
    </select>
  ),
);
Select.displayName = 'Select';

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, id, className, ...rest }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <span className={styles.checkboxRow}>
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          className={[styles.checkbox, className].filter(Boolean).join(' ')}
          {...rest}
        />
        <label htmlFor={inputId}>{label}</label>
      </span>
    );
  },
);
Checkbox.displayName = 'Checkbox';
