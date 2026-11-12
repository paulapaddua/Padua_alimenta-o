import { HABITS } from '../data/plan/guidelines';
import type { DayLog } from '../store/types';
import { SLOTS } from './menu';

export const DAILY_HABITS = HABITS.filter((h) => h.frequency === 'diario');
export const WEEKLY_HABITS = HABITS.filter((h) => h.frequency === 'semanal');

export interface DayStats {
  mealsDone: number;
  mealsSkipped: number;
  mealsTotal: number;
  waterMl: number;
  waterPct: number;
  habitsDone: number;
  habitsTotal: number;
  /** 0–100. Média simples de: refeições registradas, água e hábitos do dia. */
  adherence: number;
  hasData: boolean;
}

export function dayStats(log: DayLog | undefined, waterGoal: number): DayStats {
  const meals = log?.meals ?? {};
  const mealsDone = SLOTS.filter((s) => meals[s]?.status === 'concluida').length;
  const mealsSkipped = SLOTS.filter((s) => meals[s]?.status === 'pulada').length;
  const waterMl = (log?.water ?? []).reduce((a, w) => a + w.ml, 0);
  const waterPct = Math.min(1, waterMl / waterGoal);
  const habitsDone = (log?.habits ?? []).filter((h) => DAILY_HABITS.some((d) => d.id === h)).length;
  const habitsTotal = DAILY_HABITS.length;
  const adherence = Math.round(((mealsDone / SLOTS.length + waterPct + habitsDone / habitsTotal) / 3) * 100);
  const hasData = mealsDone + mealsSkipped > 0 || waterMl > 0 || habitsDone > 0 || !!log?.notes || !!log?.activity?.done;
  return { mealsDone, mealsSkipped, mealsTotal: SLOTS.length, waterMl, waterPct, habitsDone, habitsTotal, adherence, hasData };
}

export function encouragement(pct: number): string {
  if (pct >= 85) return 'Que dia bonito de autocuidado! 🌿';
  if (pct >= 60) return 'Você está indo muito bem hoje.';
  if (pct >= 30) return 'Cada pequena escolha conta. Siga no seu ritmo.';
  if (pct > 0) return 'Bom começo! O dia ainda tem espaço para cuidado.';
  return 'Um novo dia, cheio de pequenas oportunidades.';
}
