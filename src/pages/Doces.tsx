import { CakeSlice, Check, Heart, Shuffle } from 'lucide-react';
import { useState } from 'react';
import { toast } from '../components/toast';
import { Button, Card, Notice, PageHeader } from '../components/ui';
import { SWEETS, sweetById } from '../data/plan/sweets';
import { todayKey } from '../lib/dates';
import { useDayLog, useStore } from '../store/useStore';
import { RecipeCard } from './MeuPlano';

export default function Doces() {
  const today = todayKey();
  const log = useDayLog(today);
  const updateDay = useStore((s) => s.updateDay);
  const [revealed, setRevealed] = useState(false);
  const [highlight, setHighlight] = useState<string | null>(null);
  const chosen = log.sweetRecipe ? sweetById(log.sweetRecipe) : undefined;

  const choose = (id: string) => {
    updateDay(today, { sweetCraving: true, sweetRecipe: id });
    toast(`Boa escolha! Aproveite o seu ${sweetById(id)?.title.toLowerCase()} com calma. 💛`);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Sem culpa, com carinho"
        title="Quando bater vontade de doce"
        subtitle="Sentir vontade de doce é natural — não é falta de disciplina. Seu plano já pensou nisso e traz receitas gostosas para esses momentos."
      />

      <section className="mb-6 overflow-hidden rounded-[2rem] bg-gradient-to-br from-blush-50 via-butter-50 to-cream p-6 text-center sm:p-10">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-blush-500 shadow-soft">
          <CakeSlice size={30} />
        </div>
        {chosen ? (
          <>
            <p className="font-display text-2xl font-semibold">Hoje você escolheu: {chosen.title}</p>
            <p className="mt-1 text-sm text-ink-soft">Registrado no seu diário. Saboreie com atenção. 🌿</p>
            <Button variant="ghost" className="mt-4" onClick={() => updateDay(today, { sweetCraving: false, sweetRecipe: undefined })}>
              Desfazer
            </Button>
          </>
        ) : (
          <>
            <p className="font-display text-2xl font-semibold">Bateu aquela vontade?</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-ink-soft">Tudo bem. Escolha uma das receitas doces do seu plano.</p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <Button size="lg" variant="butter" icon={<Heart size={18} />} onClick={() => setRevealed(true)}>
                Estou com vontade de doce
              </Button>
              {revealed && (
                <Button
                  size="lg"
                  variant="secondary"
                  icon={<Shuffle size={18} />}
                  onClick={() => setHighlight(SWEETS[Math.floor(Math.random() * SWEETS.length)].id)}
                >
                  Me surpreenda
                </Button>
              )}
            </div>
          </>
        )}
      </section>

      {(revealed || chosen) && (
        <div className="grid gap-4 md:grid-cols-2">
          {SWEETS.map((r) => (
            <div key={r.id} className={highlight === r.id ? 'rounded-[1.6rem] ring-4 ring-butter-300 transition' : ''}>
              <RecipeCard
                recipe={r}
                defaultOpen={highlight === r.id}
                key={`${r.id}-${highlight === r.id}`}
                footer={
                  <Button size="sm" variant={log.sweetRecipe === r.id ? 'soft' : 'primary'} icon={<Check size={14} />} onClick={() => choose(r.id)}>
                    {log.sweetRecipe === r.id ? 'Escolhida hoje' : 'Vou fazer esta'}
                  </Button>
                }
              />
            </div>
          ))}
        </div>
      )}

      {!revealed && !chosen && (
        <Card className="mt-2">
          <p className="text-sm text-ink-soft">
            Receitas do plano: {SWEETS.map((s) => s.title).join(' · ')}.
          </p>
        </Card>
      )}

      <Notice tone="sky" className="mt-6">
        Brownie fit: a receita rende, em média, 8 porções — o plano orienta consumir uma por dia.
      </Notice>
    </div>
  );
}
