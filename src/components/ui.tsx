import clsx from 'clsx';
import { X } from 'lucide-react';
import { type ButtonHTMLAttributes, type ReactNode, useEffect, useId } from 'react';
import { createPortal } from 'react-dom';

// ---------------------------------------------------------------------------
// Botões
// ---------------------------------------------------------------------------

type Variant = 'primary' | 'secondary' | 'ghost' | 'soft' | 'danger' | 'butter';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-sage-600 text-white hover:bg-sage-700 shadow-sm shadow-sage-700/20',
  secondary: 'bg-white text-ink border border-line hover:border-sage-300 hover:bg-sage-50',
  ghost: 'text-ink-soft hover:bg-sage-50 hover:text-ink',
  soft: 'bg-sage-100 text-sage-800 hover:bg-sage-200',
  danger: 'bg-blush-50 text-blush-700 hover:bg-blush-100',
  butter: 'bg-butter-300 text-ink hover:bg-butter-500/80',
};

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: 'sm' | 'md' | 'lg'; icon?: ReactNode }) {
  return (
    <button
      type="button"
      {...props}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50',
        size === 'sm' && 'px-3 py-1.5 text-xs',
        size === 'md' && 'px-4 py-2.5 text-sm',
        size === 'lg' && 'px-6 py-3 text-base',
        VARIANTS[variant],
        className,
      )}
    >
      {icon}
      {children}
    </button>
  );
}

export function IconButton({
  label,
  className,
  children,
  active,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; active?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      {...props}
      className={clsx(
        'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition active:scale-90',
        active ? 'bg-butter-100 text-butter-700' : 'text-ink-soft hover:bg-sage-50 hover:text-ink',
        className,
      )}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Card, chips, badges
// ---------------------------------------------------------------------------

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className={clsx('card p-5', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ icon, title, action, subtitle }: { icon?: ReactNode; title: ReactNode; subtitle?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        {icon && <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sage-50 text-sage-600">{icon}</div>}
        <div>
          <h2 className="text-base font-bold leading-tight">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

export function Chip({
  active,
  onClick,
  children,
  className,
  icon,
}: {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={clsx(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition active:scale-95',
        active ? 'border-sage-600 bg-sage-600 text-white' : 'border-line bg-white text-ink-soft hover:border-sage-300',
        className,
      )}
    >
      {icon}
      {children}
    </button>
  );
}

type Tone = 'sage' | 'olive' | 'butter' | 'sky' | 'blush' | 'neutral';
const TONES: Record<Tone, string> = {
  sage: 'bg-sage-100 text-sage-800',
  olive: 'bg-olive-100 text-olive-700',
  butter: 'bg-butter-100 text-butter-700',
  sky: 'bg-sky-100 text-sky-700',
  blush: 'bg-blush-50 text-blush-700',
  neutral: 'bg-cream-2 text-ink-soft',
};

export function Badge({ tone = 'neutral', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return <span className={clsx('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold', TONES[tone], className)}>{children}</span>;
}

// ---------------------------------------------------------------------------
// Progresso
// ---------------------------------------------------------------------------

export function ProgressBar({ value, tone = 'sage', className, label }: { value: number; tone?: 'sage' | 'sky' | 'olive' | 'butter'; className?: string; label?: string }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  const bar = { sage: 'bg-sage-500', sky: 'bg-sky-500', olive: 'bg-olive-500', butter: 'bg-butter-500' }[tone];
  return (
    <div
      className={clsx('h-2.5 w-full overflow-hidden rounded-full bg-cream-2', className)}
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className={clsx('h-full rounded-full transition-[width] duration-700 ease-out', bar)} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function ProgressRing({
  value,
  size = 112,
  stroke = 10,
  color = 'var(--color-sage-500)',
  track = 'var(--color-cream-2)',
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value));
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Estados vazios / avisos
// ---------------------------------------------------------------------------

export function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-10 text-center animate-fade-up">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-sage-50 to-butter-50 text-sage-500">{icon}</div>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      {text && <p className="mt-1 max-w-sm text-sm text-muted">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Notice({ tone = 'butter', icon, children, className }: { tone?: 'butter' | 'sky' | 'sage'; icon?: ReactNode; children: ReactNode; className?: string }) {
  const t = { butter: 'bg-butter-50 border-butter-100 text-butter-700', sky: 'bg-sky-50 border-sky-100 text-sky-700', sage: 'bg-sage-50 border-sage-100 text-sage-800' }[tone];
  return (
    <div className={clsx('flex gap-2.5 rounded-2xl border px-3.5 py-2.5 text-xs leading-relaxed', t, className)}>
      {icon && <span className="mt-0.5 shrink-0">{icon}</span>}
      <div>{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Modal (sheet no celular, diálogo no desktop)
// ---------------------------------------------------------------------------

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby={id}>
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-[2px] animate-fade" onClick={onClose} />
      <div
        className={clsx(
          'relative flex max-h-[92dvh] w-full flex-col rounded-t-[2rem] bg-paper shadow-lift animate-sheet sm:rounded-[2rem]',
          wide ? 'sm:max-w-3xl' : 'sm:max-w-lg',
        )}
      >
        <div className="flex items-start justify-between gap-3 px-6 pt-5 pb-3">
          <div>
            <h2 id={id} className="font-display text-xl font-semibold">
              {title}
            </h2>
            {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
          </div>
          <IconButton label="Fechar" onClick={onClose}>
            <X size={18} />
          </IconButton>
        </div>
        <div className="flex-1 overflow-y-auto px-6 pb-6">{children}</div>
        {footer && <div className="border-t border-line/70 px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

// ---------------------------------------------------------------------------
// Abas segmentadas
// ---------------------------------------------------------------------------

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: ReactNode }[];
  className?: string;
}) {
  return (
    <div className={clsx('inline-flex rounded-full bg-cream-2 p-1', className)} role="tablist">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={clsx(
            'rounded-full px-4 py-1.5 text-sm font-semibold transition',
            value === o.value ? 'bg-white text-ink shadow-sm' : 'text-muted hover:text-ink',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function PageHeader({ title, subtitle, action, eyebrow }: { title: ReactNode; subtitle?: ReactNode; action?: ReactNode; eyebrow?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between animate-fade-up">
      <div>
        {eyebrow && <p className="mb-1 text-xs font-semibold tracking-widest text-sage-600 uppercase">{eyebrow}</p>}
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-2xl text-sm text-muted">{subtitle}</p>}
      </div>
      {action && <div className="flex flex-wrap gap-2">{action}</div>}
    </header>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={clsx('relative h-6 w-11 shrink-0 rounded-full transition', checked ? 'bg-sage-500' : 'bg-line')}
    >
      <span className={clsx('absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform', checked && 'translate-x-5')} />
    </button>
  );
}
