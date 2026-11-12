import type { Choice, ChoiceGroup, MealOption, Recipe } from '../types';
import { free, ing } from './ingredients';

/**
 * Opções de refeição — transcrição do plano alimentar (PDF páginas 5 a 9).
 * NÃO altere quantidades aqui sem uma nova prescrição da nutricionista.
 * As "tags" são apenas uma classificação do app para os filtros (não são prescrição).
 */

// ---------------------------------------------------------------------------
// Grupos compartilhados
// ---------------------------------------------------------------------------

const BEBIDAS_CAFE: ChoiceGroup = {
  id: 'bebida',
  label: 'Bebida (opcional)',
  optional: true,
  choices: [
    { id: 'iogurte', label: 'Iogurte natural (170 ml)', ingredients: [ing('iogurte-natural', 'Iogurte natural (170 ml)', 'laticinios', 170, 'ml')] },
    { id: 'cha-camomila', label: 'Chá de camomila (1 xícara de chá – 240 ml)', ingredients: [ing('cha-camomila', 'Chá de camomila (1 xícara de chá – 240 ml)', 'outros', 1, 'xícara')] },
    { id: 'cha-erva-doce', label: 'Chá de erva-doce (1 xícara de chá – 240 ml)', ingredients: [ing('cha-erva-doce', 'Chá de erva-doce (1 xícara de chá – 240 ml)', 'outros', 1, 'xícara')] },
    { id: 'cafe-preto', label: 'Café preto (1 xícara de café – 50 ml)', ingredients: [free('cafe', 'Café preto (1 xícara de café – 50 ml)', 'outros')] },
    {
      id: 'cafe-com-leite',
      label: 'Café com leite desnatado (1 copo americano – 190 ml)',
      ingredients: [
        free('cafe', 'Café com leite desnatado (1 copo americano – 190 ml)', 'outros'),
        free('leite-desnatado', 'Leite desnatado (para o café com leite)', 'laticinios'),
      ],
    },
  ],
};

/** Proteínas do almoço/jantar (PDF p. 6 e 7). */
const PROTEINAS_PRATO: Choice[] = [
  { id: 'frango-grelhado', label: 'Filé de frango grelhado (3 bifes pequenos – 150 g)', tags: ['frango'], ingredients: [ing('file-frango', 'Filé de frango grelhado (3 bifes pequenos – 150 g)', 'proteinas', 150, 'g')] },
  { id: 'contrafile', label: 'Contrafilé sem gordura grelhado (3 bifes pequenos – 120 g)', tags: ['bovina'], ingredients: [ing('contrafile', 'Contrafilé sem gordura grelhado (3 bifes pequenos – 120 g)', 'proteinas', 120, 'g')] },
  { id: 'patinho', label: 'Patinho moído refogado (6 colheres de sopa – 150 g)', tags: ['bovina'], ingredients: [ing('patinho', 'Patinho moído refogado (6 colheres de sopa – 150 g)', 'proteinas', 150, 'g')] },
  { id: 'tilapia', label: 'Filé de tilápia grelhado (2 filés médios – 150 g)', tags: ['peixe'], ingredients: [ing('tilapia', 'Filé de tilápia grelhado (2 filés médios – 150 g)', 'proteinas', 150, 'g')] },
  { id: 'mignon-suino', label: 'Filé mignon suíno (3 bifes pequenos – 150 g)', ingredients: [ing('mignon-suino', 'Filé mignon suíno (3 bifes pequenos – 150 g)', 'proteinas', 150, 'g')] },
  { id: 'sobrecoxa', label: 'Sobrecoxa de frango sem pele assada (3 unidades pequenas – 150 g)', tags: ['frango'], ingredients: [ing('sobrecoxa', 'Sobrecoxa de frango sem pele assada (3 unidades pequenas – 150 g)', 'proteinas', 150, 'g')] },
  { id: 'ovos', label: 'Ovo de galinha cozido/mexido (4 unidades – 220 g)', tags: ['ovos'], ingredients: [ing('ovos', 'Ovo de galinha cozido/mexido (4 unidades – 220 g)', 'proteinas', 4, 'un')] },
  { id: 'salmao', label: 'Salmão grelhado (2 filés pequenos – 150 g)', tags: ['peixe'], ingredients: [ing('salmao', 'Salmão grelhado (2 filés pequenos – 150 g)', 'proteinas', 150, 'g')] },
  { id: 'frango-desfiado', label: 'Frango desfiado (6 colheres de sopa – 150 g)', tags: ['frango'], ingredients: [ing('frango-desfiado', 'Frango desfiado (6 colheres de sopa – 150 g)', 'proteinas', 150, 'g')] },
];

