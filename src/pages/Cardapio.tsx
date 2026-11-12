import clsx from 'clsx';
import { CalendarRange, ChevronLeft, ChevronRight, Copy, Filter, Lock, RefreshCw, Shuffle, Wand2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DayMealCard } from '../components/DayMealCard';
import { MealPicker, SlotIcon } from '../components/meal';
import { toast } from '../components/toast';
import { Button, Chip, IconButton, Notice, PageHeader, Segmented } from '../components/ui';
import type { MealSlot, Tag } from '../data/types';
import { addDays, formatLong, formatShort, rangeDays, todayKey, weekdayName, weekdayShort } from '../lib/dates';
import { ALL_TAGS, SLOTS, SLOT_LABEL, TAG_LABEL, generateMeal, resolveSelection } from '../lib/menu';
import { useStore } from '../store/useStore';

export default function Cardapio() {
  const [params, setParams] = useSearchParams();
  const view = (params.get('v') as 'dia' | 'semana') ?? 'dia';
  const setView = (v: 'dia' | 'semana') => setParams((p) => (p.set('v', v), p), { replace: true });
  return (
    <div>
      <PageHeader
        eyebrow="Planejamento inteligente"
        title="Cardápio"
        subtitle="Combinações geradas exclusivamente com as alternativas do seu plano, nas quantidades prescritas. O cardápio fica salvo e não muda sozinho."
        action={
          <Segmented
            value={view}
            onChange={setView}
            options={[
              { value: 'dia', label: 'Dia' },
              { value: 'semana', label: '7 dias' },
            ]}
          />
        }
      />
      {view === 'dia' ? <DayView /> : <WeekView />}
    </div>
  );
}

function DayView() {
  const [date, setDate] = useState(todayKey());
  const ensurePlan = useStore((s) => s.ensurePlan);
  const regenerateDay = useStore((s) => s.regenerateDay);
  const setMeal = useStore((s) => s.setMeal);
  const plan = useStore((s) => s.plans[date]);
  const settings = useStore((s) => s.settings);
  const [filters, setFilters] = useState<Tag[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    ensurePlan(date);
  }, [date, ensurePlan]);

  const lockedCount = plan ? SLOTS.filter((s) => plan.locked?.[s]).length : 0;

  const generateWithFilters = () => {
    const missed: string[] = [];
    SLOTS.forEach((slot) => {
      const sel = generateMeal(slot, { dislikes: settings.dislikes, prefer: settings.prefer, filters, avoid: plan ? [plan.meals[slot]] : [] });
      if (sel) setMeal(date, slot, sel, false);
      else missed.push(SLOT_LABEL[slot]);
    });
    toast(missed.length ? `Sem opção com esses filtros para: ${missed.join(', ')} (mantido como estava).` : 'Cardápio gerado com os filtros escolhidos!', {
      tone: missed.length ? 'info' : 'success',
    });
  };

  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap items-center justify-between gap-3 p-3">
        <div className="flex items-center gap-1">
          <IconButton label="Dia anterior" onClick={() => setDate(addDays(date, -1))}>
            <ChevronLeft size={18} />
          </IconButton>
          <div className="min-w-44 text-center">
            <p className="text-sm font-bold capitalize">{formatLong(date)}</p>
            {date === todayKey() ? <p className="text-xs text-sage-600">Hoje</p> : <button className="text-xs text-sage-700 underline" onClick={() => setDate(todayKey())}>Voltar para hoje</button>}
          </div>
          <IconButton label="Próximo dia" onClick={() => setDate(addDays(date, 1))}>
            <ChevronRight size={18} />
          </IconButton>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" icon={<Filter size={14} />} onClick={() => setShowFilters((x) => !x)}>
            Filtros{filters.length ? ` (${filters.length})` : ''}
          </Button>
          <Button
            size="sm"
            icon={<Shuffle size={14} />}
            onClick={() => {
              regenerateDay(date);
              toast('Novo cardápio gerado! ✨');
            }}
          >
            Gerar outro cardápio
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="card space-y-3 p-4 animate-fade-up">
          <p className="text-sm text-ink-soft">Escolha filtros e gere um cardápio que combine com o seu dia. Quando uma refeição não tiver opção compatível no plano, ela é mantida.</p>
          <div className="flex flex-wrap gap-1.5">
            {ALL_TAGS.map((t) => (
              <Chip key={t} active={filters.includes(t)} onClick={() => setFilters((f) => (f.includes(t) ? f.filter((x) => x !== t) : [...f, t]))}>
                {TAG_LABEL[t]}
              </Chip>
            ))}
          </div>
          <div className="flex gap-2">
            <Button size="sm" disabled={!filters.length} icon={<Wand2 size={14} />} onClick={generateWithFilters}>
              Gerar com filtros
            </Button>
            {filters.length > 0 && (
              <Button size="sm" variant="ghost" onClick={() => setFilters([])}>
                Limpar
              </Button>
            )}
          </div>
        </div>
      )}

      {lockedCount > 0 && (
        <Notice tone="sky" icon={<Lock size={14} />}>
          {lockedCount} refeição(ões) escolhida(s) por você ficam preservadas ao gerar outro cardápio. Para trocar, use "Ver outras opções" ou o botão de trocar.
        </Notice>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        {SLOTS.map((s) => (
          <DayMealCard key={`${date}-${s}`} date={date} slot={s} defaultOpen />
        ))}
      </div>
    </div>
  );
}

