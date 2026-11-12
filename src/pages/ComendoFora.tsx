import clsx from 'clsx';
import { Beef, Briefcase, CircleCheck, Clock, Coffee, Info, Pizza, Utensils, Wine, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { Card, Notice, PageHeader } from '../components/ui';
import { EATING_OUT } from '../data/plan/guidelines';

const ICONS: Record<string, LucideIcon> = { coffee: Coffee, utensils: Utensils, beef: Beef, wine: Wine, pizza: Pizza, briefcase: Briefcase };

export default function ComendoFora() {
  const [active, setActive] = useState(EATING_OUT[0].id);
  const place = EATING_OUT.find((p) => p.id === active)!;
  const Icon = ICONS[place.icon];

  return (
    <div>
      <PageHeader
        eyebrow="Plano p. 11"
        title="Comendo fora"
        subtitle="Orientações do seu plano para refeições fora de casa. Aproveite o momento — essas dicas só ajudam a escolher com tranquilidade."
      />

      <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
        <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0">
          {EATING_OUT.map((p) => {
            const I = ICONS[p.icon];
            return (
              <button
                key={p.id}
                onClick={() => setActive(p.id)}
                className={clsx(
                  'flex shrink-0 items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition',
                  active === p.id ? 'border-sage-500 bg-sage-50 text-sage-800' : 'border-line bg-white text-ink-soft hover:border-sage-300',
                )}
              >
                <I size={18} />
                {p.place}
              </button>
            );
          })}
        </div>

        <div className="space-y-4" key={place.id}>
          <Card className="animate-fade-up">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sage-100 text-sage-700">
                <Icon size={22} />
              </div>
              <h2 className="font-display text-2xl font-semibold">{place.place}</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl bg-olive-50 p-5">
                <p className="mb-3 flex items-center gap-2 text-sm font-bold text-olive-700">
                  <CircleCheck size={17} /> Dê preferência a
                </p>
                <ul className="space-y-2 text-sm">
                  {place.prefer.map((x) => (
                    <li key={x} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-olive-500" />
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl bg-butter-50 p-5">
                <p className="mb-3 flex items-center gap-2 text-sm font-bold text-butter-700">
                  <Clock size={17} /> Consumir eventualmente / evitar
                </p>
                <ul className="space-y-2 text-sm">
                  {place.avoid.map((x) => (
                    <li key={x} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-butter-500" />
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          <Card className="animate-fade-up">
            <p className="label">Dicas práticas de escolha (do seu plano)</p>
            <ul className="space-y-2 text-sm text-ink-soft">
              <li>• Monte o prato como em casa: pelo menos metade de vegetais, ¼ de proteína e ¼ de carboidrato.</li>
              <li>• Faça a refeição em um prato, evitando repetir. Sente-se, coma com calma e descanse os talheres entre as garfadas.</li>
              <li>• Prefira preparações grelhadas, assadas ou cozidas; retire a gordura visível da carne e a pele do frango e do peixe.</li>
              <li>• Almoço e jantar: não ingerir líquidos durante a refeição e até 30 minutos após.</li>
              <li>• Lembre-se: 1 vez por semana o plano prevê comer a sua comida preferida.</li>
            </ul>
          </Card>

          <Notice tone="sky" icon={<Info size={14} />}>
            Comeu algo diferente do planejado? Tudo bem — registre no Diário como "Comi outra coisa", sem culpa e sem compensações. A próxima refeição segue normalmente o seu plano.
          </Notice>
        </div>
      </div>
    </div>
  );
}