const CARBO_LIST: [string, string, string][] = [
  ['arroz-integral', 'Arroz integral', 'graos'],
  ['arroz-branco', 'Arroz branco', 'graos'],
  ['arroz-parboilizado', 'Arroz parboilizado', 'graos'],
  ['batata-baroa', 'Batata-baroa', 'verduras'],
  ['batata-inglesa', 'Batata inglesa', 'verduras'],
  ['batata-doce', 'Batata-doce', 'verduras'],
  ['aipim', 'Aipim', 'verduras'],
  ['inhame', 'Inhame', 'verduras'],
  ['quinoa', 'Quinoa', 'graos'],
  ['macarrao-integral', 'Macarrão integral', 'graos'],
  ['milho', 'Milho', 'graos'],
  ['farinha-mandioca', 'Farinha de mandioca', 'graos'],
  ['angu', 'Angu', 'graos'],
  ['cuscuz', 'Cuscuz', 'graos'],
];

function carboidratos(colheres: number): ChoiceGroup {
  return {
    id: 'carboidrato',
    label: `Carboidrato (25% do prato – ${colheres} colheres de sopa)`,
    portion: { text: `${colheres} colheres de sopa`, qty: colheres, unit: 'col. sopa' },
    choices: CARBO_LIST.map(([key, name, cat]) => ({
      id: key,
      label: name,
      ingredients: [ing(key, `${name} (${colheres} colheres de sopa)`, cat as 'graos' | 'verduras', colheres, 'col. sopa')],
    })),
  };
}

const GRAOS: ChoiceGroup = {
  id: 'graos',
  label: 'Grãos (3 colheres de sopa)',
  portion: { text: '3 colheres de sopa', qty: 3, unit: 'col. sopa' },
  choices: [
    ['feijao', 'Feijão'],
    ['lentilha', 'Lentilha'],
    ['ervilha', 'Ervilha'],
    ['grao-de-bico', 'Grão-de-bico'],
    ['soja', 'Soja'],
  ].map(([key, name]) => ({
    id: key,
    label: name,
    ingredients: [ing(key, `${name} (3 colheres de sopa)`, 'graos', 3, 'col. sopa')],
  })),
};

const VEGETAIS: ChoiceGroup = {
  id: 'vegetais',
  label: 'Vegetais à vontade (pelo menos 50% do prato)',
  vegetableSource: true,
  note: 'Crus ou cozidos. Para temperar: sal, azeite de oliva, vinagre e limão.',
};

const FRUTA_TABELA: ChoiceGroup = {
  id: 'fruta',
  label: '1 porção de fruta (tabela de densidade calórica)',
  fruitSource: 'tabela',
};

const NAO_LIQUIDOS = 'Não ingerir líquidos durante a refeição e até 30 minutos após.';

// ---------------------------------------------------------------------------
// CAFÉ DA MANHÃ — PDF p. 5
// ---------------------------------------------------------------------------

