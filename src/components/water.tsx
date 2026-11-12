import { Droplets, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { WATER } from '../data/plan/guidelines';
import { useDayLog, useStore } from '../store/useStore';
import { toast } from './toast';
import { Button, Card, CardTitle, IconButton, ProgressBar } from './ui';

const fmtL = (ml: number) => `${(ml / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} L`;

export function WaterCard({ date, showHistory = true }: { date: string; showHistory?: boolean }) {
  const log = useDayLog(date);
  const goal = useStore((s) => s.settings.waterGoal);
  const addWater = useStore((s) => s.addWater);
  const removeWater = useStore((s) => s.removeWater);
  const [custom, setCustom] = useState('');
  const [error, setError] = useState('');
  const total = log.water.reduce((a, w) => a + w.ml, 0);
  const pct = total / goal;

  const add = (ml: number) => {
    addWater(date, ml);
    if (total < goal && total + ml >= goal) toast('Meta de água alcançada! 💧 Que cuidado bonito.');
  };

  const submitCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const ml = Number(custom.replace(',', '.'));
    if (!Number.isFinite(ml) || ml <= 0 || ml > 2000) {
      setError('Informe um valor entre 1 e 2000 ml.');
      return;
    }
    setError('');
    add(ml);
    setCustom('');
  };

  return (
    <Card>
      <CardTitle
        icon={<Droplets size={20} className="text-sky-500" />}
        title="Hidratação"
        subtitle={`Meta prescrita: ${WATER.minMl / 1000} a ${WATER.maxMl / 1000} L/dia · sua meta: ${fmtL(goal)}`}
      />
      <div className="mb-3 flex items-end justify-between">
        <p className="font-display text-3xl font-semibold text-sky-700">
          {fmtL(total)}
          <span className="ml-1 text-sm font-normal text-muted">/ {fmtL(goal)}</span>
        </p>
        <p className="text-sm font-semibold text-sky-700">{Math.min(100, Math.round(pct * 100))}%</p>
      </div>
      <ProgressBar value={pct} tone="sky" label="Progresso de hidratação" />
      <p className="mt-2 text-xs text-muted">Lembre-se: hidrate-se entre as refeições, não durante o almoço e o jantar.</p>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {[200, 300, 500].map((ml) => (
          <button
            key={ml}
            type="button"
            onClick={() => add(ml)}
            className="flex flex-col items-center gap-0.5 rounded-2xl border border-sky-100 bg-sky-50 py-2.5 text-sky-700 transition hover:bg-sky-100 active:scale-95"
          >
            <Plus size={14} />
            <span className="text-sm font-bold">{ml} ml</span>
          </button>
        ))}
      </div>
      <form onSubmit={submitCustom} className="mt-2 flex gap-2">
        <input
          className="input py-2"
          inputMode="numeric"
          placeholder="Outra quantidade (ml)"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          aria-label="Quantidade personalizada em ml"
        />
        <Button type="submit" variant="secondary" size="sm">
          Adicionar
        </Button>
      </form>
      {error && <p className="mt-1 text-xs text-blush-700">{error}</p>}

      {showHistory && log.water.length > 0 && (
        <div className="mt-4 border-t border-line/70 pt-3">
          <p className="label">Histórico de hoje</p>
          <ul className="max-h-32 space-y-1 overflow-y-auto">
            {[...log.water].reverse().map((w) => (
              <li key={w.id} className="flex items-center justify-between text-sm">
                <span className="text-ink-soft">
                  {new Date(w.ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} · <strong>{w.ml} ml</strong>
                </span>
                <IconButton label="Remover registro" className="h-7 w-7" onClick={() => removeWater(date, w.id)}>
                  <Trash2 size={14} />
                </IconButton>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