function WeekView() {
  const [start, setStart] = useState(todayKey());
  const plans = useStore((s) => s.plans);
  const ensureRange = useStore((s) => s.ensureRange);
  const generateWeek = useStore((s) => s.generateWeek);
  const regenerateDay = useStore((s) => s.regenerateDay);
  const copyDay = useStore((s) => s.copyDay);
  const setMeal = useStore((s) => s.setMeal);
  const [picker, setPicker] = useState<{ date: string; slot: MealSlot } | null>(null);
  const days = rangeDays(start, 7);
  const missing = days.filter((d) => !plans[d]).length;

  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap items-center justify-between gap-3 p-3">
        <div className="flex items-center gap-1">
          <IconButton label="Semana anterior" onClick={() => setStart(addDays(start, -7))}>
            <ChevronLeft size={18} />
          </IconButton>
          <p className="min-w-40 text-center text-sm font-bold">
            {formatShort(days[0])} a {formatShort(days[6])}
          </p>
          <IconButton label="Próxima semana" onClick={() => setStart(addDays(start, 7))}>
            <ChevronRight size={18} />
          </IconButton>
          {start !== todayKey() && (
            <Button size="sm" variant="ghost" onClick={() => setStart(todayKey())}>
              A partir de hoje
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {missing > 0 && (
            <Button
              size="sm"
              icon={<CalendarRange size={14} />}
              onClick={() => {
                ensureRange(start, 7);
                toast('Próximos 7 dias planejados! 🗓️');
              }}
            >
              Planejar {missing === 7 ? 'os 7 dias' : `${missing} dia(s) restante(s)`}
            </Button>
          )}
          <Button
            size="sm"
            variant="secondary"
            icon={<Shuffle size={14} />}
            onClick={() => {
              generateWeek(start, true);
              toast('Semana regenerada — refeições escolhidas por você foram mantidas.');
            }}
          >
            Gerar nova semana
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {days.map((d, i) => {
          const plan = plans[d];
          return (
            <div key={d} className="card p-4 animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className={clsx('flex h-11 w-11 flex-col items-center justify-center rounded-2xl', d === todayKey() ? 'bg-sage-600 text-white' : 'bg-cream-2 text-ink-soft')}>
                    <span className="text-[10px] font-bold uppercase">{weekdayShort(d)}</span>
                    <span className="text-sm leading-none font-bold">{formatShort(d).slice(0, 2)}</span>
                  </div>
                  <div>
                    <p className="font-bold">{weekdayName(d)}</p>
                    <p className="text-xs text-muted">{d === todayKey() ? 'Hoje' : formatShort(d)}</p>
                  </div>
                </div>
                {plan && (
                  <div className="flex">
                    {i > 0 && (
                      <IconButton
                        label="Repetir o cardápio do dia anterior"
                        onClick={() => {
                          copyDay(days[i - 1], d);
                          toast('Cardápio do dia anterior copiado');
                        }}
                      >
                        <Copy size={16} />
                      </IconButton>
                    )}
                    <IconButton label="Gerar outro cardápio para este dia" onClick={() => regenerateDay(d)}>
                      <RefreshCw size={16} />
                    </IconButton>
                  </div>
                )}
              </div>
              {plan ? (
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                  {SLOTS.map((s) => {
                    const r = resolveSelection(plan.meals[s]);
                    return (
                      <button
                        key={s}
                        onClick={() => setPicker({ date: d, slot: s })}
                        className="flex items-start gap-2.5 rounded-2xl border border-line bg-white p-3 text-left transition hover:border-sage-300 hover:shadow-soft"
                      >
                        <SlotIcon slot={s} className="h-8 w-8" size={15} />
                        <div className="min-w-0">
                          <p className="flex items-center gap-1 text-[11px] font-bold tracking-wide text-muted uppercase">
                            {SLOT_LABEL[s]} {plan.locked?.[s] && <Lock size={10} />}
                          </p>
                          <p className="line-clamp-2 text-xs leading-snug font-medium">{r ? (r.option.kind === 'prato' ? r.summary : r.title) : '—'}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="rounded-2xl bg-cream-2/60 px-4 py-3 text-sm text-muted">Dia ainda não planejado. Use "Planejar" acima.</p>
              )}
            </div>
          );
        })}
      </div>

      {picker && (
        <MealPicker
          open
          onClose={() => setPicker(null)}
          slot={picker.slot}
          current={plans[picker.date]?.meals[picker.slot]}
          title={`${SLOT_LABEL[picker.slot]} · ${weekdayName(picker.date)}`}
          onSelect={(sel) => {
            setMeal(picker.date, picker.slot, sel, true);
            toast('Refeição atualizada');
          }}
        />
      )}
    </div>
  );
}
