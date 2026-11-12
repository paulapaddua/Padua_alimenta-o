import { describe, expect, it } from 'vitest';
import { FRUITS, VEGETABLES } from '../src/data/plan/foods';
import { ALL_OPTIONS, optionById } from '../src/data/plan/meals';
import {
  SLOTS,
  alternatives,
  fruitPortionQty,
  generateDay,
  generateMeal,
  isValidSelection,
  resolveSelection,
  seededRng,
  selectionTags,
  shortLabel,
} from '../src/lib/menu';
import { buildShoppingList, formatLineAmounts } from '../src/lib/shopping';

describe('base de dados do plano', () => {
  it('tem ids únicos', () => {
    const ids = ALL_OPTIONS.map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
    const foods = [...FRUITS, ...VEGETABLES].map((f) => f.id);
    expect(new Set(foods).size).toBe(foods.length);
  });

  it('cadastra todas as frutas e vegetais do PDF', () => {
    expect(VEGETABLES).toHaveLength(36 + 8 + 2);
    expect(FRUITS.filter((f) => f.density === 'muito-baixa')).toHaveLength(20);
    expect(FRUITS.filter((f) => f.density === 'baixa')).toHaveLength(26);
    expect(FRUITS.filter((f) => f.density === 'media-alta')).toHaveLength(18);
  });

  it('mantém as quantidades prescritas', () => {
    const almoco = optionById('almoco-prato')!;
    const jantar = optionById('jantar-prato')!;
    expect(almoco.groups.find((g) => g.id === 'carboidrato')!.portion!.qty).toBe(5);
    expect(jantar.groups.find((g) => g.id === 'carboidrato')!.portion!.qty).toBe(4);
    expect(almoco.groups.find((g) => g.id === 'proteina')!.choices).toHaveLength(9);
    const contrafile = almoco.groups[0].choices!.find((c) => c.id === 'contrafile')!;
    expect(contrafile.ingredients[0].qty).toBe(120);
  });
});

describe('gerador de cardápio', () => {
  it('gera apenas seleções válidas do plano', () => {
    const rng = seededRng(42);
    for (let i = 0; i < 300; i++) {
      const day = generateDay({ rng });
      for (const s of SLOTS) {
        expect(isValidSelection(day[s])).toBe(true);
        expect(optionById(day[s].optionId)!.slot).toBe(s);
      }
    }
  });

  it('não sorteia opções sem porção definida (quibe)', () => {
    const rng = seededRng(7);
    for (let i = 0; i < 500; i++) expect(generateMeal('jantar', { rng })!.optionId).not.toBe('jantar-quibe');
  });

  it('respeita alimentos que a pessoa não gosta', () => {
    const rng = seededRng(3);
    for (let i = 0; i < 200; i++) {
      const sel = generateMeal('cafe', { rng, dislikes: ['ovos', 'banana'] })!;
      const r = resolveSelection(sel)!;
      expect(r.ingredients.some((x) => x.key === 'ovos' && !x.free)).toBe(false);
      expect(r.ingredients.some((x) => x.key === 'banana')).toBe(false);
    }
  });

  it('respeita filtros', () => {
    const rng = seededRng(9);
    for (let i = 0; i < 100; i++) {
      const sel = generateMeal('almoco', { rng, filters: ['peixe'] })!;
      expect(selectionTags(sel)).toContain('peixe');
    }
    const lanche = generateMeal('lanche', { rng, filters: ['doce'] })!;
    expect(selectionTags(lanche)).toContain('doce');
  });

  it('oferece pelo menos 3 alternativas por refeição', () => {
    for (const s of SLOTS) {
      const day = generateDay({ rng: seededRng(1) });
      expect(alternatives(s, day[s], 4, { rng: seededRng(2) }).length).toBeGreaterThanOrEqual(3);
    }
  });
});

describe('lista de compras', () => {
  it('soma quantidades e não inventa quando não há', () => {
    const sel = { optionId: 'almoco-prato', choices: { proteina: 'frango-grelhado', carboidrato: 'arroz-integral', graos: 'feijao', vegetais: ['alface'], sobremesa: 'kiwi' } };
    const list = buildShoppingList([
      { selection: sel, label: 'a' },
      { selection: sel, label: 'b' },
    ]);
    const frango = list.find((l) => l.key === 'file-frango')!;
    expect(frango.amounts.g).toBe(300);
    expect(formatLineAmounts(list.find((l) => l.key === 'alface')!)).toMatch(/vontade/);
    expect(list.find((l) => l.key === 'kiwi')!.amounts.un).toBe(2);
  });

  it('conta receitas em lote uma vez', () => {
    const q = { optionId: 'jantar-quibe', choices: {} };
    const list = buildShoppingList([
      { selection: q, label: 'a' },
      { selection: q, label: 'b' },
    ]);
    expect(list.find((l) => l.key === 'carne-moida')!.amounts.g).toBe(600);
  });
});

describe('utilitários', () => {
  it('interpreta porções de fruta', () => {
    expect(fruitPortionQty('8 unidades')).toEqual({ qty: 8, unit: 'un' });
    expect(fruitPortionQty('½ unidade')).toEqual({ qty: 0.5, unit: 'un' });
    expect(fruitPortionQty('1 copo (300 ml)')).toEqual({ qty: 300, unit: 'ml' });
    expect(fruitPortionQty('1 colher de sobremesa')).toEqual({ qty: 1, unit: 'porção' });
  });
  it('gera rótulos curtos', () => {
    expect(shortLabel('2 colheres de sopa de frango desfiado (40 g)')).toBe('Frango desfiado');
    expect(shortLabel('1 fatia de queijo muçarela light (20 g)')).toBe('Queijo muçarela light');
  });
});
