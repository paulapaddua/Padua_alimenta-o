import { Activity, BarChart3, Droplets, Heart, ListChecks, Ruler, Table2, Trash2, UtensilsCrossed } from 'lucide-react';
import { type ReactNode, useMemo, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { SlotIcon } from '../components/meal';
import { toast } from '../components/toast';
import { Button, Card, CardTitle, Chip, EmptyState, IconButton, Notice, PageHeader, Segmented } from '../components/ui';
import { WEIGHT_TEXT } from '../data/plan/guidelines';
import { addDays, formatShort, rangeDays, todayKey } from '../lib/dates';
import { SLOTS, SLOT_LABEL } from '../lib/menu';
import { dayStats } from '../lib/stats';
import { useStore } from '../store/useStore';

const AXIS = { fontSize: 11, fill: 'var(--color-muted)' };
const GRID = 'var(--color-line)';

function ChartTooltip({ active, payload, label, unit }: { active?: boolean; payload?: { value: number }[]; label?: string; unit: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-line bg-white px-3 py-2 text-xs shadow-soft">
      <p className="font-semibold text-ink">{label}</p>
      <p className="text-ink-soft">
        {payload[0].value.toLocaleString('pt-BR')} {unit}
      </p>
    </div>
  );
}

export default function Progresso() {
  const [range, setRange] = useState<'7' | '30'>('7');
  const [table, setTable] = useState(false);
  const logs = useStore((s) => s.logs);
  const goal = useStore((s) => s.settings.waterGoal);
  const days = rangeDays(addDays(todayKey(), -(Number(range) - 1)), Number(range));

  const data = useMemo(
    () =>
      days.map((d) => {
        const st = dayStats(logs[d], goal);
        return {
          d,
          label: formatShort(d),
          adesao: st.hasData ? st.adherence : 0,
          agua: st.waterMl / 1000,
          refeicoes: st.mealsDone,
          habitos: st.habitsDone,
          atividade: logs[d]?.activity?.done ? (logs[d]?.activity?.minutes ?? 0) : 0,
          atividadeFeita: !!logs[d]?.activity?.done,
          hasData: st.hasData,
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [logs, goal, range],
  );

  const withData = data.filter((x) => x.hasData);
  const avg = (k: 'adesao' | 'agua' | 'refeicoes' | 'habitos') => (withData.length ? withData.reduce((a, x) => a + x[k], 0) / withData.length : 0);
  const activityCount = data.filter((x) => x.atividadeFeita).length;
  const slotFreq = SLOTS.map((s) => ({
    slot: s,
    pct: withData.length ? Math.round((withData.filter((x) => logs[x.d]?.meals[s]?.status === 'concluida').length / withData.length) * 100) : 0,
  }));

  return (
    <div>
      <PageHeader
        eyebrow="Acompanhamento"
        title="Progresso"
        subtitle="Seu progresso também está nas pequenas escolhas que você faz todos os dias."
        action={
          <>
            <Segmented
              value={range}
              onChange={setRange}
              options={[
                { value: '7', label: 'Semana' },
                { value: '30', label: '30 dias' },
              ]}
            />
            <Chip active={table} onClick={() => setTable((t) => !t)} icon={<Table2 size={13} />}>
              Ver como tabela
            </Chip>
          </>
        }
      />

      {withData.length === 0 ? (
        <Card className="mb-6">
          <EmptyState
            icon={<BarChart3 size={28} />}
            title="Seus gráficos aparecem aqui"
            text="Registre refeições, água e hábitos e, em poucos dias, você verá a sua evolução — sempre com carinho."
          />
        </Card>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
            <Stat label="Adesão média" value={`${Math.round(avg('adesao'))}%`} />
            <Stat label="Refeições/dia" value={avg('refeicoes').toLocaleString('pt-BR', { maximumFractionDigits: 1 })} />
            <Stat label="Água/dia" value={`${avg('agua').toLocaleString('pt-BR', { maximumFractionDigits: 1 })} L`} />
            <Stat label="Hábitos/dia" value={avg('habitos').toLocaleString('pt-BR', { maximumFractionDigits: 1 })} />
            <Stat label="Dias com atividade" value={`${activityCount}`} />
          </div>

          {table ? (
            <Card className="mb-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs text-muted">
                    <th className="py-2 pr-3">Dia</th>
                    <th className="py-2 pr-3">Adesão</th>
                    <th className="py-2 pr-3">Refeições</th>
                    <th className="py-2 pr-3">Água</th>
                    <th className="py-2 pr-3">Hábitos</th>
                    <th className="py-2">Atividade</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((x) => (
                    <tr key={x.d} className="border-b border-line/60">
                      <td className="py-2 pr-3 font-medium">{x.label}</td>
                      <td className="py-2 pr-3">{x.hasData ? `${x.adesao}%` : '—'}</td>
                      <td className="py-2 pr-3">{x.refeicoes}/4</td>
                      <td className="py-2 pr-3">{x.agua.toLocaleString('pt-BR')} L</td>
                      <td className="py-2 pr-3">{x.habitos}</td>
                      <td className="py-2">{x.atividadeFeita ? `Sim${x.atividade ? ` (${x.atividade} min)` : ''}` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          ) : (
            <div className="mb-6 grid gap-5 lg:grid-cols-2">
              <ChartCard icon={<Heart size={18} />} title="Adesão ao planejamento" subtitle="Média de refeições, água e hábitos de cada dia (%)">
                <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="g-adesao" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-sage-500)" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="var(--color-sage-500)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke={GRID} />
                  <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis domain={[0, 100]} tick={AXIS} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltip unit="%" />} cursor={{ stroke: 'var(--color-sage-300)' }} />
                  <Area type="monotone" dataKey="adesao" stroke="var(--color-sage-600)" strokeWidth={2} fill="url(#g-adesao)" dot={{ r: 3, fill: 'var(--color-sage-600)', strokeWidth: 0 }} activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }} />
                </AreaChart>
              </ChartCard>

              <ChartCard icon={<Droplets size={18} />} title="Consumo diário de água" subtitle={`Litros por dia · linha = sua meta (${(goal / 1000).toLocaleString('pt-BR')} L)`}>
                <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke={GRID} />
                  <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis tick={AXIS} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltip unit="L" />} cursor={{ fill: 'var(--color-sky-50)' }} />
                  <ReferenceLine y={goal / 1000} stroke="var(--color-sky-700)" strokeDasharray="4 4" />
                  <Bar dataKey="agua" fill="var(--color-sky-500)" radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ChartCard>

              <ChartCard icon={<UtensilsCrossed size={18} />} title="Refeições registradas" subtitle="Quantidade de refeições concluídas por dia (de 4)">
                <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke={GRID} />
                  <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis domain={[0, 4]} allowDecimals={false} tick={AXIS} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltip unit="refeições" />} cursor={{ fill: 'var(--color-olive-50)' }} />
                  <Bar dataKey="refeicoes" fill="var(--color-olive-500)" radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ChartCard>

              <ChartCard icon={<ListChecks size={18} />} title="Hábitos realizados" subtitle="Hábitos diários marcados por dia">
                <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke={GRID} />
                  <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis allowDecimals={false} tick={AXIS} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltip unit="hábitos" />} cursor={{ fill: 'var(--color-butter-50)' }} />
                  <Bar dataKey="habitos" fill="var(--color-butter-500)" radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ChartCard>

              <ChartCard icon={<Activity size={18} />} title="Atividade física" subtitle="Minutos registrados por dia · meta do plano: 40 min, 3 a 5x/semana">
                <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke={GRID} />
                  <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis allowDecimals={false} tick={AXIS} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltip unit="min" />} cursor={{ fill: 'var(--color-sage-50)' }} />
                  <ReferenceLine y={40} stroke="var(--color-sage-700)" strokeDasharray="4 4" />
                  <Bar dataKey="atividade" fill="var(--color-sage-500)" radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ChartCard>

              <Card>
                <CardTitle icon={<UtensilsCrossed size={18} />} title="Frequência por refeição" subtitle="% dos dias registrados em que cada refeição foi concluída" />
                <ul className="space-y-3">
                  {slotFreq.map((f) => (
                    <li key={f.slot} className="flex items-center gap-3">
                      <SlotIcon slot={f.slot} className="h-8 w-8" size={15} />
                      <span className="w-32 text-sm">{SLOT_LABEL[f.slot]}</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-cream-2">
                        <div className="h-full rounded-full bg-sage-500" style={{ width: `${f.pct}%` }} />
                      </div>
                      <span className="w-10 text-right text-sm font-semibold">{f.pct}%</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          )}
        </>
      )}

      <BodySection />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <p className="font-display text-2xl font-semibold">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}

function ChartCard({ icon, title, subtitle, children }: { icon: ReactNode; title: string; subtitle: string; children: React.ReactElement }) {
  return (
    <Card>
      <CardTitle icon={icon} title={title} subtitle={subtitle} />
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

const FIELDS = [
  { key: 'weight', label: 'Peso (kg)', min: 20, max: 400 },
  { key: 'waist', label: 'Cintura (cm)', min: 30, max: 250 },
  { key: 'hip', label: 'Quadril (cm)', min: 30, max: 250 },
  { key: 'arm', label: 'Braço (cm)', min: 10, max: 100 },
  { key: 'thigh', label: 'Coxa (cm)', min: 20, max: 150 },
] as const;

function BodySection() {
  const body = useStore((s) => s.body);
  const addBody = useStore((s) => s.addBody);
  const removeBody = useStore((s) => s.removeBody);
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(todayKey());
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: Record<string, number> = {};
    for (const f of FIELDS) {
      const raw = values[f.key]?.replace(',', '.').trim();
      if (!raw) continue;
      const n = Number(raw);
      if (!Number.isFinite(n) || n < f.min || n > f.max) return setError(`${f.label}: informe um valor entre ${f.min} e ${f.max}.`);
      entry[f.key] = n;
    }
    if (!Object.keys(entry).length) return setError('Preencha pelo menos uma medida.');
    if (!date || date > todayKey()) return setError('Escolha uma data válida (até hoje).');
    addBody({ date, ...entry });
    setValues({});
    setError('');
    setOpen(false);
    toast('Medidas registradas');
  };

  const weightData = body.filter((b) => b.weight).map((b) => ({ label: formatShort(b.date), peso: b.weight! }));

  return (
    <Card>
      <CardTitle
        icon={<Ruler size={18} />}
        title="Peso e medidas (opcional)"
        subtitle="Registre apenas se quiser. O app não define metas de peso."
        action={
          <Button size="sm" variant="soft" onClick={() => setOpen((o) => !o)}>
            {open ? 'Cancelar' : 'Registrar medidas'}
          </Button>
        }
      />
      <Notice tone="sage" className="mb-4" icon={<Heart size={14} />}>
        <strong>{WEIGHT_TEXT.title}</strong> {WEIGHT_TEXT.body.join(' ')}
      </Notice>

      {open && (
        <form onSubmit={submit} className="mb-5 rounded-2xl bg-cream-2/50 p-4 animate-fade-up">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div>
              <label className="label" htmlFor="body-date">
                Data
              </label>
              <input id="body-date" type="date" className="input" value={date} max={todayKey()} onChange={(e) => setDate(e.target.value)} />
            </div>
            {FIELDS.map((f) => (
              <div key={f.key}>
                <label className="label" htmlFor={`body-${f.key}`}>
                  {f.label}
                </label>
                <input
                  id={`body-${f.key}`}
                  className="input"
                  inputMode="decimal"
                  value={values[f.key] ?? ''}
                  onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                />
              </div>
            ))}
          </div>
          {error && <p className="mt-2 text-xs text-blush-700">{error}</p>}
          <Button type="submit" className="mt-4">
            Salvar
          </Button>
        </form>
      )}

      {weightData.length >= 2 && (
        <div className="mb-4 h-44">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weightData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={GRID} />
              <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={false} />
              <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={AXIS} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip unit="kg" />} />
              <Line type="monotone" dataKey="peso" stroke="var(--color-sky-700)" strokeWidth={2} dot={{ r: 4, fill: 'var(--color-sky-700)', strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {body.length === 0 ? (
        <p className="text-sm text-muted">Nenhuma medida registrada. Tudo bem — o seu progresso também aparece nos hábitos e nas escolhas do dia a dia.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-muted">
                <th className="py-2 pr-3">Data</th>
                {FIELDS.map((f) => (
                  <th key={f.key} className="py-2 pr-3">
                    {f.label}
                  </th>
                ))}
                <th />
              </tr>
            </thead>
            <tbody>
              {[...body].reverse().map((b) => (
                <tr key={b.id} className="border-b border-line/60">
                  <td className="py-2 pr-3 font-medium">{formatShort(b.date)}</td>
                  {FIELDS.map((f) => (
                    <td key={f.key} className="py-2 pr-3">
                      {b[f.key]?.toLocaleString('pt-BR') ?? '—'}
                    </td>
                  ))}
                  <td>
                    <IconButton label="Excluir registro" onClick={() => removeBody(b.id)}>
                      <Trash2 size={14} />
                    </IconButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
