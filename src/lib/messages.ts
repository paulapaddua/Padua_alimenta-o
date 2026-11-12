import { dayOfYear } from './dates';

/** Mensagens motivacionais — acolhedoras, sem cobrança. A primeira é a frase final do plano. */
export const DAILY_MESSAGES = [
  'Daqui a um ano, você desejará ter começado hoje.',
  'Pequenas escolhas, todos os dias.',
  'Seu progresso também está nas pequenas escolhas que você faz todos os dias.',
  'Cuidar de você é um ato de carinho, não de cobrança.',
  'Um dia de cada vez. Uma refeição de cada vez.',
  'Comer com calma também é autocuidado.',
  'Organização é tudo — e você já está se organizando.',
  'Não existe dia perfeito. Existe o dia possível, e ele já vale muito.',
  'Seja gentil com você hoje.',
  'Consistência é mais importante que perfeição.',
  'Beber água também é cuidar de você. 💧',
  'Sente-se à mesa, respire e aproveite a sua refeição.',
  'Você não precisa fazer tudo hoje. Só o próximo passo.',
  'Testar uma receita nova pode deixar o dia mais gostoso.',
  'O número na balança não conta toda a sua história.',
];

export function messageOfDay(key: string): string {
  return DAILY_MESSAGES[dayOfYear(key) % DAILY_MESSAGES.length];
}

export const MEAL_DONE_MESSAGES = [
  'Refeição registrada! 🌿',
  'Que bom! Mais uma escolha cuidadosa.',
  'Anotado! Você está cuidando de você.',
  'Registrado com carinho. ✨',
];

export const SKIP_MESSAGE = 'Tudo bem! Anotado sem julgamentos. A próxima refeição é uma nova oportunidade.';
