import type { Recipe } from '../types';
import { free, ing } from './ingredients';

/** "Em caso de vontade de doce, optar por receitas saudáveis" — PDF p. 9. */
export const SWEETS: Recipe[] = [
  {
    id: 'brigadeiro-fit',
    title: 'Brigadeiro fit',
    source: 'Plano p. 9',
    ingredients: [
      ing('bebida-lactea', '1 bebida láctea proteica de sua preferência (200 ml)', 'laticinios', 1, 'un'),
      ing('chocolate-po-70', '6 g de chocolate em pó 70% cacau', 'outros', 6, 'g'),
      ing('pudim-diet', '1 sachê (20 g) de pudim diet sabor chocolate', 'outros', 1, 'sachê'),
    ],
    steps: [
      'Misture todos os ingredientes em uma panela.',
      'Quando estiver homogênea, leve ao fogo médio/baixo e mexa sem parar, até que desgrude do fundo da panela.',
      'Fica pronto em menos de 5 minutos.',
    ],
  },
  {
    id: 'banoffee',
    title: 'Banoffee',
    source: 'Plano p. 9',
    ingredients: [
      ing('iogurte-natural', '1 copo de iogurte natural de sua preferência (160 g)', 'laticinios', 160, 'g'),
      ing('chia', '1 colher de sopa de chia', 'graos', 1, 'col. sopa'),
      free('canela', 'Canela a gosto', 'outros'),
      ing('banana-prata', '1 banana prata', 'frutas', 1, 'un'),
    ],
    variants: [
      { id: 'doce-de-leite', label: '2 colheres de sopa de doce de leite', ingredients: [ing('doce-de-leite', '2 colheres de sopa de doce de leite', 'outros', 2, 'col. sopa')] },
      {
        id: 'whey',
        label: 'Versão mais proteica: 1 dose de whey sabor doce de leite misturada com água até dar ponto de doce de leite',
        ingredients: [ing('whey-doce-leite', '1 dose de whey protein sabor doce de leite', 'outros', 1, 'medidor')],
      },
    ],
    steps: [
      'Em um pote, coloque o iogurte com a chia.',
      'Em seguida, coloque o doce de leite (ou o doce de leite fake de whey).',
      'Faça uma camada de bananas picadas e coloque a canela a gosto.',
    ],
  },
  {
    id: 'mousse-morango',
    title: 'Mousse de gelatina de morango',
    source: 'Plano p. 9',
    ingredients: [
      ing('gelatina-morango-zero', '1 sachê de gelatina de morango zero', 'outros', 1, 'sachê'),
      ing('iogurte-natural', '1 copo de iogurte natural (200 g)', 'laticinios', 200, 'g'),
      ing('morango-congelado', '200 g de morango congelado', 'frutas', 200, 'g'),
    ],
    steps: [
      'Faça a gelatina conforme o rótulo da embalagem.',
      'Assim que firmar, coloque no liquidificador junto com os outros ingredientes.',
      'Coloque em uma travessa e reserve na geladeira até dar o ponto de mousse.',
    ],
    batch: { note: 'Rendimento não informado no plano.' },
  },
  {
    id: 'brownie-fit',
    title: 'Brownie fit',
    source: 'Plano p. 9',
    ingredients: [
      ing('aveia-flocos', '1 e ½ xícara de aveia', 'graos', 1.5, 'xícara'),
      ing('ovos', '4 ovos inteiros', 'proteinas', 4, 'un'),
      ing('margarina', '3 colheres de sopa de margarina sem sal', 'outros', 3, 'col. sopa'),
      ing('chocolate-po', '1 e ½ xícara de chocolate em pó', 'outros', 1.5, 'xícara'),
      ing('acucar-mascavo', '1 xícara de açúcar mascavo', 'outros', 1, 'xícara'),
      free('nozes', 'Nozes picadas', 'outros'),
    ],
    steps: [
      'Bata os ovos e o açúcar mascavo.',
      'Adicione os demais ingredientes até formar uma massa homogênea. Acrescente as nozes por último.',
      'Forre uma forma (redonda ou quadrada) com papel manteiga e despeje a massa.',
      'Leve ao forno a 180 °C, sem preaquecer, por 30 minutos. Retire e sirva.',
    ],
    notes: ['Rende, em média, 8 porções. Consumir UMA por dia.'],
    batch: { servings: 8, note: 'Rende em média 8 porções — consumir uma por dia.' },
  },
];

export const sweetById = (id: string) => SWEETS.find((s) => s.id === id);
