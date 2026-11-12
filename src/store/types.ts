import type { MealSlot, Selection, ShoppingCategory, Tag } from '../data/types';

/** Dados PESSOAIS (preferências e registros). Nunca alteram o plano prescrito. */

export type MealStatus = 'pendente' | 'concluida' | 'pulada';

export interface MealLog {
  status: MealStatus;
  /** O que foi consumido (opção do plano). */
  selection?: Selection;
  /** Quando comeu algo fora do plano: descrição livre, sem julgamento. */
  other?: string;
  time?: string;
  note?: string;
}

export interface WaterEntry {
  id: string;
  ts: number;
  ml: number;
}

export interface DayLog {
  meals: Partial<Record<MealSlot, MealLog>>;
  water: WaterEntry[];
  notes: string;
  sweetCraving: boolean;
  sweetRecipe?: string;
  activity: { done: boolean; minutes?: number; kind?: string };
  habits: string[];
}

export interface DayPlan {
  meals: Record<MealSlot, Selection>;
  /** Refeições montadas manualmente (não são trocadas por "gerar outro cardápio"). */
  locked: Partial<Record<MealSlot, boolean>>;
  createdAt: number;
}

export interface FavoriteMeal {
  id: string;
  slot: MealSlot;
  selection: Selection;
  createdAt: number;
}

export interface ManualShoppingItem {
  id: string;
  name: string;
  category: ShoppingCategory;
  amount?: string;
}

export interface ShoppingState {
  /** Primeiro dia do período da lista (7 dias). */
  start?: string;
  checked: string[];
  removed: string[];
  manual: ManualShoppingItem[];
}

export interface PreparedMeal {
  id: string;
  label: string;
  date: string;
  portions: number;
  consumed: number;
  storage: 'geladeira' | 'freezer';
}

export interface BodyEntry {
  id: string;
  date: string;
  weight?: number;
  waist?: number;
  hip?: number;
  arm?: number;
  thigh?: number;
  note?: string;
}

export interface Settings {
  name: string;
  mealTimes: Record<MealSlot, string>;
  waterGoal: number;
  waterReminder: { enabled: boolean; intervalMin: number; start: string; end: string };
  mealReminders: boolean;
  dislikes: string[];
  prefer: Tag[];
  /** Ingredientes disponíveis em casa (chaves). */
  pantry: string[];
  favoriteRecipes: string[];
  favoriteHabitsView?: boolean;
}
