import clsx from 'clsx';
import { CakeSlice, ChevronLeft, ChevronRight, Dumbbell, NotebookPen, PenLine, Shuffle } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MealDetail, MealPicker, SlotIcon } from '../components/meal';
import { toast } from '../components/toast';
import { Badge, Button, Card, CardTitle, Chip, PageHeader, Segmented, Toggle } from '../components/ui';
import { WaterCard } from '../components/water';
import { SWEETS } from '../data/plan/sweets';
import type { MealSlot } from '../data/types';
import { addDays, dateKey, formatLong, formatShort, monthName, parseKey, rangeDays, todayKey, weekStart, weekdayShort } from '../lib/dates';
import { SLOTS, SLOT_LABEL, resolveSelection } from '../lib/menu';
import { dayStats } from '../lib/stats';
import type { MealStatus } from '../store/types';
import { useDayLog, useStore } from '../store/useStore';

export default function Diario() {
  const [params] = useSearchParams();
  const [date, setDate] = useState(todayKey());
  const [mode, setMode] = useState<'mes' | 'semana'>('mes');
  const waterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (params.get('tab') === 'agua') setTimeout(() => waterRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  }, [params]);

  return (
    <div>
      <PageHeader
        eyebrow="Acompanhar hábitos, não gerar culpa"
        title="Diário alimentar"
        subtitle="Registre e consulte seus dias. Refeições puladas ou substituídas fazem parte da vida — aqui elas são só anotações."
        action={
          <Segmented
            value={mode}
            onChange={setMode}
            options={[
              { value: 'mes', label: 'Mês' },
              { value: 'semana', label: 'Semana' },
            ]}
          />
        }
      />
      <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
        <div className="space-y-5">
          {mode === 'mes' ? <MonthCalendar selected={date} onSelect={setDate} /> : <WeekList selected={date} onSelect={setDate} />}
        </div>
        <div className="space-y-5">
          <DayEditor date={date} />
          <div ref={waterRef}>
            <WaterCard date={date} />
          </div>
        </div>
      </div>
    </div>
  );
}

function dotColor(adherence: number, hasData: boolean) {
  if (!hasData) return 'bg-transparent';
  if (adherence >= 70) return 'bg-olive-500';
  if (adherence >= 35) return 'bg-sage-400';
  return 'bg-butter-500';
}

