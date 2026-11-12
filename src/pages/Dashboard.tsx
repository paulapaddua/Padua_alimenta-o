import { CakeSlice, CalendarDays, ListChecks, Package, Sparkles, Star, UtensilsCrossed } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { DayMealCard } from '../components/DayMealCard';
import { WaterCard } from '../components/water';
import { SlotIcon } from '../components/meal';
import { Badge, Card, CardTitle, EmptyState, ProgressBar, ProgressRing } from '../components/ui';
import { formatLong, greeting, minutesOf, nowMinutes, todayKey } from '../lib/dates';
import { SLOTS, SLOT_LABEL, isValidSelection, resolveSelection } from '../lib/menu';
import { messageOfDay } from '../lib/messages';
import { ingredientName } from '../lib/shopping';
import { dayStats, encouragement } from '../lib/stats';
import { useDayLog, useStore } from '../store/useStore';

export function nextMealSlot(statusOf: (s: (typeof SLOTS)[number]) => string | undefined, times: Record<string, string>) {
  const now = nowMinutes();
  const pending = SLOTS.filter((s) => (statusOf(s) ?? 'pendente') === 'pendente');
  return pending.find((s) => minutesOf(times[s]) + 90 >= now) ?? pending[0];
}

export default function Dashboard() {
  const today = todayKey();
  const ensurePlan = useStore((s) => s.ensurePlan);
  const settings = useStore((s) => s.settings);
  const plan = useStore((s) => s.plans[today]);
  const favorites = useStore((s) => s.favorites);
  const log = useDayLog(today);

  useEffect(() => {
    ensurePlan(today);
  }, [ensurePlan, today]);

  const stats = dayStats(log, settings.waterGoal);
  const next = nextMealSlot((s) => log.meals[s]?.status, settings.mealTimes);
  const nextSel = next ? plan?.meals[next] : undefined;
  const nextResolved = nextSel ? resolveSelection(nextSel) : null;
  const validFavorites = useMemo(() => favorites.filter((f) => isValidSelection(f.selection)).slice(-4).reverse(), [favorites]);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-sage-100 via-sage-50 to-butter-50 p-6 sm:p-8 animate-fade-up">
        <div className="pointer-events-none absolute -top-16 -right-10 h-56 w-56 rounded-full bg-butter-100/70 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-sky-100/60 blur-2xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-sage-700 capitalize">{formatLong(today)}</p>
            <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {greeting()}, {settings.name}!
            </h1>
            <p className="mt-1 text-ink-soft">Vamos cuidar da sua alimentação hoje?</p>
            <p className="mt-4 inline-flex max-w-md items-start gap-2 rounded-2xl bg-white/70 px-4 py-2.5 text-sm text-ink-soft italic backdrop-blur">
              <Sparkles size={16} className="mt-0.5 shrink-0 text-butter-500" />
              {messageOfDay(today)}
            </p>
          </div>
          <div className="flex items-center gap-4 self-start sm:self-auto">
            <ProgressRing value={stats.adherence / 100} size={120} stroke={11} color="var(--color-olive-500)" track="rgb(255 255 255 / 0.8)">
              <span className="font-display text-3xl font-semibold">{stats.adherence}%</span>
              <span className="text-[10px] font-semibold tracking-wide text-muted uppercase">do dia</span>
            </ProgressRing>
            <p className="max-w-[10rem] text-sm text-ink-soft">{encouragement(stats.adherence)}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* A. Resumo alimentar */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Suas refeições de hoje</h2>
            <Link to="/cardapio" className="text-sm font-semibold text-sage-700 hover:underline">
              Planejar semana →
            </Link>
          </div>
          {plan ? (
            SLOTS.map((s, i) => (
              <div key={s} className="animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                <DayMealCard date={today} slot={s} highlight={s === next} />
              </div>
            ))
          ) : (
            <Card>
              <EmptyState icon={<UtensilsCrossed size={26} />} title="Preparando seu cardápio…" text="Estamos montando as sugestões do dia com base no seu plano." />
            </Card>
          )}

          <Link
            to="/doces"
            className="group flex items-center gap-4 rounded-3xl border border-blush-100 bg-blush-50 p-4 transition hover:shadow-soft"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-blush-500 transition group-hover:scale-105">
              <CakeSlice size={21} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-blush-700">Estou com vontade de doce</p>
              <p className="text-xs text-blush-700/80">Tudo bem! Veja as receitas doces do seu plano.</p>
            </div>
          </Link>
        </section>

        <aside className="space-y-6">
          {/* C. Progresso do dia */}
          <Card className="animate-fade-up">
            <CardTitle icon={<ListChecks size={20} />} title="Progresso do dia" subtitle="Sem cobranças — só acompanhamento." />
            <div className="space-y-4">
              <StatRow label="Refeições registradas" value={`${stats.mealsDone} de ${stats.mealsTotal}`} pct={stats.mealsDone / stats.mealsTotal} tone="olive" />
              <StatRow label="Água" value={`${(stats.waterMl / 1000).toLocaleString('pt-BR')} L`} pct={stats.waterPct} tone="sky" />
              <StatRow label="Hábitos do dia" value={`${stats.habitsDone} de ${stats.habitsTotal}`} pct={stats.habitsDone / stats.habitsTotal} tone="butter" />
            </div>
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-sage-50 px-4 py-3">
              <span className="text-sm font-medium text-sage-800">Adesão ao planejamento</span>
              <span className="font-display text-xl font-semibold text-sage-800">{stats.adherence}%</span>
            </div>
            <Link to="/habitos" className="mt-3 block text-center text-sm font-semibold text-sage-700 hover:underline">
              Marcar hábitos de hoje →
            </Link>
          </Card>

          {/* B. Hidratação */}
          <WaterCard date={today} />

          {/* D. Minha organização */}
          <Card className="animate-fade-up">
            <CardTitle icon={<CalendarDays size={20} />} title="Minha organização" />
            {next && nextResolved ? (
              <div className="rounded-2xl bg-butter-50 p-4">
                <p className="text-xs font-semibold tracking-wide text-butter-700 uppercase">
                  Próxima refeição · {settings.mealTimes[next]}
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <SlotIcon slot={next} className="h-9 w-9" size={17} />
                  <div>
                    <p className="text-sm font-semibold">{SLOT_LABEL[next]}</p>
                    <p className="text-xs text-ink-soft">Sugestão do momento: {nextResolved.option.kind === 'prato' ? nextResolved.summary : nextResolved.title}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="rounded-2xl bg-olive-50 p-4 text-sm text-olive-700">Todas as refeições de hoje foram registradas. 🌿</p>
            )}

            <div className="mt-4">
              <p className="label flex items-center gap-1.5">
                <Star size={12} /> Favoritas
              </p>
              {validFavorites.length ? (
                <ul className="space-y-1.5">
                  {validFavorites.map((f) => {
                    const r = resolveSelection(f.selection)!;
                    return (
                      <li key={f.id} className="flex items-center gap-2 text-sm">
                        <Badge tone="neutral">{SLOT_LABEL[f.slot]}</Badge>
                        <span className="truncate">{r.option.kind === 'prato' ? r.summary : r.title}</span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-xs text-muted">Toque na ⭐ de uma refeição para guardá-la aqui.</p>
              )}
            </div>

            <div className="mt-4">
              <p className="label flex items-center gap-1.5">
                <Package size={12} /> Disponível em casa
              </p>
              {settings.pantry.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {settings.pantry.slice(0, 12).map((k) => (
                    <Badge key={k} tone="sage">
                      {ingredientName(k)}
                    </Badge>
                  ))}
                  {settings.pantry.length > 12 && <Badge>+{settings.pantry.length - 12}</Badge>}
                </div>
              ) : (
                <p className="text-xs text-muted">
                  Marque o que já tem em casa na <Link className="font-semibold text-sage-700 underline" to="/compras">lista de compras</Link>.
                </p>
              )}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function StatRow({ label, value, pct, tone }: { label: string; value: string; pct: number; tone: 'olive' | 'sky' | 'butter' }) {
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-sm">
        <span className="text-ink-soft">{label}</span>
        <span className="font-semibold">{value}</span>
      </div>
      <ProgressBar value={pct} tone={tone} label={label} />
    </div>
  );
}
