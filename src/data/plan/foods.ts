import type { FoodItem } from '../types';

/**
 * Tabela de densidade calórica — PDF páginas 10 e 11.
 * Porções transcritas exatamente como no documento.
 * Frutas cítricas: lista da "SOBREMESA" do almoço (p. 6): abacaxi, laranja, tangerina, kiwi, morango.
 */

const v = (id: string, name: string, density: FoodItem['density'], flag?: string): FoodItem => ({
  id,
  name,
  type: 'vegetal',
  density,
  ...(flag ? { flag } : {}),
});

const f = (
  id: string,
  name: string,
  portion: string,
  density: FoodItem['density'],
  extra: Partial<FoodItem> = {},
): FoodItem => ({ id, name, type: 'fruta', density, portion, ...extra });

export const VEGETABLES: FoodItem[] = [
  // Densidade calórica MUITO BAIXA
  v('agriao', 'Agrião', 'muito-baixa'),
  v('alface', 'Alface', 'muito-baixa'),
  v('pepino', 'Pepino', 'muito-baixa'),
  v('aipo', 'Aipo', 'muito-baixa'),
  v('rabanete', 'Rabanete', 'muito-baixa'),
  v('abobrinha', 'Abobrinha', 'muito-baixa'),
  v('endivia', 'Endívia', 'muito-baixa'),
  v('escarola', 'Escarola', 'muito-baixa'),
  v('tomate', 'Tomate', 'muito-baixa'),
  v('acelga', 'Acelga', 'muito-baixa'),
  v('chuchu', 'Chuchu', 'muito-baixa'),
  v('aspargos', 'Aspargos', 'muito-baixa'),
  v('pimentao', 'Pimentão', 'muito-baixa'),
  v('bertalha', 'Bertalha', 'muito-baixa'),
  v('cogumelos', 'Cogumelos', 'muito-baixa'),
  v('alfavaca', 'Alfavaca', 'muito-baixa'),
  v('almeirao', 'Almeirão', 'muito-baixa'),
  v('chicoria', 'Chicória', 'muito-baixa'),
  v('coentro', 'Coentro', 'muito-baixa'),
  v('espinafre', 'Espinafre', 'muito-baixa'),
  v('manjericao', 'Manjericão', 'muito-baixa'),
  v('radicchio', 'Radicho', 'muito-baixa'),
  v('abobora', 'Abóbora', 'muito-baixa'),
  v('mostarda-folhas', 'Mostarda (folhas)', 'muito-baixa'),
  v('nabo', 'Nabo', 'muito-baixa'),
  v('palmito', 'Palmito', 'muito-baixa'),
  v('brotos', 'Brotos', 'muito-baixa'),
  v('erva-doce', 'Erva-doce', 'muito-baixa'),
  v('vagem', 'Vagem', 'muito-baixa'),
  v('couve-manteiga', 'Couve manteiga', 'muito-baixa'),
  v('quiabo', 'Quiabo', 'muito-baixa'),
  v('brocolis', 'Brócolis', 'muito-baixa'),
  v('taioba', 'Taioba', 'muito-baixa'),
  v('salsa', 'Salsa', 'muito-baixa'),
  v('jilo', 'Jiló', 'muito-baixa'),
  v('cebola', 'Cebola', 'muito-baixa'),
  // Densidade calórica BAIXA
  v('cenoura', 'Cenoura', 'baixa'),
  v('ervilha-torta', 'Ervilha torta', 'baixa'),
  v('beterraba', 'Beterraba', 'baixa', 'No PDF está escrito "Beterrada" — interpretado como beterraba.'),
  v('couve-de-bruxelas', 'Couve de Bruxelas', 'baixa'),
  v('hortela', 'Hortelã', 'baixa'),
  v('alcachofra', 'Alcachofra', 'baixa'),
  v('alho-poro', 'Alho-poró', 'baixa'),
  v('gengibre', 'Gengibre', 'baixa'),
  // Densidade calórica MÉDIA
  v('edamame', 'Edamame', 'media'),
  v('alecrim', 'Alecrim', 'media'),
];