export const CAFE: MealOption[] = [
  {
    id: 'cafe-montagem',
    slot: 'cafe',
    title: 'Proteína + acompanhamento + pão/carboidrato + fruta',
    kind: 'combinacao',
    source: 'Plano p. 5',
    tags: ['rapido', 'salgado', 'economico'],
    groups: [
      {
        id: 'proteina',
        label: 'Proteína',
        choices: [
          { id: 'frango', label: '2 colheres de sopa de frango desfiado (40 g)', tags: ['frango'], ingredients: [ing('frango-desfiado', '2 colheres de sopa de frango desfiado (40 g)', 'proteinas', 40, 'g')] },
          { id: 'atum', label: '4 colheres de sopa de atum desfiado (60 g)', tags: ['peixe'], ingredients: [ing('atum', '4 colheres de sopa de atum desfiado (60 g)', 'proteinas', 60, 'g')] },
          { id: 'ovos', label: '2 ovos mexidos/fritos/cozidos (110 g)', tags: ['ovos'], ingredients: [ing('ovos', '2 ovos mexidos/fritos/cozidos (110 g)', 'proteinas', 2, 'un')] },
        ],
      },
      {
        id: 'acompanhamento',
        label: 'Acompanhamento',
        choices: [
          { id: 'mucarela', label: '1 fatia de queijo muçarela light (20 g)', ingredients: [ing('mucarela', '1 fatia de queijo muçarela light (20 g)', 'laticinios', 1, 'fatia')] },
          { id: 'minas', label: '1 fatia de queijo minas frescal light (20 g)', ingredients: [ing('minas-light', '1 fatia de queijo minas frescal light (20 g)', 'laticinios', 1, 'fatia')] },
          { id: 'requeijao', label: '1 colher de sopa de requeijão light (10 g)', ingredients: [ing('requeijao', '1 colher de sopa de requeijão light (10 g)', 'laticinios', 10, 'g')] },
        ],
      },
      {
        id: 'carboidrato',
        label: 'Pão ou carboidrato',
        choices: [
          { id: 'pao-frances', label: '1 pão francês (50 g)', ingredients: [ing('pao-frances', '1 pão francês (50 g)', 'graos', 1, 'un')] },
          { id: 'pao-forma', label: '2 fatias de pão de forma integral (50 g)', ingredients: [ing('pao-forma-integral', '2 fatias de pão de forma integral (50 g)', 'graos', 2, 'fatia')] },
          { id: 'pao-sirio', label: '1 pão sírio (50 g)', ingredients: [ing('pao-sirio', '1 pão sírio (50 g)', 'graos', 1, 'un')] },
          { id: 'tapioca', label: '4 colheres de sopa de goma de tapioca (40 g)', ingredients: [ing('goma-tapioca', '4 colheres de sopa de goma de tapioca (40 g)', 'graos', 40, 'g')] },
          { id: 'banana-da-terra', label: '1 banana-da-terra (100 g)', ingredients: [ing('banana-da-terra', '1 banana-da-terra (100 g)', 'frutas', 1, 'un')] },
          {
            id: 'aipim',
            label: '2 colheres de sopa de aipim cozido',
            ingredients: [ing('aipim', '2 colheres de sopa de aipim cozido', 'verduras', 2, 'col. sopa', { flag: 'O plano não informa o peso em gramas desta porção.' })],
          },
        ],
      },
      FRUTA_TABELA,
      BEBIDAS_CAFE,
    ],
    fixed: [
      ing('chia', '2 colheres de chá de semente de chia (20 g)', 'graos', 2, 'col. chá', {
        flag: 'O PDF indica "2 colheres de chá (20 g)". Duas colheres de chá costumam pesar menos que 20 g — confirme a medida com a nutricionista.',
      }),
    ],
  },
  {
    id: 'cafe-gostosinho',
    slot: 'cafe',
    title: 'Gostosinho de cuscuz',
    kind: 'receita',
    source: 'Plano p. 5',
    tags: ['salgado', 'ovos', 'economico'],
    fixed: [
      ing('cuscuz', '4 colheres de sopa de cuscuz (40 g)', 'graos', 40, 'g'),
      ing('ovos', '2 unidades de ovo de galinha (110 g)', 'proteinas', 2, 'un'),
      ing('minas-light', '1 fatia de queijo minas frescal light (20 g)', 'laticinios', 1, 'fatia'),
      ing('requeijao', '2 colheres de sopa de requeijão light (20 g)', 'laticinios', 20, 'g'),
      free('temperos', 'Sal e temperos a gosto', 'outros'),
    ],
    groups: [BEBIDAS_CAFE],
    steps: [
      'Hidrate o cuscuz.',
      'Acrescente os ovos, o requeijão, sal e temperos a gosto até formar uma massa homogênea.',
      'Coloque em uma frigideira antiaderente em fogo baixo.',
      'Quando a massa firmar, vire para dourar o outro lado e acrescente o queijo minas.',
      'Quando estiver ao seu gosto, pode consumir.',
    ],
  },
  {
    id: 'cafe-vitamina',
    slot: 'cafe',
    title: 'Vitamina de fruta proteica',
    kind: 'receita',
    source: 'Plano p. 5',
    tags: ['rapido', 'doce'],
    fixed: [
      ing('whey', '1 medidor de whey protein (30 g)', 'outros', 30, 'g'),
      ing('aveia-flocos', '2 colheres de sopa de aveia em flocos (20 g)', 'graos', 20, 'g'),
    ],
    groups: [
      FRUTA_TABELA,
      {
        id: 'liquido',
        label: 'Líquido',
        choices: [
          { id: 'agua', label: '200 ml de água', ingredients: [] },
          { id: 'leite', label: '200 ml de leite desnatado', ingredients: [ing('leite-desnatado', '200 ml de leite desnatado', 'laticinios', 200, 'ml')] },
        ],
      },
      BEBIDAS_CAFE,
    ],
  },
];

// ---------------------------------------------------------------------------
// ALMOÇO — PDF p. 6
// ---------------------------------------------------------------------------

export const ALMOCO: MealOption[] = [
  {
    id: 'almoco-prato',
    slot: 'almoco',
    title: 'Prato saudável',
    kind: 'prato',
    source: 'Plano p. 3 e 6',
    tags: ['salgado', 'levar', 'antecipado'],
    fixed: [],
    groups: [
      { id: 'proteina', label: 'Proteína (25% do prato)', choices: PROTEINAS_PRATO },
      carboidratos(5),
      GRAOS,
      VEGETAIS,
      {
        id: 'sobremesa',
        label: 'Sobremesa: 1 porção de fruta cítrica',
        fruitSource: 'citrica',
        note: 'Abacaxi, laranja, tangerina, kiwi ou morango (porção conforme a tabela).',
      },
    ],
    notes: [NAO_LIQUIDOS, '1 vez por semana: comer a sua comida preferida.'],
  },
];

