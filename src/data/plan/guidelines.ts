/** Orientações gerais, hábitos e refeições fora de casa — PDF p. 1, 2, 3, 4, 11 e 12. */

export const PLAN_META = {
  patient: 'Paula dos Santos Pádua',
  nutritionist: 'Brenda Martello',
  crn: 'CRN 21102939',
  date: '04/07/2026',
  instagram: '@nutribrendamartello',
};

export const WATER = { minMl: 2500, maxMl: 3000, text: 'Ingestão hídrica diária: 2,5 a 3 litros/dia' };

export const ACTIVITY = {
  minutes: 40,
  minPerWeek: 3,
  maxPerWeek: 5,
  text: 'Faça pelo menos 40 minutos de atividade física sob orientação profissional (meta: 3 a 5 vezes por semana).',
};

export interface Habit {
  id: string;
  title: string;
  detail: string;
  frequency: 'diario' | 'semanal';
  icon: string;
}

/** Hábitos da página "objetivos & metas" (p. 1). */
export const HABITS: Habit[] = [
  { id: 'sentar-mesa', title: 'Comer sentada à mesa', detail: 'Sente-se à mesa, em local tranquilo, para realizar as refeições.', frequency: 'diario', icon: 'armchair' },
  { id: 'atencao', title: 'Prestar atenção durante as refeições', detail: 'Esteja presente na hora das refeições. Não coma vendo televisão ou concentrada em outra coisa.', frequency: 'diario', icon: 'eye' },
  { id: 'um-prato', title: 'Fazer as refeições em um prato, sem repetir', detail: 'Faça TODAS as refeições em um prato — evitar repetir.', frequency: 'diario', icon: 'utensils' },
  { id: 'talher', title: 'Descansar os talheres entre as garfadas', detail: 'Descanse o talher no prato entre cada garfada.', frequency: 'diario', icon: 'hand' },
  { id: 'beliscos', title: 'Evitar beliscos fora de hora', detail: 'Evite beliscos fora de hora.', frequency: 'diario', icon: 'cookie' },
  { id: 'hidratacao', title: 'Manter hidratação entre as refeições', detail: 'Mantenha hidratação entre as refeições (2,5 a 3 litros/dia).', frequency: 'diario', icon: 'droplets' },
  { id: 'atividade', title: 'Atividade física sob orientação profissional', detail: 'Pelo menos 40 minutos, com meta de 3 a 5 vezes por semana.', frequency: 'semanal', icon: 'dumbbell' },
  { id: 'preparar', title: 'Preparar refeições antecipadamente', detail: 'Organização é tudo! Os lanches podem ser montados para 2 a 3 dias.', frequency: 'semanal', icon: 'calendar-check' },
  { id: 'assar', title: 'Preferir assados, cozidos ou grelhados', detail: 'Evite frituras. Prefira assar, cozinhar ou grelhar.', frequency: 'diario', icon: 'flame' },
  { id: 'oleo', title: 'Usar pequenas quantidades de óleo', detail: 'Óleo vegetal (soja, milho ou girassol) em pequena quantidade — o ideal é menos de ½ lata por pessoa por mês.', frequency: 'diario', icon: 'droplet' },
  { id: 'cortes-magros', title: 'Preferir cortes magros de carne', detail: 'Retire a gordura visível da carne e a pele do frango e do peixe antes e depois do preparo.', frequency: 'diario', icon: 'beef' },
  { id: 'moderar', title: 'Moderar frituras, embutidos e molhos gordurosos', detail: 'Manteiga, maionese, molhos gordurosos, frituras (à milanesa, empanados, à dorê), embutidos e doces gordurosos: consuma eventualmente.', frequency: 'diario', icon: 'scale' },
  { id: 'ervas', title: 'Usar ervas e temperos naturais', detail: 'Alecrim, manjericão, hortelã, gengibre, alho, cebola, salsa, cebolinha dão cor e realçam o sabor.', frequency: 'diario', icon: 'leaf' },
  { id: 'sal', title: 'Evitar excesso de sal', detail: 'Não exagere no sal (evite usar o sal de mesa).', frequency: 'diario', icon: 'salt' },
  { id: 'testar-receitas', title: 'Testar receitas', detail: 'Teste receitas novas do seu plano.', frequency: 'semanal', icon: 'chef-hat' },
];

export const SELF_CARE = [
  { title: 'Físico', text: 'Dormir, descansar, atividade física, alimentação saudável.' },
  { title: 'Emocional', text: 'Manejo do estresse, autoperdão, autocompaixão, coragem, positividade.' },
  { title: 'Social', text: 'Pedir ajuda, dar e receber, ser ouvida, ter relações saudáveis.' },
  { title: 'Espiritual', text: 'Meditação, conexão com a natureza, silêncio, oração e estudo.' },
];

export const ORGANIZATION_TEXT =
  'Organização é tudo! Prepare suas refeições antecipadamente. Os lanches, por exemplo, você pode montar para 2 a 3 dias, dependendo do que escolher. Tente organizar um dia da sua semana para fazer os legumes e saladas da semana, higienizar as frutas, cortar as proteínas. Assim, no dia a dia, a rotina não ficará tão pesada e você conseguirá seguir seu planejamento.';

export const WEIGHT_TEXT = {
  title: 'O peso não conta toda a sua história.',
  body: [
    'Tanto a gordura quanto o músculo podem pesar a mesma coisa, mas ocupam espaços completamente diferentes no corpo.',
    'É por isso que o número na balança não mostra tudo!',
    'Não viva refém de números na balança. O mais importante para a sua saúde é a composição corporal.',
  ],
};

