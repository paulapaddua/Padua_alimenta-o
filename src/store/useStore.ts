import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { WATER } from '../data/plan/guidelines';
import type { MealSlot, Selection } from '../data/types';
import { addDays, rangeDays } from '../lib/dates';
import { type DayMenu, type GenContext, SLOTS, generateDay, generateMeal, isValidSelection, signature } from '../lib/menu';
import type {
  BodyEntry,
  DayLog,
  DayPlan,
  FavoriteMeal,
  ManualShoppingItem,
  MealLog,
  PreparedMeal,
  Settings,
  ShoppingState,
} from './types';

export const STORAGE_KEY = 'meu-prato';
export const STORAGE_VERSION = 1;

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

export const DEFAULT_SETTINGS: Settings = {
  name: 'Paula',
  mealTimes: { cafe: '07:30', almoco: '12:30', lanche: '16:00', jantar: '19:30' },
  waterGoal: WATER.minMl,
  waterReminder: { enabled: false, intervalMin: 90, start: '08:00', end: '21:00' },
  mealReminders: false,
  dislikes: [],
  prefer: [],
  pantry: [],
  favoriteRecipes: [],
};

export const emptyDay = (): DayLog => ({
  meals: {},
  water: [],
  notes: '',
  sweetCraving: false,
  activity: { done: false },
  habits: [],
});

export interface AppState {
  settings: Settings;
  plans: Record<string, DayPlan>;
  logs: Record<string, DayLog>;
  favorites: FavoriteMeal[];
  shopping: ShoppingState;
  mealPrep: Record<string, string[]>;
  prepared: PreparedMeal[];
  weeklyHabits: Record<string, string[]>;
  body: BodyEntry[];

  // Cardápio
  genContext: () => GenContext;
  ensurePlan: (date: string) => DayPlan;
  ensureRange: (start: string, days: number) => void;
  regenerateDay: (date: string) => void;
  regenerateMeal: (date: string, slot: MealSlot) => void;
  setMeal: (date: string, slot: MealSlot, sel: Selection, lock?: boolean) => void;
  generateWeek: (start: string, overwrite: boolean) => void;
  copyDay: (from: string, to: string) => void;

  // Diário
  setMealLog: (date: string, slot: MealSlot, patch: Partial<MealLog>) => void;
  addWater: (date: string, ml: number) => void;
  removeWater: (date: string, id: string) => void;
  updateDay: (date: string, patch: Partial<DayLog>) => void;
  toggleHabit: (date: string, id: string) => void;
  toggleWeeklyHabit: (week: string, id: string) => void;

  // Favoritos
  toggleFavorite: (slot: MealSlot, sel: Selection) => void;
  isFavorite: (sel: Selection) => boolean;
  toggleFavoriteRecipe: (id: string) => void;

  // Compras
  setShoppingStart: (start: string) => void;
  toggleChecked: (key: string) => void;
  removeShoppingItem: (key: string) => void;
  restoreRemoved: () => void;
  addManualItem: (item: Omit<ManualShoppingItem, 'id'>) => void;
  removeManualItem: (id: string) => void;
  clearChecked: () => void;
  togglePantry: (key: string) => void;

  // Meal prep
  toggleMealPrepTask: (week: string, id: string) => void;
  addPrepared: (p: Omit<PreparedMeal, 'id' | 'consumed'>) => void;
  updatePrepared: (id: string, patch: Partial<PreparedMeal>) => void;
  removePrepared: (id: string) => void;

  // Corpo
  addBody: (e: Omit<BodyEntry, 'id'>) => void;
  removeBody: (id: string) => void;

  // Configurações
  updateSettings: (patch: Partial<Settings>) => void;
  toggleDislike: (key: string) => void;
  importData: (data: unknown) => void;
  resetAll: () => void;
}

const initialData = () => ({
  settings: DEFAULT_SETTINGS,
  plans: {} as Record<string, DayPlan>,
  logs: {} as Record<string, DayLog>,
  favorites: [] as FavoriteMeal[],
  shopping: { checked: [], removed: [], manual: [] } as ShoppingState,
  mealPrep: {} as Record<string, string[]>,
  prepared: [] as PreparedMeal[],
  weeklyHabits: {} as Record<string, string[]>,
  body: [] as BodyEntry[],
});

const toggle = (arr: string[], v: string) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

