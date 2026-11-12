/**
 * Regras do cardápio: gera, valida e descreve combinações usando SOMENTE
 * as opções cadastradas em src/data/plan. Nenhuma quantidade é criada aqui.
 */
import { CITRUS_FRUITS, PORTION_FRUITS, VEGETABLES, foodById } from '../data/plan/foods';
import { OPTIONS_BY_SLOT, optionById } from '../data/plan/meals';
import type { ChoiceGroup, FoodItem, Ingredient, MealOption, MealSlot, Selection, Tag, Unit } from '../data/types';

export const SLOTS: MealSlot[] = ['cafe', 'almoco', 'lanche', 'jantar'];

export const SLOT_LABEL: Record<MealSlot, string> = {
  cafe: 'Café da manhã',
  almoco: 'Almoço',
  lanche: 'Lanche da tarde',
  jantar: 'Jantar',
};

export const TAG_LABEL: Record<Tag, string> = {
  rapido: 'Mais rápido',
  levar: 'Levar ao trabalho',
  economico: 'Econômico',
  antecipado: 'Preparo antecipado',
  doce: 'Doce',
  salgado: 'Salgado',
  ovos: 'Com ovos',
  frango: 'Com frango',
  peixe: 'Com peixe',
  bovina: 'Com carne bovina',
};

export const ALL_TAGS = Object.keys(TAG_LABEL) as Tag[];

export type Rng = () => number;

export interface GenContext {
  /** Ids de ingredientes/frutas/vegetais que a pessoa não gosta (preferência pessoal). */
  dislikes?: string[];
  /** Filtros: a refeição precisa ter TODAS as tags. */
  filters?: Tag[];
  /** Seleções a evitar repetir (ex.: dia anterior). */
  avoid?: Selection[];
  /** Preferências de preparo (aumentam a chance, não obrigam). */
  prefer?: Tag[];
  /** Jantar: restringe ao prato padrão ou às alternativas "Hoje quero algo diferente". */
  variant?: "padrao" | "diferente";
  rng?: Rng;
}

/** RNG determinístico (mulberry32) — útil para testes. */
export function seededRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = <T,>(arr: T[], rng: Rng): T => arr[Math.floor(rng() * arr.length)];

function shuffle<T>(arr: T[], rng: Rng): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------------------------------------------------------------------------
// Grupos
// ---------------------------------------------------------------------------

export function fruitPool(group: ChoiceGroup): FoodItem[] {
  return group.fruitSource === 'citrica' ? CITRUS_FRUITS : PORTION_FRUITS;
}

/** Ids disponíveis em um grupo (escolhas, frutas ou vegetais). */
export function groupChoiceIds(group: ChoiceGroup): string[] {
  if (group.fruitSource) return fruitPool(group).map((f) => f.id);
  if (group.vegetableSource) return VEGETABLES.map((v) => v.id);
  return (group.choices ?? []).map((c) => c.id);
}

function choiceKeys(group: ChoiceGroup, choiceId: string): string[] {
  if (group.fruitSource || group.vegetableSource) return [choiceId];
  const c = group.choices?.find((x) => x.id === choiceId);
  return c ? c.ingredients.map((i) => i.key) : [];
}

function choiceTags(group: ChoiceGroup, choiceId: string): Tag[] {
  return group.choices?.find((x) => x.id === choiceId)?.tags ?? [];
}

// ---------------------------------------------------------------------------
// Validação — garante que a seleção usa apenas o que o plano prevê
// ---------------------------------------------------------------------------