export const PLAN_QUOTE = 'Daqui a um ano, você desejará ter começado hoje.';

export const HEALTHY_PLATE = [
  { label: 'Vegetais', pct: 50, text: 'Crus ou cozidos — à vontade' },
  { label: 'Proteínas', pct: 25, text: 'Proteína animal ou vegetal' },
  { label: 'Carboidratos', pct: 25, text: 'Arroz, batatas, massas, raízes' },
];

export const HOUSEHOLD_MEASURES = [
  { name: 'Colher de café', size: '10 cm' },
  { name: 'Colher de chá', size: '13,2 cm' },
  { name: 'Colher de sobremesa', size: '15,3 cm' },
  { name: 'Colher de sopa', size: '19,4 cm' },
  { name: 'Colher de servir', size: '24,8 cm' },
  { name: 'Concha média', size: '—' },
  { name: 'Escumadeira média', size: '—' },
  { name: 'Xícara de chá', size: '240 ml' },
  { name: 'Xícara de café', size: '50 ml' },
  { name: 'Copo duplo', size: '300 ml' },
  { name: 'Copo americano', size: '190 ml' },
];

export interface EatingOutPlace {
  id: string;
  place: string;
  icon: string;
  prefer: string[];
  avoid: string[];
}

/** "Em caso de refeições realizadas fora de casa" — PDF p. 11 (transcrição literal). */
export const EATING_OUT: EatingOutPlace[] = [
  {
    id: 'hotel',
    place: 'Café da manhã em hotéis e restaurantes',
    icon: 'coffee',
    prefer: ['Leite e iogurtes desnatados', 'Sucos naturais', 'Chás', 'Pães integrais', 'Frios magros', 'Ovos', 'Frutas'],
    avoid: ['Bacon', 'Tortas', 'Bolos', 'Croissants'],
  },
  {
    id: 'restaurante',
    place: 'Restaurantes',
    icon: 'utensils',
    prefer: ['Grelhados, cozidos e assados', 'Legumes cozidos', 'Vegetais', 'Purês', 'Frutas como sobremesa'],
    avoid: ['Couvert', 'Molhos gordurosos de saladas', 'Preparações na manteiga', 'Gratinados', 'Sorvete, tortas, doces, bolo, cremes etc.'],
  },
  {
    id: 'churrascaria',
    place: 'Churrascarias',
    icon: 'beef',
    prefer: ['Escolha bem a salada', 'Carnes magras (baby beef, lagarto, lombo)', 'Frango e peixe sem pele'],
    avoid: ['Petiscos à base de frituras', 'Coração', 'Linguiça', 'Cupim', 'Bisteca'],
  },
  {
    id: 'bar',
    place: 'Barzinhos e happy hour',
    icon: 'wine',
    prefer: ['Filé aperitivo', 'Canapés', 'Bruschettas com tomate fresco', 'Queijos magros (brancos)'],
    avoid: ['Batata e mandioca frita', 'Pastéis', 'Coxinhas', 'Bolinhas de queijo', 'Provolone à milanesa', 'Iscas de peixe frito'],
  },
  {
    id: 'pizzaria',
    place: 'Pizzarias',
    icon: 'pizza',
    prefer: ['Muçarela', 'Muçarela de búfala', 'Marguerita', 'Rúcula com tomate seco', 'Abobrinha', 'Atum', 'Palmito'],
    avoid: ['Pepperoni', 'Calabresa', 'Presunto Parma', 'Pizzas com muitos ingredientes'],
  },
  {
    id: 'trabalho',
    place: 'Lanches e coffee breaks durante o trabalho',
    icon: 'briefcase',
    prefer: ['Lanches naturais', 'Frutas', 'Barras de cereais', 'Biscoitos salgados integrais', 'Sucos naturais'],
    avoid: ['Sanduíches com molhos gordurosos', 'Batata frita', 'Salgadinhos em geral', 'Refrigerantes'],
  },
];

/** Itens que o plano sinalizou como ambíguos/incompletos (exibidos em "Meu plano"). */
export const PLAN_FLAGS: { where: string; text: string }[] = [
  { where: 'Café da manhã', text: 'Chia: "2 colheres de chá (20 g)" — a medida em colheres e o peso parecem não corresponder.' },
  { where: 'Café da manhã', text: 'Aipim cozido (2 colheres de sopa): sem peso em gramas.' },
  { where: 'Lanche da tarde', text: 'Bebida láctea proteica: volume não especificado (no brigadeiro fit consta 200 ml).' },
  { where: 'Lanche da tarde', text: 'Frango/atum desfiado (4 colheres de sopa) com bebida láctea: sem peso em gramas.' },
  { where: 'Jantar', text: 'Mingau proteico: ingredientes citam aveia em flocos; preparo cita farelo de aveia.' },
  { where: 'Jantar', text: 'Quibe saudável: rendimento e porção por refeição não informados.' },
  { where: 'Jantar', text: 'Pão de queijo saudável: "1 colher de requeijão" sem tipo de colher.' },
  { where: 'Tabela de frutas', text: 'Suco natural sem açúcar: "feitos com 1 porção de açúcar" — provável erro de digitação para "fruta".' },
  { where: 'Tabela de vegetais', text: '"Beterrada" interpretado como beterraba.' },
];

export const DISCLAIMER =
  'O Meu Prato é uma ferramenta de organização e acompanhamento. Não substitui a orientação da sua nutricionista.';
