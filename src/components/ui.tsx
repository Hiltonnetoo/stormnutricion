import React from "react";

/* ============================================================================
   cn — tiny class combiner
   ========================================================================== */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/* ============================================================================
   Button
   ========================================================================== */
type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  danger: "btn-danger",
};
const buttonSizes: Record<ButtonSize, string> = {
  sm: "btn-sm",
  md: "btn-md",
  lg: "btn-lg",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      leftIcon,
      rightIcon,
      loading,
      fullWidth,
      className,
      children,
      disabled,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "btn",
        buttonVariants[variant],
        buttonSizes[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {loading ? (
        <Spinner className="w-4 h-4" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      {children}
      {rightIcon && !loading && <span className="shrink-0">{rightIcon}</span>}
    </button>
  ),
);
Button.displayName = "Button";

/* ============================================================================
   Spinner
   ========================================================================== */
export const Spinner: React.FC<{ className?: string }> = ({
  className = "w-6 h-6",
}) => (
  <svg
    className={cn("animate-spin", className)}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

/* ============================================================================
   Card
   ========================================================================== */
export const Card: React.FC<
  React.HTMLAttributes<HTMLDivElement> & { hover?: boolean; elevated?: boolean }
> = ({ hover, elevated, className, children, ...props }) => (
  <div
    className={cn(
      elevated ? "card-elevated" : hover ? "card-hover" : "card",
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

/* ============================================================================
   Badge
   ========================================================================== */
type BadgeTone =
  | "sage"
  | "sky"
  | "amber"
  | "rose"
  | "slate"
  | "emerald";

export const Badge: React.FC<
  React.HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }
> = ({ tone = "slate", className, children, ...props }) => (
  <span className={cn("badge", `badge-${tone}`, className)} {...props}>
    {children}
  </span>
);

/* ============================================================================
   Input
   ========================================================================== */
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightSlot?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, leftIcon, rightSlot, className, id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="input-label">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "input-field",
              // "!" garante que a folga para o ícone vença o px-4 da classe
              // .input-field na cascata (correção D1 — lupa sobre o texto).
              !!leftIcon && "!pl-11",
              !!rightSlot && "!pr-11",
              error && "border-rose-400 focus:ring-rose-500/60 focus:border-rose-400",
              className,
            )}
            {...props}
          />
          {rightSlot && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              {rightSlot}
            </span>
          )}
        </div>
        {error ? (
          <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>
        ) : hint ? (
          <p className="mt-1.5 text-xs text-slate-400">{hint}</p>
        ) : null}
      </div>
    );
  },
);
Input.displayName = "Input";

/* ============================================================================
   PageHeader — consistent page title block
   ========================================================================== */
export const PageHeader: React.FC<{
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  eyebrow?: string;
}> = ({ title, subtitle, icon, actions, eyebrow }) => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
    <div className="flex items-start gap-4">
      {icon && (
        <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sage-50 text-sage-600 dark:bg-sage-500/15 dark:text-sage-400">
          {icon}
        </div>
      )}
      <div>
        {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-slate-500 dark:text-slate-400 max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>
    </div>
    {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
  </div>
);

/* ============================================================================
   EmptyState
   ========================================================================== */
export const EmptyState: React.FC<{
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}> = ({ icon, title, description, action, className }) => (
  <div
    className={cn(
      "flex flex-col items-center justify-center text-center py-16 px-6",
      className,
    )}
  >
    {icon && (
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
        {icon}
      </div>
    )}
    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
    {description && (
      <p className="mt-1.5 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        {description}
      </p>
    )}
    {action && <div className="mt-6">{action}</div>}
  </div>
);

/* ============================================================================
   Modal — accessible, animated dialog shell
   ========================================================================== */
export const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  icon?: React.ReactNode;
}> = ({ open, onClose, title, description, children, footer, size = "md", icon }) => {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  } as const;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative w-full bg-white dark:bg-slate-850 shadow-pop animate-scale-in",
          "rounded-t-3xl sm:rounded-3xl border border-slate-200/70 dark:border-slate-700/60",
          "max-h-[92vh] flex flex-col",
          sizes[size],
        )}
      >
        {(title || icon) && (
          <div className="flex items-start gap-4 p-6 pb-4">
            {icon && (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sage-50 text-sage-600 dark:bg-sage-500/15 dark:text-sage-400">
                {icon}
              </div>
            )}
            <div className="flex-1 min-w-0">
              {title && (
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors dark:hover:bg-slate-800"
              aria-label="Fechar"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-6 py-2">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-3 p-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

/* ============================================================================
   Skeleton
   ========================================================================== */
export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("skeleton", className)} />
);
