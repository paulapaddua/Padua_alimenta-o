/**
 * Lista de compras: soma as quantidades PRESCRITAS das refeições planejadas.
 * Quando o plano não informa quantidade (ex.: "a gosto", vegetais à vontade),
 * o item aparece sem quantidade — nunca inventamos números.
 */
import { foodById } from '../data/plan/foods';
import { INGREDIENT_NAMES } from '../data/plan/ingredients';
import { optionById } from '../data/plan/meals';
import type { Ingredient, Selection, ShoppingCategory, Unit } from '../data/types';
import { resolveSelection } from './menu';

export const CATEGORY_LABEL: Record<ShoppingCategory, string> = {
  proteinas: 'Proteínas',
  verduras: 'Verduras e legumes',
  frutas: 'Frutas',
  laticinios: 'Laticínios',
  graos: 'Grãos e cereais',
  outros: 'Outros',
};

export const CATEGORY_ORDER: ShoppingCategory[] = ['proteinas', 'verduras', 'frutas', 'laticinios', 'graos', 'outros'];

export interface ShoppingLine {
  key: string;
  name: string;
  category: ShoppingCategory;
  /** unidade -> quantidade somada */
  amounts: Partial<Record<Unit, number>>;
  /** Há usos sem quantidade definida (a gosto, à vontade). */
  hasFree: boolean;
  uses: number;
  sources: string[];
  notes: string[];
}

export function ingredientName(key: string): string {
  return INGREDIENT_NAMES[key] ?? foodById(key)?.name ?? key;
}

/**
 * @param selections refeições planejadas (uma por refeição/dia)
 * Receitas em lote (ex.: quibe, brownie) contam por receita, não por refeição.
 */
export function buildShoppingList(selections: { selection: Selection; label: string }[]): ShoppingLine[] {
  const map = new Map<string, ShoppingLine>();
  const batchCount = new Map<string, number>();

  const add = (i: Ingredient, label: string, multiplier = 1) => {
    let line = map.get(i.key);
    if (!line) {
      line = { key: i.key, name: ingredientName(i.key), category: i.category, amounts: {}, hasFree: false, uses: 0, sources: [], notes: [] };
      map.set(i.key, line);
    }
    line.uses += 1;
    if (!line.sources.includes(label)) line.sources.push(label);
    if (i.free || i.qty === undefined || !i.unit) line.hasFree = true;
    else line.amounts[i.unit] = (line.amounts[i.unit] ?? 0) + i.qty * multiplier;
    if (i.flag && !line.notes.includes(i.flag)) line.notes.push(i.flag);
  };

  for (const { selection, label } of selections) {
    const opt = optionById(selection.optionId);
    const resolved = resolveSelection(selection);
    if (!opt || !resolved) continue;
    if (opt.batch) {
      batchCount.set(opt.id, (batchCount.get(opt.id) ?? 0) + 1);
      // Ingredientes variáveis (grupos) entram normalmente; os fixos entram por lote abaixo.
      resolved.lines.forEach((l) => l.ingredients.forEach((i) => add(i, label)));
      continue;
    }
    resolved.ingredients.forEach((i) => add(i, label));
  }

  for (const [optId, times] of batchCount) {
    const opt = optionById(optId)!;
    const batches = opt.batch?.servings ? Math.ceil(times / opt.batch.servings) : 1;
    opt.fixed.forEach((i) => {
      add({ ...i, flag: i.flag ?? opt.batch?.note }, `${opt.title} (${batches} receita${batches > 1 ? 's' : ''})`, batches);
    });
  }

  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

const UNIT_LABEL: Record<Unit, [string, string]> = {
  g: ['g', 'g'],
  ml: ['ml', 'ml'],
  un: ['unidade', 'unidades'],
  'col. sopa': ['colher de sopa', 'colheres de sopa'],
  'col. chá': ['colher de chá', 'colheres de chá'],
  'col. café': ['colher de café', 'colheres de café'],
  xícara: ['xícara', 'xícaras'],
  fatia: ['fatia', 'fatias'],
  sachê: ['sachê', 'sachês'],
  medidor: ['medidor', 'medidores'],
  porção: ['porção', 'porções'],
};

export function formatNumber(n: number): string {
  const whole = Math.floor(n);
  const frac = n - whole;
  const fracStr = Math.abs(frac - 0.5) < 0.01 ? '½' : Math.abs(frac - 0.25) < 0.01 ? '¼' : Math.abs(frac - 0.75) < 0.01 ? '¾' : '';
  if (fracStr) return whole ? `${whole} ${fracStr}` : fracStr;
  return Number.isInteger(n) ? String(n) : n.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
}

export function formatAmount(qty: number, unit: Unit): string {
  if (unit === 'g' && qty >= 1000) return `${(qty / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} kg`;
  if (unit === 'ml' && qty >= 1000) return `${(qty / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} L`;
  const [sing, plural] = UNIT_LABEL[unit];
  return `${formatNumber(qty)} ${qty > 1 ? plural : sing}`;
}

export function formatLineAmounts(line: Pick<ShoppingLine, 'amounts' | 'hasFree'>): string {
  const parts = (Object.entries(line.amounts) as [Unit, number][]).map(([u, q]) => formatAmount(q, u));
  if (!parts.length) return line.hasFree ? 'quantidade a gosto / à vontade' : '';
  return parts.join(' + ') + (line.hasFree ? ' + a gosto' : '');
}