export const FRUITS: FoodItem[] = [
  // FRUTAS — densidade calórica MUITO BAIXA
  f('melancia', 'Melancia', '1 fatia pequena', 'muito-baixa'),
  f('morango', 'Morango', '8 unidades', 'muito-baixa', { citrica: true }),
  f('limonada', 'Limonada sem açúcar', 'Liberada', 'muito-baixa', { type: 'bebida' }),
  f('agua-de-coco', 'Água de coco', '1 copo (300 ml)', 'muito-baixa', { type: 'bebida' }),
  f('framboesa', 'Framboesa', '8 unidades', 'muito-baixa'),
  f('acerola', 'Acerola', '9 unidades', 'muito-baixa'),
  f('caju', 'Caju', '1 unidade média', 'muito-baixa'),
  f('pitaya', 'Pitaya', '½ unidade', 'muito-baixa'),
  f('grapefruit', 'Grapefruit', '1 unidade', 'muito-baixa'),
  f('melao', 'Melão', '1 fatia grande', 'muito-baixa'),
  f('amora', 'Amora', '10 unidades', 'muito-baixa'),
  f('camu-camu', 'Camu-camu', '7 unidades', 'muito-baixa'),
  f('jabuticaba', 'Jabuticaba', '10 unidades', 'muito-baixa'),
  f('pitanga', 'Pitanga', '6 unidades', 'muito-baixa'),
  f('goiaba', 'Goiaba', '1 unidade pequena', 'muito-baixa'),
  f('umbu', 'Umbu', '3 unidades', 'muito-baixa'),
  f('caja', 'Cajá', '3 unidades', 'muito-baixa'),
  f('kiwi', 'Kiwi', '1 unidade', 'muito-baixa', { citrica: true }),
  f('tangerina', 'Tangerina', '1 unidade pequena', 'muito-baixa', { citrica: true }),
  f('laranja', 'Laranja', '1 unidade pequena', 'muito-baixa', { citrica: true }),

  // FRUTAS — densidade calórica BAIXA
  f('abacaxi', 'Abacaxi', '1 fatia', 'baixa', { citrica: true }),
  f('ameixa-vermelha', 'Ameixa vermelha', '4 unidades', 'baixa'),
  f('ameixa-preta', 'Ameixa preta', '1 unidade pequena', 'baixa'),
  f('araca', 'Araçá', '1 unidade', 'baixa'),
  f('atemoia', 'Atemóia', '½ unidade', 'baixa'),
  f('banana', 'Banana', '1 unidade', 'baixa'),
  f('caqui', 'Caqui', '1 unidade pequena', 'baixa'),
  f('cupuacu', 'Cupuaçu', '1 unidade', 'baixa'),
  f('figo', 'Figo', '1 unidade', 'baixa'),
  f('graviola', 'Graviola', '½ unidade', 'baixa'),
  f('jambo', 'Jambo', '1 unidade', 'baixa'),
  f('jambolao', 'Jambolão', '5 unidades', 'baixa'),
  f('lichia', 'Lichia', '9 unidades', 'baixa'),
  f('maca', 'Maçã', '1 unidade', 'baixa'),
  f('mamao-formosa', 'Mamão formosa', '1 fatia fina', 'baixa'),
  f('manga-haden', 'Manga Haden', '1 fatia média', 'baixa'),
  f('mangaba', 'Mangaba', '5 unidades', 'baixa'),
  f('maracuja', 'Maracujá', '1 unidade média', 'baixa'),
  f('mirtilo', 'Mirtilo', '30 unidades', 'baixa'),
  f('nectarina', 'Nectarina', '1 unidade', 'baixa'),
  f('pera', 'Pera', '1 unidade', 'baixa'),
  f('pessego', 'Pêssego', '1 unidade', 'baixa'),
  f('sapoti', 'Sapoti', '½ unidade', 'baixa'),
  f('siriguela', 'Siriguela', '7 unidades', 'baixa'),
  f('uva', 'Uva', '6 unidades', 'baixa'),
  f('suco-natural', 'Suco natural sem açúcar', 'Feito com 1 porção de fruta', 'baixa', {
    type: 'bebida',
    flag: 'No PDF está escrito "feitos com 1 porção de açúcar" — provavelmente um erro de digitação para "fruta". Confirme com a nutricionista.',
  }),

  // FRUTAS — densidade calórica MÉDIA/ALTA
  f('abacate', 'Abacate', '¼ unidade', 'media-alta'),
  f('avocado', 'Avocado', '½ unidade', 'media-alta'),
  f('acai', 'Açaí', '10 unidades', 'media-alta'),
  f('ameixa-seca', 'Ameixa seca', '2 unidades médias', 'media-alta'),
  f('araticum', 'Araticum', '½ unidade', 'media-alta'),
  f('bacuri', 'Bacuri', '½ unidade', 'media-alta'),
  f('buriti', 'Buriti', '½ unidade', 'media-alta'),
  f('cacau', 'Cacau', '½ unidade', 'media-alta'),
  f('coco', 'Coco', '1 colher de sobremesa', 'media-alta'),
  f('uva-passa', 'Uva-passa', '1 colher de sopa', 'media-alta'),
  f('fruta-do-conde', 'Fruta do conde', '½ unidade', 'media-alta'),
  f('fruta-pao', 'Fruta-pão', '1 fatia', 'media-alta'),
  f('inga', 'Ingá', '1 unidade', 'media-alta'),
  f('jaca', 'Jaca', '4 unidades', 'media-alta'),
  f('jenipapo', 'Jenipapo', '½ unidade', 'media-alta'),
  f('pequi', 'Pequi', '½ unidade', 'media-alta'),
  f('tamarindo', 'Tamarindo', '6 unidades', 'media-alta'),
  f('tucuma', 'Tucumã', '½ unidade', 'media-alta'),
];

/** Frutas que podem ser escolhidas como "1 porção de fruta" (exclui bebidas). */
export const PORTION_FRUITS = FRUITS.filter((x) => x.type === 'fruta');
export const CITRUS_FRUITS = FRUITS.filter((x) => x.citrica);

export const ALL_FOODS: FoodItem[] = [...VEGETABLES, ...FRUITS];

export const foodById = (id: string) => ALL_FOODS.find((x) => x.id === id);

export const DENSITY_LABEL: Record<FoodItem['density'], string> = {
  'muito-baixa': 'Densidade muito baixa',
  baixa: 'Densidade baixa',
  media: 'Densidade média',
  'media-alta': 'Densidade média/alta',
};

export const DENSITY_INFO =
  'Densidade calórica é a quantidade de calorias que um alimento possui em relação ao seu peso. Alimentos de baixa densidade calórica possuem poucas calorias em grande volume; alimentos de alta densidade calórica possuem muitas calorias em pequenas quantidades.';