function MonthCalendar({ selected, onSelect }: { selected: string; onSelect: (d: string) => void }) {
  const [month, setMonth] = useState(() => {
    const d = parseKey(selected);
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const logs = useStore((s) => s.logs);
  const goal = useStore((s) => s.settings.waterGoal);

  const first = new Date(month.y, month.m, 1);
  const startKey = weekStart(dateKey(first));
  const cells = rangeDays(startKey, 42);
  const monthDays = cells.filter((k) => parseKey(k).getMonth() === month.m);

  const summary = useMemo(() => {
    const stats = monthDays.filter((d) => d <= todayKey()).map((d) => dayStats(logs[d], goal));
    const withData = stats.filter((s) => s.hasData);
    const mealsDone = withData.reduce((a, s) => a + s.mealsDone, 0);
    return {
      days: withData.length,
      avg: withData.length ? Math.round(withData.reduce((a, s) => a + s.adherence, 0) / withData.length) : 0,
      mealsPct: withData.length ? Math.round((mealsDone / (withData.length * 4)) * 100) : 0,
      activity: monthDays.filter((d) => logs[d]?.activity?.done).length,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logs, goal, month]);

  const shift = (n: number) => setMonth(({ y, m }) => ({ y: m + n < 0 ? y - 1 : m + n > 11 ? y + 1 : y, m: (m + n + 12) % 12 }));

  return (
    <>
      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <button className="rounded-full p-2 hover:bg-sage-50" onClick={() => shift(-1)} aria-label="Mês anterior">
            <ChevronLeft size={18} />
          </button>
          <p className="font-display text-lg font-semibold capitalize">
            {monthName(month.m)} {month.y}
          </p>
          <button className="rounded-full p-2 hover:bg-sage-50" onClick={() => shift(1)} aria-label="Próximo mês">
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-muted">
          {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((k) => {
            const inMonth = parseKey(k).getMonth() === month.m;
            const st = dayStats(logs[k], goal);
            const isSel = k === selected;
            const isToday = k === todayKey();
            return (
              <button
                key={k}
                onClick={() => onSelect(k)}
                className={clsx(
                  'flex aspect-square flex-col items-center justify-center rounded-xl text-sm transition',
                  !inMonth && 'text-muted/40',
                  isSel ? 'bg-sage-600 font-bold text-white' : 'hover:bg-sage-50',
                  isToday && !isSel && 'font-bold text-sage-700 ring-1 ring-sage-300',
                )}
                aria-label={`${formatLong(k)}${st.hasData ? `, adesão ${st.adherence}%` : ''}`}
              >
                {parseKey(k).getDate()}
                <span className={clsx('mt-0.5 h-1.5 w-1.5 rounded-full', isSel && st.hasData ? 'bg-white' : dotColor(st.adherence, st.hasData))} />
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-muted">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-olive-500" /> dia bem cuidado
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-sage-400" /> parcial
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-butter-500" /> começo
          </span>
        </div>
      </Card>
      <Card>
        <p className="label">Resumo do mês</p>
        <div className="grid grid-cols-2 gap-3">
          <Mini label="Dias registrados" value={summary.days} />
          <Mini label="Adesão média" value={`${summary.avg}%`} />
          <Mini label="Refeições registradas" value={`${summary.mealsPct}%`} />
          <Mini label="Dias com atividade" value={summary.activity} />
        </div>
      </Card>
    </>
  );
}

function Mini({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-cream-2/60 p-3">
      <p className="font-display text-2xl font-semibold">{value}</p>
      <p className="text-[11px] text-muted">{label}</p>
    </div>
  );
}

function WeekList({ selected, onSelect }: { selected: string; onSelect: (d: string) => void }) {
  const [start, setStart] = useState(weekStart(selected));
  const logs = useStore((s) => s.logs);
  const goal = useStore((s) => s.settings.waterGoal);
  const days = rangeDays(start, 7);
  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <button className="rounded-full p-2 hover:bg-sage-50" onClick={() => setStart(addDays(start, -7))} aria-label="Semana anterior">
          <ChevronLeft size={18} />
        </button>
        <p className="text-sm font-bold">
          {formatShort(days[0])} – {formatShort(days[6])}
        </p>
        <button className="rounded-full p-2 hover:bg-sage-50" onClick={() => setStart(addDays(start, 7))} aria-label="Próxima semana">
          <ChevronRight size={18} />
        </button>
      </div>
      <ul className="space-y-1.5">
        {days.map((d) => {
          const st = dayStats(logs[d], goal);
          return (
            <li key={d}>
              <button
                onClick={() => onSelect(d)}
                className={clsx('flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition', d === selected ? 'bg-sage-100' : 'hover:bg-sage-50')}
              >
                <span className="w-16 text-sm font-semibold">
                  {weekdayShort(d)} {formatShort(d).slice(0, 2)}
                </span>
                <span className="flex-1 text-xs text-muted">
                  {st.hasData ? `${st.mealsDone}/4 refeições · ${(st.waterMl / 1000).toLocaleString('pt-BR')} L` : 'sem registros'}
                </span>
                {st.hasData && <Badge tone={st.adherence >= 70 ? 'olive' : 'sage'}>{st.adherence}%</Badge>}
              </button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function DayEditor({ date }: { date: string }) {
  const log = useDayLog(date);
  const updateDay = useStore((s) => s.updateDay);
  const plan = useStore((s) => s.plans[date]);
  const [notes, setNotes] = useState(log.notes);
  useEffect(() => setNotes(log.notes), [date, log.notes]);

  return (
    <Card>
      <CardTitle
        icon={<NotebookPen size={20} />}
        title={<span className="capitalize">{formatLong(date)}</span>}
        subtitle={date === todayKey() ? 'Hoje' : date > todayKey() ? 'Dia futuro' : 'Editando um registro anterior'}
      />
      <div className="space-y-3">
        {SLOTS.map((s) => (
          <MealLogRow key={s} date={date} slot={s} planned={plan?.meals[s] !== undefined} />
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-line p-4">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Dumbbell size={16} className="text-sage-600" /> Atividade física
            </p>
            <Toggle checked={log.activity.done} onChange={(v) => updateDay(date, { activity: { ...log.activity, done: v } })} label="Realizei atividade física" />
          </div>
          {log.activity.done && (
            <div className="mt-3 grid grid-cols-2 gap-2 animate-fade-up">
              <input
                className="input py-2"
                inputMode="numeric"
                placeholder="Minutos"
                value={log.activity.minutes ?? ''}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '');
                  updateDay(date, { activity: { ...log.activity, minutes: v ? Math.min(600, Number(v)) : undefined } });
                }}
                aria-label="Minutos de atividade"
              />
              <input
                className="input py-2"
                placeholder="Tipo (ex.: caminhada)"
                value={log.activity.kind ?? ''}
                onChange={(e) => updateDay(date, { activity: { ...log.activity, kind: e.target.value } })}
                aria-label="Tipo de atividade"
              />
            </div>
          )}
          <p className="mt-2 text-[11px] text-muted">Meta do plano: pelo menos 40 min, 3 a 5 vezes por semana, sob orientação profissional.</p>
        </div>

        <div className="rounded-2xl border border-line p-4">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <CakeSlice size={16} className="text-blush-500" /> Vontade de doce
            </p>
            <Toggle checked={log.sweetCraving} onChange={(v) => updateDay(date, { sweetCraving: v, sweetRecipe: v ? log.sweetRecipe : undefined })} label="Houve vontade de doce" />
          </div>
          {log.sweetCraving && (
            <div className="mt-3 flex flex-wrap gap-1.5 animate-fade-up">
              {SWEETS.map((s) => (
                <Chip key={s.id} active={log.sweetRecipe === s.id} onClick={() => updateDay(date, { sweetRecipe: log.sweetRecipe === s.id ? undefined : s.id })}>
                  {s.title}
                </Chip>
              ))}
            </div>
          )}
          <p className="mt-2 text-[11px] text-muted">É natural! Registrar ajuda a perceber padrões, sem julgamentos.</p>
        </div>
      </div>

      <div className="mt-4">
        <label className="label" htmlFor="notes">
          Observações pessoais
        </label>
        <textarea
          id="notes"
          className="input min-h-24"
          placeholder="Como você se sentiu hoje? Algo especial aconteceu?"
          value={notes}
          maxLength={2000}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => notes !== log.notes && (updateDay(date, { notes }), toast('Observações salvas'))}
        />
        <div className="mt-1 flex justify-between text-[11px] text-muted">
          <span>Salva automaticamente ao sair do campo.</span>
          <Link to="/habitos" className="font-semibold text-sage-700">
            Hábitos do dia →
          </Link>
        </div>
      </div>
    </Card>
  );
}

function MealLogRow({ date, slot, planned }: { date: string; slot: MealSlot; planned: boolean }) {
  const log = useDayLog(date).meals[slot];
  const plan = useStore((s) => s.plans[date]);
  const setMealLog = useStore((s) => s.setMealLog);
  const [picker, setPicker] = useState(false);
  const [editingOther, setEditingOther] = useState(false);
  const [other, setOther] = useState(log?.other ?? '');
  const status: MealStatus = log?.status ?? 'pendente';
  const sel = log?.selection;
  const r = sel ? resolveSelection(sel) : null;
  const [open, setOpen] = useState(false);

  const setStatus = (st: MealStatus) => {
    if (st === 'concluida' && !log?.selection && !log?.other && plan) setMealLog(date, slot, { status: st, selection: plan.meals[slot] });
    else setMealLog(date, slot, { status: st });
  };

  return (
    <div className="rounded-2xl border border-line p-3">
      <div className="flex flex-wrap items-center gap-3">
        <SlotIcon slot={slot} className="h-9 w-9" size={16} />
        <p className="flex-1 text-sm font-bold">{SLOT_LABEL[slot]}</p>
        <div className="flex gap-1">
          {(['concluida', 'pulada', 'pendente'] as MealStatus[]).map((st) => (
            <Chip key={st} active={status === st} onClick={() => setStatus(st)}>
              {st === 'concluida' ? 'Concluída' : st === 'pulada' ? 'Pulada' : 'Pendente'}
            </Chip>
          ))}
        </div>
      </div>
      {status === 'concluida' && (
        <div className="mt-2 pl-12">
          {log?.other ? (
            <p className="text-sm text-ink-soft">
              Outra coisa: <span className="font-medium text-ink">{log.other}</span>
            </p>
          ) : r ? (
            <button className="text-left text-sm" onClick={() => setOpen((o) => !o)}>
              {r.option.kind === 'prato' ? r.summary : r.title} <span className="text-xs text-sage-700">{open ? '(ocultar)' : '(ver)'}</span>
            </button>
          ) : (
            <p className="text-sm text-muted">Sem detalhes registrados.</p>
          )}
          {open && sel && (
            <div className="mt-2 rounded-2xl bg-cream-2/50 p-3">
              <MealDetail selection={sel} compact />
            </div>
          )}
          {editingOther ? (
            <div className="mt-2 flex gap-2">
              <input className="input py-2" value={other} onChange={(e) => setOther(e.target.value)} placeholder="O que você comeu?" autoFocus />
              <Button
                size="sm"
                onClick={() => {
                  if (other.trim().length < 2) return;
                  setMealLog(date, slot, { other: other.trim(), selection: undefined });
                  setEditingOther(false);
                }}
              >
                Salvar
              </Button>
            </div>
          ) : (
            <div className="mt-2 flex flex-wrap gap-2">
              <Button size="sm" variant="ghost" icon={<Shuffle size={13} />} onClick={() => setPicker(true)}>
                Escolher opção do plano
              </Button>
              <Button size="sm" variant="ghost" icon={<PenLine size={13} />} onClick={() => setEditingOther(true)}>
                Comi outra coisa
              </Button>
            </div>
          )}
          {log?.time && <p className="mt-1 text-[11px] text-muted">Registrada às {log.time}</p>}
        </div>
      )}
      {!planned && status === 'pendente' && <p className="mt-1 pl-12 text-[11px] text-muted">Sem cardápio planejado para este dia.</p>}
      <MealPicker
        open={picker}
        onClose={() => setPicker(false)}
        slot={slot}
        current={sel ?? plan?.meals[slot]}
        initialTab="montar"
        title={`O que você comeu? · ${SLOT_LABEL[slot]}`}
        onSelect={(s) => setMealLog(date, slot, { status: 'concluida', selection: s, other: undefined })}
      />
    </div>
  );
}