// ---------------------------------------------------------------------------
// LANCHE DA TARDE — PDF p. 6 e 7
// ---------------------------------------------------------------------------

export const LANCHE: MealOption[] = [
  {
    id: 'lanche-panqueca',
    slot: 'lanche',
    title: 'Panqueca de banana',
    kind: 'receita',
    source: 'Plano p. 6',
    tags: ['doce', 'ovos', 'rapido', 'economico'],
    fixed: [
      ing('ovos', '1 ovo', 'proteinas', 1, 'un'),
      ing('banana', '1 banana amassada', 'frutas', 1, 'un'),
      ing('aveia-flocos', '1 colher de sopa de aveia em flocos', 'graos', 1, 'col. sopa'),
      free('canela', 'Canela', 'outros'),
    ],
    groups: [],
    steps: [
      'Misture todos os ingredientes até ficar homogêneo.',
      'Leve em frigideira untada.',
      'Doure de ambos os lados.',
    ],
  },
  {
    id: 'lanche-crepioca',
    slot: 'lanche',
    title: 'Crepioca',
    kind: 'receita',
    source: 'Plano p. 6',
    tags: ['salgado', 'ovos', 'rapido', 'economico'],
    fixed: [
      ing('ovos', '1 ovo', 'proteinas', 1, 'un'),
      ing('goma-tapioca', '1 colher de sopa de goma de tapioca', 'graos', 1, 'col. sopa'),
      ing('parmesao', '1 colher de sopa de queijo parmesão', 'laticinios', 1, 'col. sopa'),
      free('curcuma', 'Cúrcuma', 'outros'),
      free('pimenta-reino', 'Pimenta-do-reino', 'outros'),
    ],
    groups: [],
    steps: [
      'Misture todos os ingredientes até ficar homogêneo.',
      'Leve em frigideira untada.',
      'Doure de ambos os lados.',
    ],
  },
  {
    id: 'lanche-ovos-fruta',
    slot: 'lanche',
    title: 'Ovos cozidos + fruta',
    kind: 'combinacao',
    source: 'Plano p. 6',
    tags: ['salgado', 'ovos', 'rapido', 'levar', 'antecipado', 'economico'],
    fixed: [ing('ovos', '2 ovos cozidos (110 g)', 'proteinas', 2, 'un')],
    groups: [{ ...FRUTA_TABELA, label: '1 fruta de sua preferência' }],
  },
  {
    id: 'lanche-frango-batata',
    slot: 'lanche',
    title: 'Frango desfiado + batata',
    kind: 'combinacao',
    source: 'Plano p. 6',
    tags: ['salgado', 'frango', 'levar', 'antecipado'],
    fixed: [ing('frango-desfiado', '5 colheres de sopa de frango desfiado (100 g)', 'proteinas', 100, 'g')],
    groups: [
      {
        id: 'batata',
        label: 'Batata (2 colheres de sopa – 80 g)',
        choices: [
          { id: 'inglesa', label: 'Batata inglesa (2 colheres de sopa – 80 g)', ingredients: [ing('batata-inglesa', 'Batata inglesa (2 colheres de sopa – 80 g)', 'verduras', 80, 'g')] },
          { id: 'doce', label: 'Batata-doce (2 colheres de sopa – 80 g)', ingredients: [ing('batata-doce', 'Batata-doce (2 colheres de sopa – 80 g)', 'verduras', 80, 'g')] },
        ],
      },
    ],
  },
  {
    id: 'lanche-iogurte',
    slot: 'lanche',
    title: 'Iogurte natural + fruta + aveia',
    kind: 'combinacao',
    source: 'Plano p. 6',
    tags: ['doce', 'rapido', 'levar'],
    fixed: [
      ing('iogurte-natural', '1 copo de iogurte natural (200 ml)', 'laticinios', 200, 'ml'),
      ing('aveia-flocos', '2 colheres de chá de aveia em flocos', 'graos', 2, 'col. chá'),
    ],
    groups: [FRUTA_TABELA],
  },
  {
    id: 'lanche-bebida-proteina',
    slot: 'lanche',
    title: 'Bebida láctea proteica + proteína',
    kind: 'combinacao',
    source: 'Plano p. 6',
    tags: ['rapido', 'levar', 'salgado'],
    fixed: [
      ing('bebida-lactea', '1 bebida láctea proteica', 'laticinios', 1, 'un', {
        flag: 'O plano não especifica o volume da bebida láctea proteica neste lanche.',
      }),
    ],
    groups: [
      {
        id: 'proteina',
        label: 'Acompanhamento proteico',
        choices: [
          { id: 'ovos', label: '2 ovos cozidos/mexidos (110 g)', tags: ['ovos'], ingredients: [ing('ovos', '2 ovos cozidos/mexidos (110 g)', 'proteinas', 2, 'un')] },
          { id: 'frango', label: '4 colheres de sopa de frango desfiado', tags: ['frango'], ingredients: [ing('frango-desfiado', '4 colheres de sopa de frango desfiado', 'proteinas', 4, 'col. sopa', { flag: 'Peso em gramas não informado no plano.' })] },
          { id: 'atum', label: '4 colheres de sopa de atum desfiado', tags: ['peixe'], ingredients: [ing('atum', '4 colheres de sopa de atum desfiado', 'proteinas', 4, 'col. sopa', { flag: 'Peso em gramas não informado no plano.' })] },
        ],
      },
    ],
  },
  {
    id: 'lanche-bebida-fruta',
    slot: 'lanche',
    title: 'Bebida láctea proteica + fruta + aveia',
    kind: 'combinacao',
    source: 'Plano p. 7',
    tags: ['doce', 'rapido', 'levar'],
    fixed: [
      ing('bebida-lactea', '1 bebida láctea proteica', 'laticinios', 1, 'un', {
        flag: 'O plano não especifica o volume da bebida láctea proteica neste lanche.',
      }),
      ing('aveia-flocos', '2 colheres de sopa de aveia em flocos', 'graos', 2, 'col. sopa'),
    ],
    groups: [FRUTA_TABELA],
  },
];

