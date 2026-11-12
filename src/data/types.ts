/**
 * Tipos da base de dados do plano alimentar.
 * Tudo que está em src/data/plan/* é PRESCRITO pela nutricionista (fonte de verdade).
 * Preferências pessoais (favoritos, alimentos que não gosta etc.) ficam no store, nunca aqui.
 */

export type MealSlot = 'cafe' | 'almoco' | 'lanche' | 'jantar';

export type ShoppingCategory =
  | 'proteinas'
  | 'verduras'
  | 'frutas'
  | 'laticinios'
  | 'graos'
  | 'outros';

/** Unidade usada para somar quantidades na lista de compras. */
export type Unit = 'g' | 'ml' | 'un' | 'col. sopa' | 'col. chá' | 'col. café' | 'xícara' | 'fatia' | 'sachê' | 'medidor' | 'porção';

export interface Ingredient {
  /** Chave do ingrediente para a lista de compras (agrupa duplicados). */
  key: string;
  /** Texto exatamente como prescrito (exibido ao usuário). */
  text: string;
  /** Quantidade numérica, quando o plano informa. */
  qty?: number;
  unit?: Unit;
  /** Peso de referência em gramas informado no plano (ex.: "2 ovos (110 g)"). */
  grams?: number;
  category: ShoppingCategory;
  /** Ingrediente "a gosto", à vontade ou sem quantidade — não entra na soma. */
  free?: boolean;
  /** Aviso de ambiguidade no plano original. */
  flag?: string;
}

export interface Choice {
  id: string;
  label: string;
  ingredients: Ingredient[];
  /** Tags que a escolha adiciona à refeição (ex.: 'frango'). */
  tags?: Tag[];
}

export interface ChoiceGroup {
  id: string;
  label: string;
  /** Opções explícitas do plano. */
  choices?: Choice[];
  /** Escolher fruta da tabela de densidade calórica (qualquer) ou só as cítricas. */
  fruitSource?: 'tabela' | 'citrica';
  /** Escolher vegetais da tabela (à vontade). */
  vegetableSource?: boolean;
  optional?: boolean;
  /** Quantidade comum a todas as escolhas do grupo (ex.: "5 colheres de sopa"). */
  portion?: { text: string; qty?: number; unit?: Unit };
  note?: string;
}

export type Tag =
  | 'rapido'
  | 'levar'
  | 'economico'
  | 'antecipado'
  | 'doce'
  | 'salgado'
  | 'ovos'
  | 'frango'
  | 'peixe'
  | 'bovina';

export interface MealOption {
  id: string;
  slot: MealSlot;
  title: string;
  /** 'prato' = montagem por grupos; 'receita' = preparo; 'combinacao' = itens simples. */
  kind: 'prato' | 'receita' | 'combinacao';
  /** Para jantar: refeição padrão (prato) ou alternativa "Hoje quero algo diferente". */
  variant?: 'padrao' | 'diferente';
  fixed: Ingredient[];
  groups: ChoiceGroup[];
  steps?: string[];
  notes?: string[];
  /** Classificação do app para filtros (não é prescrição). */
  tags: Tag[];
  /** Página do PDF de origem. */
  source: string;
  /** Receita que rende várias porções (lista de compras conta por lote). */
  batch?: { servings?: number; note: string };
  flags?: string[];
  /** Não entra no sorteio automático (ex.: porção não definida no plano). */
  manualOnly?: boolean;
}

export interface Recipe {
  id: string;
  title: string;
  ingredients: Ingredient[];
  steps: string[];
  notes?: string[];
  source: string;
  /** Escolha opcional dentro da receita (ex.: doce de leite OU whey). */
  variants?: { id: string; label: string; ingredients: Ingredient[] }[];
  batch?: { servings?: number; note: string };
  flags?: string[];
}

export type Density = 'muito-baixa' | 'baixa' | 'media' | 'media-alta';

export interface FoodItem {
  id: string;
  name: string;
  type: 'fruta' | 'vegetal' | 'bebida';
  density: Density;
  /** Porção exatamente como no PDF (frutas). Vegetais não têm porção definida. */
  portion?: string;
  citrica?: boolean;
  flag?: string;
}

export interface Selection {
  optionId: string;
  /** groupId -> choiceId (ou id de fruta/vegetal). Vegetais podem ter vários ids. */
  choices: Record<string, string | string[]>;
}
