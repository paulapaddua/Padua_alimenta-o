import clsx from 'clsx';
import {
  BarChart3,
  BookHeart,
  CalendarDays,
  CakeSlice,
  ChefHat,
  Home,
  LayoutGrid,
  ListChecks,
  NotebookPen,
  Settings,
  ShoppingBasket,
  Sprout,
  Store,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { DISCLAIMER } from '../data/plan/guidelines';
import { Toaster } from './toast';

export const NAV = [
  { to: '/', label: 'Hoje', icon: Home },
  { to: '/cardapio', label: 'Cardápio', icon: CalendarDays },
  { to: '/plano', label: 'Meu plano', icon: BookHeart },
  { to: '/doces', label: 'Vontade de doce', icon: CakeSlice },
  { to: '/alimentos', label: 'Frutas e vegetais', icon: Sprout },
  { to: '/compras', label: 'Lista de compras', icon: ShoppingBasket },
  { to: '/meal-prep', label: 'Meal Prep', icon: ChefHat },
  { to: '/diario', label: 'Diário', icon: NotebookPen },
  { to: '/habitos', label: 'Meus hábitos', icon: ListChecks },
  { to: '/comendo-fora', label: 'Comendo fora', icon: Store },
  { to: '/progresso', label: 'Progresso', icon: BarChart3 },
  { to: '/config', label: 'Configurações', icon: Settings },
];

const MOBILE_MAIN = ['/', '/cardapio', '/diario', '/compras'];

export function Logo({ compact }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sage-500 text-cream shadow-sm">
        <UtensilsCrossed size={19} />
      </div>
      {!compact && (
        <div>
          <p className="font-display text-xl leading-none font-semibold">Meu Prato</p>
          <p className="mt-1 text-[11px] text-muted">Pequenas escolhas, todos os dias.</p>
        </div>
      )}
    </div>
  );
}

export function Layout() {
  const [moreOpen, setMoreOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setMoreOpen(false);
    window.scrollTo({ top: 0 });
  }, [pathname]);

  const moreActive = !MOBILE_MAIN.includes(pathname);

  return (
    <div className="min-h-dvh lg:flex">
      {/* Menu lateral (desktop) */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line/70 bg-paper/70 px-4 py-6 backdrop-blur lg:flex">
        <div className="px-2">
          <Logo />
        </div>
        <nav className="mt-8 flex-1 space-y-0.5 overflow-y-auto" aria-label="Navegação principal">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition',
                  isActive ? 'bg-sage-100 text-sage-800' : 'text-ink-soft hover:bg-sage-50 hover:text-ink',
                )
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <p className="mt-4 px-2 text-[10.5px] leading-relaxed text-muted">{DISCLAIMER}</p>
      </aside>

      {/* Conteúdo */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between px-5 pt-5 lg:hidden">
          <Logo />
        </div>
        <main className="mx-auto w-full max-w-6xl px-4 pt-5 pb-32 sm:px-6 lg:px-10 lg:pt-10 lg:pb-16">
          <Outlet />
          <p className="mt-12 text-center text-[11px] text-muted lg:hidden">{DISCLAIMER}</p>
        </main>
      </div>

      {/* Navegação inferior (celular) */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line/70 bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
        aria-label="Navegação inferior"
      >
        <div className="mx-auto grid max-w-lg grid-cols-5">
          {NAV.filter((n) => MOBILE_MAIN.includes(n.to)).map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                clsx('flex flex-col items-center gap-1 py-2.5 text-[10.5px] font-semibold transition', isActive ? 'text-sage-700' : 'text-muted')
              }
            >
              {({ isActive }) => (
                <>
                  <span className={clsx('flex h-8 w-12 items-center justify-center rounded-full transition', isActive && 'bg-sage-100')}>
                    <Icon size={19} />
                  </span>
                  {label === 'Lista de compras' ? 'Compras' : label}
                </>
              )}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className={clsx('flex flex-col items-center gap-1 py-2.5 text-[10.5px] font-semibold', moreActive ? 'text-sage-700' : 'text-muted')}
          >
            <span className={clsx('flex h-8 w-12 items-center justify-center rounded-full', moreActive && 'bg-sage-100')}>
              <LayoutGrid size={19} />
            </span>
            Mais
          </button>
        </div>
      </nav>

      {moreOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Mais seções">
          <div className="absolute inset-0 bg-ink/30 animate-fade" onClick={() => setMoreOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 rounded-t-[2rem] bg-paper p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-lift animate-sheet">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-display text-lg font-semibold">Mais seções</p>
              <button className="rounded-full p-2 hover:bg-sage-50" onClick={() => setMoreOpen(false)} aria-label="Fechar">
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {NAV.filter((n) => !MOBILE_MAIN.includes(n.to)).map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    clsx(
                      'flex flex-col items-center gap-2 rounded-2xl border p-3 text-center text-xs font-semibold transition',
                      isActive ? 'border-sage-300 bg-sage-50 text-sage-800' : 'border-line bg-white text-ink-soft',
                    )
                  }
                >
                  <Icon size={20} />
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}
      <Toaster />
    </div>
  );
}