export const useStore = create<AppState>()(
  persist(
    (set, get) => {
      const patchDay = (date: string, fn: (d: DayLog) => DayLog) =>
        set((s) => ({ logs: { ...s.logs, [date]: fn(s.logs[date] ?? emptyDay()) } }));

      const makePlan = (date: string, plans: Record<string, DayPlan>): DayPlan => {
        const prev = plans[addDays(date, -1)]?.meals;
        return { meals: generateDay(get().genContext(), prev), locked: {}, createdAt: Date.now() };
      };

      return {
        ...initialData(),

        genContext: () => ({ dislikes: get().settings.dislikes, prefer: get().settings.prefer }),

        ensurePlan: (date) => {
          const existing = get().plans[date];
          if (existing && SLOTS.every((s) => isValidSelection(existing.meals[s]))) return existing;
          const plan = makePlan(date, get().plans);
          if (existing) {
            // Mantém as refeições válidas e só repõe o que estiver faltando/inválido.
            SLOTS.forEach((s) => {
              if (isValidSelection(existing.meals[s])) plan.meals[s] = existing.meals[s];
            });
            plan.locked = existing.locked ?? {};
          }
          set((s) => ({ plans: { ...s.plans, [date]: plan } }));
          return plan;
        },

        ensureRange: (start, days) => {
          rangeDays(start, days).forEach((d) => get().ensurePlan(d));
        },

        regenerateDay: (date) => {
          const old = get().plans[date];
          const prev = get().plans[addDays(date, -1)]?.meals;
          const avoid = old ? SLOTS.map((s) => old.meals[s]) : [];
          const meals = generateDay({ ...get().genContext(), avoid }, prev) as DayMenu;
          if (old) SLOTS.forEach((s) => old.locked?.[s] && (meals[s] = old.meals[s]));
          set((s) => ({ plans: { ...s.plans, [date]: { meals, locked: old?.locked ?? {}, createdAt: Date.now() } } }));
        },

        regenerateMeal: (date, slot) => {
          const plan = get().ensurePlan(date);
          const sel = generateMeal(slot, { ...get().genContext(), avoid: [plan.meals[slot]] });
          if (sel) get().setMeal(date, slot, sel, false);
        },

        setMeal: (date, slot, sel, lock = true) => {
          const plan = get().ensurePlan(date);
          set((s) => ({
            plans: {
              ...s.plans,
              [date]: { ...plan, meals: { ...plan.meals, [slot]: sel }, locked: { ...plan.locked, [slot]: lock } },
            },
          }));
        },

        generateWeek: (start, overwrite) => {
          rangeDays(start, 7).forEach((d) => {
            if (overwrite && get().plans[d]) get().regenerateDay(d);
            else get().ensurePlan(d);
          });
        },

        copyDay: (from, to) => {
          const src = get().ensurePlan(from);
          set((s) => ({ plans: { ...s.plans, [to]: { meals: { ...src.meals }, locked: { cafe: true, almoco: true, lanche: true, jantar: true }, createdAt: Date.now() } } }));
        },

        setMealLog: (date, slot, patch) =>
          patchDay(date, (d) => {
            const current: MealLog = d.meals[slot] ?? { status: 'pendente' };
            return { ...d, meals: { ...d.meals, [slot]: { ...current, ...patch } } };
          }),

        addWater: (date, ml) => {
          if (!Number.isFinite(ml) || ml <= 0) return;
          patchDay(date, (d) => ({ ...d, water: [...d.water, { id: uid(), ts: Date.now(), ml: Math.round(ml) }] }));
        },

        removeWater: (date, id) => patchDay(date, (d) => ({ ...d, water: d.water.filter((w) => w.id !== id) })),

        updateDay: (date, patch) => patchDay(date, (d) => ({ ...d, ...patch })),

        toggleHabit: (date, id) => patchDay(date, (d) => ({ ...d, habits: toggle(d.habits, id) })),

        toggleWeeklyHabit: (week, id) =>
          set((s) => ({ weeklyHabits: { ...s.weeklyHabits, [week]: toggle(s.weeklyHabits[week] ?? [], id) } })),

        toggleFavorite: (slot, sel) => {
          const sig = signature(sel);
          const exists = get().favorites.find((f) => signature(f.selection) === sig);
          set((s) => ({
            favorites: exists
              ? s.favorites.filter((f) => f.id !== exists.id)
              : [...s.favorites, { id: uid(), slot, selection: sel, createdAt: Date.now() }],
          }));
        },

        isFavorite: (sel) => {
          const sig = signature(sel);
          return get().favorites.some((f) => signature(f.selection) === sig);
        },

        toggleFavoriteRecipe: (id) =>
          set((s) => ({ settings: { ...s.settings, favoriteRecipes: toggle(s.settings.favoriteRecipes, id) } })),

        setShoppingStart: (start) => set((s) => ({ shopping: { ...s.shopping, start } })),
        toggleChecked: (key) => set((s) => ({ shopping: { ...s.shopping, checked: toggle(s.shopping.checked, key) } })),
        removeShoppingItem: (key) =>
          set((s) => ({ shopping: { ...s.shopping, removed: [...new Set([...s.shopping.removed, key])] } })),
        restoreRemoved: () => set((s) => ({ shopping: { ...s.shopping, removed: [] } })),
        addManualItem: (item) =>
          set((s) => ({ shopping: { ...s.shopping, manual: [...s.shopping.manual, { ...item, id: `manual-${uid()}` }] } })),
        removeManualItem: (id) =>
          set((s) => ({
            shopping: { ...s.shopping, manual: s.shopping.manual.filter((m) => m.id !== id), checked: s.shopping.checked.filter((c) => c !== id) },
          })),
        clearChecked: () => set((s) => ({ shopping: { ...s.shopping, checked: [] } })),
        togglePantry: (key) => set((s) => ({ settings: { ...s.settings, pantry: toggle(s.settings.pantry, key) } })),

        toggleMealPrepTask: (week, id) =>
          set((s) => ({ mealPrep: { ...s.mealPrep, [week]: toggle(s.mealPrep[week] ?? [], id) } })),
        addPrepared: (p) => set((s) => ({ prepared: [{ ...p, id: uid(), consumed: 0 }, ...s.prepared] })),
        updatePrepared: (id, patch) =>
          set((s) => ({ prepared: s.prepared.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
        removePrepared: (id) => set((s) => ({ prepared: s.prepared.filter((p) => p.id !== id) })),

        addBody: (e) =>
          set((s) => ({ body: [...s.body, { ...e, id: uid() }].sort((a, b) => a.date.localeCompare(b.date)) })),
        removeBody: (id) => set((s) => ({ body: s.body.filter((b) => b.id !== id) })),

        updateSettings: (patch) => {
          const next = { ...get().settings, ...patch };
          next.waterGoal = Math.min(WATER.maxMl, Math.max(WATER.minMl, Math.round(next.waterGoal || WATER.minMl)));
          set({ settings: next });
        },
        toggleDislike: (key) => set((s) => ({ settings: { ...s.settings, dislikes: toggle(s.settings.dislikes, key) } })),

        importData: (data) => {
          const d = data as Partial<ReturnType<typeof initialData>> & { app?: string };
          if (!d || typeof d !== 'object' || d.app !== 'meu-prato' || typeof d.settings !== 'object') {
            throw new Error('Arquivo inválido: não é um backup do Meu Prato.');
          }
          const base = initialData();
          set({
            settings: { ...base.settings, ...d.settings },
            plans: d.plans ?? {},
            logs: d.logs ?? {},
            favorites: d.favorites ?? [],
            shopping: { ...base.shopping, ...d.shopping },
            mealPrep: d.mealPrep ?? {},
            prepared: d.prepared ?? [],
            weeklyHabits: d.weeklyHabits ?? {},
            body: d.body ?? [],
          });
        },

        resetAll: () => set(initialData()),
      };
    },
    {
      name: STORAGE_KEY,
      version: STORAGE_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        settings: s.settings,
        plans: s.plans,
        logs: s.logs,
        favorites: s.favorites,
        shopping: s.shopping,
        mealPrep: s.mealPrep,
        prepared: s.prepared,
        weeklyHabits: s.weeklyHabits,
        body: s.body,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<AppState>;
        return { ...current, ...p, settings: { ...DEFAULT_SETTINGS, ...(p.settings ?? {}) } };
      },
    },
  ),
);

/** Snapshot exportável (backup). */
export function exportSnapshot() {
  const s = useStore.getState();
  return {
    app: 'meu-prato',
    version: STORAGE_VERSION,
    exportedAt: new Date().toISOString(),
    settings: s.settings,
    plans: s.plans,
    logs: s.logs,
    favorites: s.favorites,
    shopping: s.shopping,
    mealPrep: s.mealPrep,
    prepared: s.prepared,
    weeklyHabits: s.weeklyHabits,
    body: s.body,
  };
}

export const useDayLog = (date: string) => useStore((s) => s.logs[date]) ?? EMPTY_DAY;
const EMPTY_DAY = emptyDay();
