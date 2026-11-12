import clsx from 'clsx';
import {
  Armchair,
  Beef,
  CalendarCheck,
  Check,
  ChefHat,
  ChevronLeft,
  ChevronRight,
  Cookie,
  Droplet,
  Droplets,
  Dumbbell,
  Eye,
  Flame,
  Hand,
  Heart,
  Leaf,
  Scale,
  Sparkles,
  Utensils,
  type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from '../components/toast';
import { Card, CardTitle, IconButton, PageHeader, ProgressBar, ProgressRing } from '../components/ui';
import { ACTIVITY, SELF_CARE, type Habit } from '../data/plan/guidelines';
import { addDays, formatLong, formatShort, rangeDays, todayKey, weekStart } from '../lib/dates';
import { DAILY_HABITS, WEEKLY_HABITS } from '../lib/stats';
import { useDayLog, useStore } from '../store/useStore';

const ICONS: Record<string, LucideIcon> = {
  armchair: Armchair,
  eye: Eye,
  utensils: Utensils,
  hand: Hand,
  cookie: Cookie,
  droplets: Droplets,
  dumbbell: Dumbbell,
  'calendar-check': CalendarCheck,
  flame: Flame,
  droplet: Droplet,
  beef: Beef,
  scale: Scale,
  leaf: Leaf,
  salt: Sparkles,
  'chef-hat': ChefHat,
};

const CHEERS = ['Isso aí! 🌿', 'Mais um cuidado com você ✨', 'Que bonito! 💚', 'Pequenas escolhas, todos os dias.'];

export default function Habitos() {
  const [date, setDate] = useState(todayKey());
  const log = useDayLog(date);
  const toggleHabit = useStore((s) => s.toggleHabit);
  const week = weekStart(date);
  const weekly = useStore((s) => s.weeklyHabits[week]) ?? [];
  const toggleWeekly = useStore((s) => s.toggleWeeklyHabit);
  const logs = useStore((s) => s.logs);
  const updateDay = useStore((s) => s.updateDay);

  const done = log.habits.filter((h) => DAILY_HABITS.some((d) => d.id === h)).length;
  const weekDays = rangeDays(week, 7);
  const activityDays = weekDays.filter((d) => logs[d]?.activity?.done).length;
  const activityMinutes = weekDays.reduce((a, d) => a + (logs[d]?.activity?.done ? (logs[d]?.activity?.minutes ?? 0) : 0), 0);

  const onToggle = (id: string) => {
    const wasDone = log.habits.includes(id);
    toggleHabit(date, id);
    if (!wasDone) toast(CHEERS[Math.floor(Math.random() * CHEERS.length)]);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Orientações da sua nutricionista"
        title="Meus hábitos"
        subtitle="Um checklist gentil para lembrar do que faz bem. Não é uma lista de cobranças — marque o que fizer sentido no seu dia."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <Card>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1">
              <IconButton label="Dia anterior" onClick={() => setDate(addDays(date, -1))}>
                <ChevronLeft size={18} />
              </IconButton>
              <div className="text-center">
                <p className="text-sm font-bold capitalize">{formatLong(date)}</p>
                <p className="text-xs text-muted">Checklist diário</p>
              </div>
              <IconButton label="Próximo dia" onClick={() => setDate(addDays(date, 1))} disabled={date >= todayKey()}>
                <ChevronRight size={18} />
              </IconButton>
            </div>
            <div className="w-40">
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-muted">Hoje</span>
                <span className="font-semibold">
                  {done}/{DAILY_HABITS.length}
                </span>
              </div>
              <ProgressBar value={done / DAILY_HABITS.length} tone="butter" label="Hábitos do dia" />
            </div>
          </div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {DAILY_HABITS.map((h) => (
              <HabitItem key={h.id} habit={h} done={log.habits.includes(h.id)} onToggle={() => onToggle(h.id)} />
            ))}
          </ul>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardTitle icon={<Dumbbell size={20} />} title="Atividade física na semana" subtitle={`${formatShort(weekDays[0])} a ${formatShort(weekDays[6])}`} />
            <div className="flex items-center gap-4">
              <ProgressRing value={activityDays / ACTIVITY.minPerWeek} size={96} stroke={9} color="var(--color-olive-500)">
                <span className="font-display text-2xl font-semibold">{activityDays}</span>
                <span className="text-[10px] text-muted">de 3–5</span>
              </ProgressRing>
              <div className="text-sm text-ink-soft">
                <p>{activityMinutes ? `${activityMinutes} min registrados` : 'Registre seus treinos aqui ou no Diário.'}</p>
                <p className="mt-1 text-xs text-muted">{ACTIVITY.text}</p>
              </div>
            </div>
            <button
              onClick={() => updateDay(date, { activity: { ...log.activity, done: !log.activity.done, minutes: log.activity.minutes ?? (log.activity.done ? undefined : ACTIVITY.minutes) } })}
              className={clsx(
                'mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border py-2.5 text-sm font-semibold transition',
                log.activity.done ? 'border-olive-500 bg-olive-50 text-olive-700' : 'border-line hover:border-sage-300',
              )}
            >
              {log.activity.done ? <Check size={16} /> : <Dumbbell size={16} />}
              {log.activity.done ? 'Atividade registrada neste dia' : 'Fiz atividade física neste dia'}
            </button>
          </Card>

          <Card>
            <CardTitle icon={<CalendarCheck size={20} />} title="Checklist semanal" />
            <ul className="space-y-2">
              {WEEKLY_HABITS.filter((h) => h.id !== 'atividade').map((h) => (
                <HabitItem key={h.id} habit={h} done={weekly.includes(h.id)} onToggle={() => toggleWeekly(week, h.id)} />
              ))}
            </ul>
          </Card>

          <Card className="bg-gradient-to-br from-butter-50 to-paper">
            <CardTitle icon={<Heart size={20} />} title="Autocuidado" subtitle="Meta do seu plano" />
            <ul className="space-y-2 text-sm">
              {SELF_CARE.map((s) => (
                <li key={s.title}>
                  <strong>{s.title}:</strong> <span className="text-ink-soft">{s.text}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

function HabitItem({ habit, done, onToggle }: { habit: Habit; done: boolean; onToggle: () => void }) {
  const Icon = ICONS[habit.icon] ?? Sparkles;
  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={done}
        className={clsx(
          'flex h-full w-full items-start gap-3 rounded-2xl border p-3 text-left transition active:scale-[0.99]',
          done ? 'border-olive-100 bg-olive-50' : 'border-line bg-white hover:border-sage-300',
        )}
      >
        <span className={clsx('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition', done ? 'bg-olive-500 text-white' : 'bg-sage-50 text-sage-600')}>
          {done ? <Check size={17} strokeWidth={3} className="animate-pop" /> : <Icon size={17} />}
        </span>
        <span>
          <span className="block text-sm font-semibold">{habit.title}</span>
          <span className="block text-xs text-muted">{habit.detail}</span>
        </span>
      </button>
    </li>
  );
}