export function isValidSelection(sel: Selection | undefined): sel is Selection {
  if (!sel) return false;
  const opt = optionById(sel.optionId);
  if (!opt) return false;
  for (const g of opt.groups) {
    const val = sel.choices[g.id];
    const ids = groupChoiceIds(g);
    if (g.vegetableSource) {
      if (val !== undefined && (!Array.isArray(val) || val.some((v) => !ids.includes(v)))) return false;
      continue;
    }
    if (val === undefined || val === '') {
      if (!g.optional) return false;
      continue;
    }
    if (typeof val !== 'string' || !ids.includes(val)) return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Tags e ingredientes de uma seleção
// ---------------------------------------------------------------------------

export function selectionTags(sel: Selection): Tag[] {
  const opt = optionById(sel.optionId);
  if (!opt) return [];
  const tags = new Set<Tag>(opt.tags);
  for (const g of opt.groups) {
    const v = sel.choices[g.id];
    if (typeof v === 'string') choiceTags(g, v).forEach((t) => tags.add(t));
  }
  return [...tags];
}

const FRACTIONS: Record<string, number> = { '½': 0.5, '¼': 0.25 };

/** Converte a porção textual da tabela de frutas em quantidade somável (quando possível). */
export function fruitPortionQty(portion: string): { qty: number; unit: Unit } {
  const m = portion.match(/^(\d+|½|¼)\s+(\S+)/);
  if (!m) return { qty: 1, unit: 'porção' };
  const qty = FRACTIONS[m[1]] ?? Number(m[1]);
  const word = m[2].toLowerCase();
  if (word.startsWith('unidade')) return { qty, unit: 'un' };
  if (word.startsWith('fatia')) return { qty, unit: 'fatia' };
  if (word.startsWith('copo')) {
    const ml = portion.match(/(\d+)\s*ml/);
    if (ml) return { qty: Number(ml[1]), unit: 'ml' };
  }
  return { qty: 1, unit: 'porção' };
}

export function fruitIngredient(fruit: FoodItem): Ingredient {
  const { qty, unit } = fruitPortionQty(fruit.portion ?? '');
  return { key: fruit.id, text: `${fruit.name} – ${fruit.portion}`, category: 'frutas', qty, unit };
}

export interface ResolvedLine {
  groupId: string;
  groupLabel: string;
  text: string;
  ingredients: Ingredient[];
  note?: string;
}

export interface ResolvedMeal {
  option: MealOption;
  lines: ResolvedLine[];
  fixed: Ingredient[];
  ingredients: Ingredient[];
  tags: Tag[];
  title: string;
  summary: string;
}

const MEASURE_PREFIX =
  /^(\d+(?:\s*e\s*½)?|½|¼)\s+(colheres?|fatias?|unidades?|copos?|xícaras?|medidor(?:es)?)(\s+de\s+(sopa|chá|café))?\s+de\s+/i;

/** Rótulo curto para resumos ("2 colheres de sopa de frango desfiado (40 g)" -> "Frango desfiado"). */
export function shortLabel(label: string): string {
  const s = label.replace(/\s*\([^)]*\)/g, '').replace(MEASURE_PREFIX, '').trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function resolveSelection(sel: Selection): ResolvedMeal | null {
  const option = optionById(sel.optionId);
  if (!option) return null;
  const lines: ResolvedLine[] = [];
  for (const g of option.groups) {
    const v = sel.choices[g.id];
    if (g.vegetableSource) {
      const ids = Array.isArray(v) ? v : [];
      const names = ids.map((id) => foodById(id)?.name).filter(Boolean) as string[];
      lines.push({
        groupId: g.id,
        groupLabel: g.label,
        text: names.length ? names.join(', ') : 'Vegetais da sua preferência (tabela)',
        ingredients: ids.map((id) => ({ key: id, text: foodById(id)?.name ?? id, category: 'verduras', free: true })),
        note: g.note,
      });
      continue;
    }
    if (typeof v !== 'string' || !v) continue;
    if (g.fruitSource) {
      const fruit = foodById(v);
      if (!fruit) continue;
      lines.push({ groupId: g.id, groupLabel: g.label, text: `${fruit.name} – ${fruit.portion}`, ingredients: [fruitIngredient(fruit)], note: g.note });
      continue;
    }
    const c = g.choices?.find((x) => x.id === v);
    if (!c) continue;
    const text = g.portion && !c.label.includes('(') ? `${c.label} – ${g.portion.text}` : c.label;
    lines.push({ groupId: g.id, groupLabel: g.label, text, ingredients: c.ingredients, note: g.note });
  }

  const ingredients = [...option.fixed, ...lines.flatMap((l) => l.ingredients)];
  const mainLines = lines.filter((l) => !['bebida', 'sobremesa', 'vegetais', 'liquido'].includes(l.groupId));
  let summary: string;
  if (option.kind === 'receita') {
    const extra = mainLines.map((l) => shortLabel(l.text.split(' – ')[0]));
    summary = extra.length ? `${option.title} · ${extra.join(' · ')}` : option.title;
  } else {
    const parts = [...option.fixed.filter((i) => !i.free).map((i) => shortLabel(i.text)), ...mainLines.map((l) => shortLabel(l.text.split(' – ')[0]))];
    if (option.kind === 'prato') parts.push('vegetais');
    summary = parts.join(' + ');
  }
  return {
    option,
    lines,
    fixed: option.fixed,
    ingredients,
    tags: selectionTags(sel),
    title: option.kind === 'prato' ? summary : option.title,
    summary,
  };
}

export function signature(sel: Selection): string {
  const parts = Object.keys(sel.choices)
    .sort()
    .map((k) => {
      const v = sel.choices[k];
      return `${k}=${Array.isArray(v) ? [...v].sort().join('|') : v}`;
    });
  return `${sel.optionId}::${parts.join(';')}`;
}

/** Chave de "variedade": opção + proteína principal. */
function varietyKey(sel: Selection): string {
  const main = sel.choices['proteina'] ?? sel.choices['recheio'] ?? '';
  return `${sel.optionId}:${typeof main === 'string' ? main : ''}`;
}

// ---------------------------------------------------------------------------
// Geração
// ---------------------------------------------------------------------------

function isDisliked(option: MealOption, dislikes: Set<string>): boolean {
  return option.fixed.some((i) => !i.free && dislikes.has(i.key));
}

function randomChoiceFor(g: ChoiceGroup, dislikes: Set<string>, rng: Rng, wantTags: Tag[]): string | string[] | undefined {
  if (g.vegetableSource) {
    const pool = VEGETABLES.filter((v) => !dislikes.has(v.id));
    return shuffle(pool, rng)
      .slice(0, 3)
      .map((v) => v.id);
  }
  if (g.fruitSource) {
    const pool = fruitPool(g).filter((f) => !dislikes.has(f.id));
    return pool.length ? pick(pool, rng).id : undefined;
  }
  if (g.optional && rng() < 0.4) return '';
  let pool = (g.choices ?? []).filter((c) => !choiceKeys(g, c.id).some((k) => dislikes.has(k)));
  if (!pool.length) pool = g.choices ?? [];
  // Se há filtros de proteína, prioriza escolhas compatíveis.
  const tagged = pool.filter((c) => wantTags.some((t) => c.tags?.includes(t)));
  if (tagged.length) pool = tagged;
  return pool.length ? pick(pool, rng).id : undefined;
}

export function randomSelection(option: MealOption, ctx: GenContext = {}): Selection {
  const rng = ctx.rng ?? Math.random;
  const dislikes = new Set(ctx.dislikes ?? []);
  const choices: Selection['choices'] = {};
  for (const g of option.groups) {
    const v = randomChoiceFor(g, dislikes, rng, ctx.filters ?? []);
    if (v !== undefined) choices[g.id] = v;
  }
  return { optionId: option.id, choices };
}

/** A opção (com alguma combinação de escolhas) pode atender a todos os filtros? */
export function optionCanMatch(option: MealOption, filters: Tag[]): boolean {
  if (!filters.length) return true;
  const possible = new Set<Tag>(option.tags);
  option.groups.forEach((g) => g.choices?.forEach((c) => c.tags?.forEach((t) => possible.add(t))));
  return filters.every((t) => possible.has(t));
}

export function selectionMatches(sel: Selection, filters: Tag[]): boolean {
  if (!filters.length) return true;
  const tags = selectionTags(sel);
  return filters.every((t) => tags.includes(t));
}

export function candidateOptions(slot: MealSlot, ctx: GenContext = {}, includeManual = false): MealOption[] {
  const dislikes = new Set(ctx.dislikes ?? []);
  return OPTIONS_BY_SLOT[slot].filter(
    (o) =>
      (includeManual || !o.manualOnly) &&
      (!ctx.variant || !o.variant || o.variant === ctx.variant) &&
      !isDisliked(o, dislikes) &&
      optionCanMatch(o, ctx.filters ?? []),
  );
}

function weightedOption(slot: MealSlot, options: MealOption[], ctx: GenContext, rng: Rng): MealOption {
  // Jantar: o prato padrão é a base; as alternativas aparecem com menos frequência.
  const weights = options.map((o) => {
    let w = 1;
    if (slot === 'jantar') w = o.variant === 'padrao' ? options.length * 0.9 : 1;
    if (ctx.prefer?.some((t) => o.tags.includes(t))) w *= 1.8;
    return w;
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rng() * total;
  for (let i = 0; i < options.length; i++) {
    r -= weights[i];
    if (r <= 0) return options[i];
  }
  return options[options.length - 1];
}

export function generateMeal(slot: MealSlot, ctx: GenContext = {}): Selection | null {
  const rng = ctx.rng ?? Math.random;
  const filters = ctx.filters ?? [];
  const options = candidateOptions(slot, ctx);
  if (!options.length) return null;
  const avoidKeys = new Set((ctx.avoid ?? []).map(varietyKey));
  let fallback: Selection | null = null;
  for (let attempt = 0; attempt < 30; attempt++) {
    const opt = weightedOption(slot, options, ctx, rng);
    const sel = randomSelection(opt, { ...ctx, rng });
    if (!selectionMatches(sel, filters)) continue;
    fallback ??= sel;
    if (!avoidKeys.has(varietyKey(sel))) return sel;
  }
  return fallback;
}

export type DayMenu = Record<MealSlot, Selection>;

export function generateDay(ctx: GenContext = {}, previous?: Partial<DayMenu>): DayMenu {
  const menu = {} as DayMenu;
  for (const slot of SLOTS) {
    const avoid = [...(ctx.avoid ?? []), ...(previous?.[slot] ? [previous[slot]!] : [])];
    // Almoço e jantar no mesmo dia: evita repetir a mesma proteína.
    if (slot === 'jantar' && menu.almoco) avoid.push({ ...menu.almoco, optionId: 'jantar-prato' });
    const sel = generateMeal(slot, { ...ctx, filters: [], avoid });
    menu[slot] = sel ?? randomSelection(OPTIONS_BY_SLOT[slot][0], ctx);
  }
  return menu;
}

/** Gera alternativas diferentes da seleção atual (opções distintas sempre que o plano permitir). */
export function alternatives(slot: MealSlot, current: Selection | undefined, count = 4, ctx: GenContext = {}): Selection[] {
  const rng = ctx.rng ?? Math.random;
  const seen = new Set<string>(current ? [signature(current)] : []);
  const usedOptions = new Set<string>(current ? [current.optionId] : []);
  const out: Selection[] = [];
  const options = shuffle(candidateOptions(slot, ctx), rng);
  // 1º: uma de cada opção diferente
  for (const o of options) {
    if (out.length >= count) break;
    if (usedOptions.has(o.id) && options.length > count) continue;
    for (let i = 0; i < 10; i++) {
      const sel = randomSelection(o, { ...ctx, rng });
      if (!selectionMatches(sel, ctx.filters ?? [])) continue;
      const sig = signature(sel);
      if (seen.has(sig)) continue;
      seen.add(sig);
      usedOptions.add(o.id);
      out.push(sel);
      break;
    }
  }
  // 2º: completa com outras combinações (ex.: almoço só tem a opção "prato")
  for (let i = 0; out.length < count && i < 60; i++) {
    if (!options.length) break;
    const sel = randomSelection(pick(options, rng), { ...ctx, rng });
    if (!selectionMatches(sel, ctx.filters ?? [])) continue;
    const sig = signature(sel);
    if (seen.has(sig)) continue;
    seen.add(sig);
    out.push(sel);
  }
  return out;
}

/** Seleção inicial "em branco" para montagem manual (primeira escolha de cada grupo obrigatório). */
export function emptySelection(option: MealOption): Selection {
  const choices: Selection['choices'] = {};
  for (const g of option.groups) {
    if (g.vegetableSource) choices[g.id] = [];
    else if (g.optional) choices[g.id] = '';
    else choices[g.id] = groupChoiceIds(g)[0];
  }
  return { optionId: option.id, choices };
}