// ---------------------------------------------------------------------------
// JANTAR — PDF p. 7 a 9
// ---------------------------------------------------------------------------

const JANTAR_PRATO: MealOption = {
  id: 'jantar-prato',
  slot: 'jantar',
  title: 'Prato saudável',
  kind: 'prato',
  variant: 'padrao',
  source: 'Plano p. 3 e 7',
  tags: ['salgado', 'levar', 'antecipado'],
  fixed: [],
  groups: [
    { id: 'proteina', label: 'Proteína (25% do prato)', choices: PROTEINAS_PRATO },
    carboidratos(4),
    GRAOS,
    VEGETAIS,
  ],
  notes: [NAO_LIQUIDOS],
};

/** "Opções de lanches, caso não queira comer comida" — no app: "Hoje quero algo diferente". */
const JANTAR_DIFERENTE: MealOption[] = [
  {
    id: 'jantar-paozinho',
    slot: 'jantar',
    variant: 'diferente',
    title: 'Pãozinho de frigideira',
    kind: 'receita',
    source: 'Plano p. 7',
    tags: ['salgado', 'ovos', 'rapido', 'economico'],
    fixed: [
      ing('ovos', '2 ovos', 'proteinas', 2, 'un'),
      ing('farinha-aveia', '2 colheres de sopa de farinha de aveia', 'graos', 2, 'col. sopa'),
      free('sal', 'Sal', 'outros'),
      ing('azeite', '1 colher de chá de azeite', 'outros', 1, 'col. chá'),
      ing('fermento', '1 colher de chá de fermento em pó', 'outros', 1, 'col. chá'),
    ],
    groups: [
      {
        id: 'recheio',
        label: 'Recheio',
        choices: [
          { id: 'cottage', label: '2 colheres de sopa de cottage', ingredients: [ing('cottage', '2 colheres de sopa de cottage', 'laticinios', 2, 'col. sopa')] },
          { id: 'requeijao', label: '1 colher de sopa de requeijão', ingredients: [ing('requeijao-comum', '1 colher de sopa de requeijão', 'laticinios', 1, 'col. sopa')] },
          {
            id: 'ricota',
            label: '1 colher de sopa de pasta de ricota (ricota amassada com azeite e ervas)',
            ingredients: [ing('ricota', '1 colher de sopa de pasta de ricota (ricota amassada com azeite e ervas)', 'laticinios', 1, 'col. sopa')],
          },
          { id: 'minas', label: '2 fatias de queijo minas frescal/padrão light', ingredients: [ing('minas-light', '2 fatias de queijo minas frescal/padrão light', 'laticinios', 2, 'fatia')] },
          { id: 'mucarela', label: '2 fatias de muçarela', ingredients: [ing('mucarela-comum', '2 fatias de muçarela', 'laticinios', 2, 'fatia')] },
        ],
      },
    ],
    steps: [
      'Misture todos os ingredientes até ficar homogêneo.',
      'Leve em frigideira untada e doure de ambos os lados.',
      'Pode colocar na torradeira.',
      'Recheie com a opção escolhida.',
    ],
  },
  {
    id: 'jantar-hamburguer',
    slot: 'jantar',
    variant: 'diferente',
    title: 'Hambúrguer caseiro',
    kind: 'receita',
    source: 'Plano p. 7',
    tags: ['salgado', 'bovina'],
    fixed: [
      ing('patinho', '100 g de patinho moído', 'proteinas', 100, 'g'),
      ing('pao-hamburguer', '1 pão de hambúrguer de sua preferência', 'graos', 1, 'un'),
      free('salada-folhas', 'Salada de folhas à vontade', 'verduras'),
      free('temperos', 'Sal e temperos a gosto', 'outros'),
    ],
    groups: [],
  },
  {
    id: 'jantar-mcchicken',
    slot: 'jantar',
    variant: 'diferente',
    title: 'McChicken saudável',
    kind: 'receita',
    source: 'Plano p. 7',
    tags: ['salgado', 'frango', 'antecipado'],
    fixed: [
      ing('peito-frango', '100 g de peito de frango triturado', 'proteinas', 100, 'g'),
      ing('pao-hamburguer', '1 pão de hambúrguer de sua preferência', 'graos', 1, 'un'),
      free('salada-folhas', 'Salada de folhas à vontade', 'verduras'),
      free('temperos', 'Sal e temperos a gosto (lemon pepper, chimichurri, páprica, manjericão...)', 'outros'),
    ],
    groups: [
      {
        id: 'empanar',
        label: 'Para empanar (20 g)',
        choices: [
          { id: 'panko', label: '20 g de farinha panko', ingredients: [ing('panko', '20 g de farinha panko', 'graos', 20, 'g')] },
          { id: 'flocao', label: '20 g de flocão de milho', ingredients: [ing('flocao-milho', '20 g de flocão de milho', 'graos', 20, 'g')] },
        ],
      },
    ],
    steps: [
      'Com o peito de frango já triturado, adicione o sal e os temperos de sua preferência.',
      'Faça uma bolinha com a massa e molde no formato de hambúrguer.',
      'Empane com a farinha panko ou flocão de milho (não precisa de ovo nesta etapa).',
      'Leve à air fryer por 30 min a 180 °C, ou ao forno a 250 °C por 20 min, até ficar crocante.',
      'Coloque o hambúrguer no pão com a salada.',
    ],
    notes: ['Molhos: o que você gosta, com moderação. Uma ótima opção é a maionese caseira.'],
  },
  {
    id: 'jantar-omelete',
    slot: 'jantar',
    variant: 'diferente',
    title: 'Omelete',
    kind: 'receita',
    source: 'Plano p. 8',
    tags: ['salgado', 'ovos', 'rapido', 'economico'],
    fixed: [
      ing('ovos', '2 ovos inteiros', 'proteinas', 2, 'un'),
      ing('ovos', '1 clara', 'proteinas', 1, 'un'),
      ing('legumes-picados', '1 colher de sopa de legumes picados (tomate, cebola, espinafre, o que preferir)', 'verduras', 1, 'col. sopa'),
      free('sal', 'Sal a gosto', 'outros'),
      free('pimenta-reino', 'Pimenta-do-reino e/ou cúrcuma a gosto', 'outros'),
      ing('azeite', '1 colher de chá de azeite (para untar)', 'outros', 1, 'col. chá'),
    ],
    groups: [],
    steps: [
      'Quebre os ovos em um recipiente e bata bem com um garfo.',
      'Adicione a clara, sal e temperos. Misture os legumes picados.',
      'Aqueça uma frigideira antiaderente com um fio de azeite e despeje a mistura.',
      'Cozinhe em fogo baixo por cerca de 2–3 minutos.',
      'Vire ou dobre ao meio e deixe por mais 1 minuto.',
    ],
  },
  {
    id: 'jantar-miojo',
    slot: 'jantar',
    variant: 'diferente',
    title: 'Miojo fake',
    kind: 'receita',
    source: 'Plano p. 8',
    tags: ['salgado', 'rapido', 'economico'],
    fixed: [
      ing('macarrao-cabelo-anjo', '40 g de macarrão cabelinho de anjo/bifum cru (se tornará 100 g)', 'graos', 40, 'g'),
      ing('curcuma', '1 colher de café de açafrão', 'outros', 1, 'col. café'),
      ing('paprica-defumada', '1 colher de café de páprica defumada', 'outros', 1, 'col. café'),
      ing('curry', '1 colher de café de curry', 'outros', 1, 'col. café'),
      ing('lemon-pepper', '1 colher de café de lemon pepper', 'outros', 1, 'col. café'),
      free('sal', 'Sal a gosto', 'outros'),
    ],
    groups: [],
    steps: [
      'Coloque o macarrão para cozinhar em água fervendo.',
      'Enquanto isso, misture os temperos.',
      'Quando o macarrão estiver pronto, coloque os temperos por cima, mexa bem e está pronto!',
    ],
  },
  {
    id: 'jantar-mingau',
    slot: 'jantar',
    variant: 'diferente',
    title: 'Mingau de aveia proteico',
    kind: 'receita',
    source: 'Plano p. 8',
    tags: ['doce', 'rapido'],
    fixed: [
      ing('aveia-flocos', '1 colher de sopa de aveia em flocos', 'graos', 1, 'col. sopa'),
      ing('leite-desnatado', '1 xícara de chá de leite desnatado', 'laticinios', 240, 'ml'),
      ing('whey', '30 g de whey protein', 'outros', 30, 'g'),
      ing('baunilha', '1 colher de chá de essência de baunilha', 'outros', 1, 'col. chá'),
      free('canela', 'Canela em pó a gosto', 'outros'),
      ing('banana-nanica', '1 banana nanica', 'frutas', 1, 'un'),
    ],
    groups: [],
    steps: [
      'Em uma panela, aqueça o leite e coloque a aveia e o whey protein. Mexa até engrossar.',
      'Desligue o fogo e acrescente a essência de baunilha.',
      'Corte algumas rodelas de banana nanica e reserve-as.',
      'Amasse o restante da banana e coloque no mingau.',
      'Coloque em um recipiente, polvilhe a canela e enfeite com as rodelas de banana.',
    ],
    flags: ['Os ingredientes citam "aveia em flocos", mas o modo de preparo cita "farelo de aveia". Confirme com a nutricionista qual usar.'],
  },
  {
    id: 'jantar-pipoca',
    slot: 'jantar',
    variant: 'diferente',
    title: 'Pipoca salgada pequena',
    kind: 'receita',
    source: 'Plano p. 8',
    tags: ['salgado', 'rapido', 'economico'],
    fixed: [
      ing('milho-pipoca', '½ xícara de milho de pipoca', 'graos', 0.5, 'xícara'),
      ing('azeite', '1 colher de chá de azeite (ou sem óleo, se tiver pipoqueira)', 'outros', 1, 'col. chá'),
    ],
    groups: [],
    steps: ['Meça ½ xícara de milho e estoure na panela com 1 colher de chá de azeite, ou faça sem óleo, caso tenha pipoqueira.'],
  },
  {
    id: 'jantar-pastel',
    slot: 'jantar',
    variant: 'diferente',
    title: 'Pastel saudável',
    kind: 'receita',
    source: 'Plano p. 8',
    tags: ['salgado'],
    fixed: [
      ing('massa-pastel', '40 g de massa de pastel', 'graos', 40, 'g'),
      ing('mucarela', '1 fatia de queijo muçarela light', 'laticinios', 1, 'fatia'),
      free('ovos', 'Gema de ovo para pincelar', 'proteinas'),
    ],
    groups: [
      {
        id: 'recheio',
        label: 'Recheio (50 g)',
        choices: [
          { id: 'carne', label: '50 g de carne moída', tags: ['bovina'], ingredients: [ing('carne-moida', '50 g de carne moída', 'proteinas', 50, 'g')] },
          { id: 'frango', label: '50 g de frango desfiado', tags: ['frango'], ingredients: [ing('frango-desfiado', '50 g de frango desfiado', 'proteinas', 50, 'g')] },
        ],
      },
    ],
    steps: [
      'Recheie a massa de pastel com a carne moída ou frango desfiado e coloque a fatia de muçarela.',
      'Feche o pastel, pressionando as bordas com um garfo.',
      'Pincele com gema de ovo.',
      'Leve à air fryer a 180 °C por 5 a 10 minutos, ou até dourar e ficar crocante.',
    ],
    notes: ['Dica do plano: tempere o recheio com ervas finas, cebola, alho, pimenta e outros temperos de sua preferência.'],
  },
  {
    id: 'jantar-wrap',
    slot: 'jantar',
    variant: 'diferente',
    title: 'Wrap',
    kind: 'receita',
    source: 'Plano p. 8',
    tags: ['salgado', 'frango', 'levar', 'rapido'],
    fixed: [
      ing('rap10', '1 unidade de Rap10 integral', 'graos', 1, 'un'),
      ing('file-frango', '150 g de frango grelhado em tiras', 'proteinas', 150, 'g'),
      free('salada-folhas', 'Salada a gosto', 'verduras'),
    ],
    groups: [],
    steps: [
      'Aqueça o Rap10 integral na air fryer por 2 a 3 minutos, ou em frigideira antiaderente por 1 minuto de cada lado, até ficar levemente crocante e maleável.',
      'Recheie com o frango em tiras e a salada.',
      'Pode incrementar com um molho de iogurte.',
      'Enrole como um wrap e sirva.',
    ],
  },
  {
    id: 'jantar-pao-queijo',
    slot: 'jantar',
    variant: 'diferente',
    title: 'Pão de queijo saudável',
    kind: 'receita',
    source: 'Plano p. 9',
    tags: ['salgado', 'ovos', 'antecipado'],
    fixed: [
      ing('ovos', '1 ovo', 'proteinas', 1, 'un'),
      ing('goma-tapioca', '2 colheres de sopa de tapioca', 'graos', 2, 'col. sopa'),
      ing('requeijao-comum', '1 colher de requeijão', 'laticinios', 1, 'col. sopa', {
        flag: 'O plano diz "1 colher de requeijão" sem especificar o tipo de colher.',
      }),
      ing('mucarela-comum', '30 g de queijo muçarela', 'laticinios', 30, 'g'),
      free('sal', 'Sal a gosto', 'outros'),
    ],
    groups: [],
    steps: [
      'Misture todos os ingredientes até formar uma massa homogênea.',
      'Modele as bolinhas.',
      'Leve ao forno pré-aquecido a 180 °C por cerca de 20 minutos ou até dourar.',
    ],
  },
  {
    id: 'jantar-quibe',
    slot: 'jantar',
    variant: 'diferente',
    title: 'Quibe saudável',
    kind: 'receita',
    source: 'Plano p. 9',
    tags: ['salgado', 'bovina', 'antecipado', 'levar'],
    fixed: [
      ing('quinoa', '200 g de quinoa cozida', 'graos', 200, 'g'),
      ing('carne-moida', '600 g de carne moída crua', 'proteinas', 600, 'g'),
      free('temperos', 'Temperos e verduras a gosto (cebolinha, coentro, cebola, hortelã, alho, pimenta, sal, limão etc.)', 'verduras'),
    ],
    groups: [],
    steps: [
      'Em uma tigela, misture a quinoa cozida com a carne moída crua.',
      'Adicione os temperos e as verduras picadas a gosto. Misture até ficar homogêneo.',
      'Pegue uma porção da massa e molde no formato de quibe.',
      'Disponha em uma assadeira ou na cesta da air fryer. Se desejar, pincele com azeite.',
      'Leve ao forno ou à air fryer por cerca de 30 minutos, ou até dourar.',
    ],
    notes: ['Pincelar com azeite deixa o quibe mais gostoso e douradinho!'],
    batch: { note: 'Receita inteira (o plano não informa o rendimento).' },
    manualOnly: true,
    flags: ['O plano não informa quantas porções esta receita rende nem quanto consumir por refeição. Confirme a porção com a nutricionista.'],
  },
];

