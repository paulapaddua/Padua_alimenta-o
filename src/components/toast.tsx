import clsx from 'clsx';
import { CheckCircle2, Info } from 'lucide-react';
import { create } from 'zustand';

interface ToastItem {
  id: number;
  text: string;
  tone: 'success' | 'info';
  action?: { label: string; onClick: () => void };
}

interface ToastState {
  items: ToastItem[];
  push: (t: Omit<ToastItem, 'id'>) => void;
  dismiss: (id: number) => void;
}

let counter = 0;

export const useToast = create<ToastState>((set, get) => ({
  items: [],
  push: (t) => {
    const id = ++counter;
    set((s) => ({ items: [...s.items.slice(-2), { ...t, id }] }));
    setTimeout(() => get().dismiss(id), t.action ? 6000 : 3200);
  },
  dismiss: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
}));

export const toast = (text: string, opts: Partial<Omit<ToastItem, 'id' | 'text'>> = {}) =>
  useToast.getState().push({ text, tone: opts.tone ?? 'success', action: opts.action });

export function Toaster() {
  const { items, dismiss } = useToast();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4 lg:bottom-6" aria-live="polite">
      {items.map((t) => (
        <div
          key={t.id}
          className={clsx(
            'pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium shadow-lift animate-sheet',
            t.tone === 'success' ? 'bg-sage-700 text-white' : 'bg-ink text-white',
          )}
        >
          {t.tone === 'success' ? <CheckCircle2 size={18} className="shrink-0 text-butter-300" /> : <Info size={18} className="shrink-0 text-sky-300" />}
          <span>{t.text}</span>
          {t.action && (
            <button
              className="ml-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold hover:bg-white/25"
              onClick={() => {
                t.action!.onClick();
                dismiss(t.id);
              }}
            >
              {t.action.label}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