export const JANTAR: MealOption[] = [JANTAR_PRATO, ...JANTAR_DIFERENTE];

/** Receitas complementares (não são refeições isoladas). */
export const COMPLEMENTOS: Recipe[] = [
  {
    id: 'maionese-caseira',
    title: 'Maionese caseira',
    source: 'Plano p. 8',
    ingredients: [
      ing('ovos', '3 ovos inteiros cozidos', 'proteinas', 3, 'un'),
      ing('iogurte-semidesnatado', '170 g de iogurte semidesnatado', 'laticinios', 170, 'g'),
      ing('mostarda', '12 g de mostarda (1 colher de chá)', 'outros', 12, 'g'),
      free('sal', 'Sal e pimenta-do-reino a gosto', 'outros'),
      free('temperos', 'Salsinha e manjericão a gosto', 'verduras'),
    ],
    steps: [
      'Em um recipiente, coloque todos os ingredientes e faça uma mistura homogênea.',
      'Para ficar mais cremosa, deixe o iogurte dessorando antes: coloque-o em um filtro de papel sobre um copo para o soro sair (cerca de 5 minutos). Quanto mais tempo, mais cremosa.',
    ],
    notes: ['Complemento: sugestão do plano para acompanhar o McChicken saudável e lanches.'],
    batch: { note: 'Receita inteira (rendimento não informado).' },
  },
  {
    id: 'molho-iogurte',
    title: 'Molho de iogurte',
    source: 'Plano p. 9',
    ingredients: [
      ing('iogurte-natural', '3 colheres de sopa de iogurte natural', 'laticinios', 3, 'col. sopa'),
      ing('limao', 'Suco de ½ limão', 'frutas', 0.5, 'un'),
      free('sal', 'Sal a gosto', 'outros'),
      free('pimenta-reino', 'Pimenta a gosto', 'outros'),
      ing('mel', '1 colher de chá de mel', 'outros', 1, 'col. chá'),
    ],
    steps: ['Misture todos os ingredientes em um recipiente.'],
    notes: ['Complemento: pode acompanhar o wrap.'],
  },
];

export const ALL_OPTIONS: MealOption[] = [...CAFE, ...ALMOCO, ...LANCHE, ...JANTAR];

export const OPTIONS_BY_SLOT: Record<MealOption['slot'], MealOption[]> = {
  cafe: CAFE,
  almoco: ALMOCO,
  lanche: LANCHE,
  jantar: JANTAR,
};

export const optionById = (id: string) => ALL_OPTIONS.find((o) => o.id === id);
