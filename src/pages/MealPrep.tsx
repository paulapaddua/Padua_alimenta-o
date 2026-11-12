import clsx from 'clsx';
import { Apple, Beef, Box, CalendarRange, Check, ChefHat, Home, Leaf, Minus, Package, Plus, Snowflake, Trash2, Wheat } from 'lucide-react';
import { type ReactNode, useMemo, useState } from 'react';
import { toast } from '../components/toast';
import { Badge, Button, Card, CardTitle, EmptyState, IconButton, Notice, PageHeader, ProgressBar } from '../components/ui';
import { ORGANIZATION_TEXT } from '../data/plan/guidelines';
import type { MealSlot, ShoppingCategory } from '../data/types';
import { addDays, formatShort, rangeDays, todayKey, weekdayShort } from '../lib/dates';
import { SLOTS, SLOT_LABEL, resolveSelection } from '../lib/menu';
import { buildShoppingList, formatLineAmounts } from '../lib/shopping';
import { useStore } from '../store/useStore';

interface Task {
  id: string;
  title: string;
  detail?: string;
}

const PREP_GROUPS: { cat: ShoppingCategory; title: string; verb: string; icon: ReactNode }[] = [
  { cat: 'proteinas', title: 'Separação das proteínas', verb: 'Cortar, temperar e porcionar', icon: <Beef size={18} /> },
  { cat: 'graos', title: 'Grãos e carboidratos', verb: 'Cozinhar e porcionar', icon: <Wheat size={18} /> },
  { cat: 'verduras', title: 'Legumes e verduras', verb: 'Higienizar, cortar e armazenar', icon: <Leaf size={18} /> },
  { cat: 'frutas', title: 'Frutas', verb: 'Higienizar e armazenar', icon: <Apple size={18} /> },
];

export default function MealPrep() {
  const [start, setStart] = useState(todayKey());
  const plans = useStore((s) => s.plans);
  const ensureRange = useStore((s) => s.ensureRange);
  const done = useStore((s) => s.mealPrep[start]) ?? [];
  const toggleTask = useStore((s) => s.toggleMealPrepTask);
  const pantry = useStore((s) => s.settings.pantry);
  const togglePantry = useStore((s) => s.togglePantry);
  const days = rangeDays(start, 7);
  const planned = days.filter((d) => plans[d]);

  const { byCat, snacks, recipes, lines } = useMemo(() => {
    const sels = planned.flatMap((d) => SLOTS.map((s) => ({ d, s, sel: plans[d].meals[s] })));
    const list = buildShoppingList(sels.map((x) => ({ selection: x.sel, label: `${weekdayShort(x.d)} · ${SLOT_LABEL[x.s]}` })));
    const byCat = Object.fromEntries(PREP_GROUPS.map((g) => [g.cat, list.filter((l) => l.category === g.cat)])) as Record<ShoppingCategory, typeof list>;
    const snackCount = new Map<string, { title: string; days: string[] }>();
    const recipeCount = new Map<string, { title: string; days: string[] }>();
    sels.forEach(({ d, s, sel }) => {
      const r = resolveSelection(sel);
      if (!r) return;
      const target = s === ('lanche' as MealSlot) && r.tags.includes('antecipado') ? snackCount : r.option.kind === 'receita' && r.tags.includes('antecipado') ? recipeCount : null;
      if (!target) return;
      const item = target.get(r.option.id) ?? { title: r.option.title, days: [] };
      item.days.push(weekdayShort(d));
      target.set(r.option.id, item);
    });
    return { byCat, snacks: [...snackCount.entries()], recipes: [...recipeCount.entries()], lines: list };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plans, planned.join()]);

  const generalTasks: Task[] = [
    { id: 'geral-dia', title: 'Escolher um dia da semana para a preparação (ex.: domingo)' },
    { id: 'geral-legumes', title: 'Fazer os legumes e saladas da semana' },
    { id: 'geral-frutas', title: 'Higienizar as frutas' },
    { id: 'geral-proteinas', title: 'Cortar as proteínas' },
    { id: 'geral-lanches', title: 'Montar os lanches para 2 a 3 dias' },
  ];

  const allTaskIds = [
    ...generalTasks.map((t) => t.id),
    ...PREP_GROUPS.flatMap((g) => byCat[g.cat]?.map((l) => `${g.cat}:${l.key}`) ?? []),
    ...snacks.map(([id]) => `lanche:${id}`),
    ...recipes.map(([id]) => `receita:${id}`),
  ];
  const doneCount = allTaskIds.filter((id) => done.includes(id)).length;

  return (
    <div>
      <PageHeader
        eyebrow="Organização é tudo!"
        title="Meal Prep"
        subtitle="Sua lista de preparações da semana, montada a partir do cardápio planejado."
        action={
          planned.length < 7 ? (
            <Button icon={<CalendarRange size={16} />} onClick={() => ensureRange(start, 7)}>
              Planejar os 7 dias
            </Button>
          ) : undefined
        }
      />

      <Notice tone="sage" className="mb-5" icon={<ChefHat size={14} />}>
        <em>"{ORGANIZATION_TEXT}"</em> — orientação do seu plano.
      </Notice>

      <div className="card mb-5 flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => setStart(addDays(start, -7))}>
            ←
          </Button>
          <p className="text-sm font-semibold">
            {formatShort(days[0])} a {formatShort(days[6])} · {planned.length}/7 dias planejados
          </p>
          <Button size="sm" variant="ghost" onClick={() => setStart(addDays(start, 7))}>
            →
          </Button>
        </div>
        <div className="w-full sm:w-56">
          <div className="mb-1 flex justify-between text-xs">
            <span className="text-muted">Preparações feitas</span>
            <span className="font-semibold">
              {doneCount}/{allTaskIds.length}
            </span>
          </div>
          <ProgressBar value={allTaskIds.length ? doneCount / allTaskIds.length : 0} tone="olive" label="Preparações feitas" />
        </div>
      </div>

      {planned.length === 0 ? (
        <Card>
          <EmptyState
            icon={<ChefHat size={28} />}
            title="Nenhum cardápio para este período"
            text="Planeje os próximos 7 dias para receber a lista de preparações automaticamente."
            action={<Button onClick={() => ensureRange(start, 7)}>Planejar agora</Button>}
          />
        </Card>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          <TaskCard title="Lista para o dia de preparação" icon={<CalendarRange size={18} />} tasks={generalTasks} done={done} onToggle={(id) => toggleTask(start, id)} />

          {PREP_GROUPS.map((g) => {
            const items = byCat[g.cat] ?? [];
            if (!items.length) return null;
            return (
              <TaskCard
                key={g.cat}
                title={g.title}
                subtitle={g.verb}
                icon={g.icon}
                done={done}
                onToggle={(id) => toggleTask(start, id)}
                tasks={items.map((l) => ({ id: `${g.cat}:${l.key}`, title: l.name, detail: `${formatLineAmounts(l)} · ${l.uses} uso(s) na semana` }))}
                pantry={pantry}
                onPantry={togglePantry}
                keyOf={(id) => id.split(':')[1]}
              />
            );
          })}

          <TaskCard
            title="Lanches para 2 a 3 dias"
            subtitle="Lanches do seu cardápio que podem ser preparados com antecedência"
            icon={<Box size={18} />}
            done={done}
            onToggle={(id) => toggleTask(start, id)}
            tasks={snacks.map(([id, s]) => ({ id: `lanche:${id}`, title: s.title, detail: `Planejado para: ${s.days.join(', ')}` }))}
            empty="Nenhum lanche de preparo antecipado no cardápio desta semana."
          />
          <TaskCard
            title="Receitas para adiantar"
            icon={<ChefHat size={18} />}
            done={done}
            onToggle={(id) => toggleTask(start, id)}
            tasks={recipes.map(([id, s]) => ({ id: `receita:${id}`, title: s.title, detail: `Planejado para: ${s.days.join(', ')}` }))}
            empty="Nenhuma receita de preparo antecipado no cardápio desta semana."
          />
        </div>
      )}

      <PreparedControl />

      {lines.length > 0 && (
        <Card className="mt-5">
          <CardTitle icon={<Package size={18} />} title="Geladeira e despensa" subtitle="Marque o que você já tem em casa (sincronizado com a lista de compras)." />
          <div className="flex flex-wrap gap-1.5">
            {lines.map((l) => (
              <button
                key={l.key}
                onClick={() => togglePantry(l.key)}
                className={clsx(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                  pantry.includes(l.key) ? 'border-sage-500 bg-sage-100 text-sage-800' : 'border-line bg-white text-ink-soft',
                )}
              >
                {pantry.includes(l.key) ? <Check size={12} /> : <Home size={12} />}
                {l.name}
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function TaskCard({
  title,
  subtitle,
  icon,
  tasks,
  done,
  onToggle,
  empty,
  pantry,
  onPantry,
  keyOf,
}: {
  title: string;
  subtitle?: string;
  icon: ReactNode;
  tasks: Task[];
  done: string[];
  onToggle: (id: string) => void;
  empty?: string;
  pantry?: string[];
  onPantry?: (key: string) => void;
  keyOf?: (id: string) => string;
}) {
  return (
    <Card>
      <CardTitle icon={icon} title={title} subtitle={subtitle} />
      {tasks.length === 0 ? (
        <p className="text-sm text-muted">{empty}</p>
      ) : (
        <ul className="space-y-1">
          {tasks.map((t) => {
            const isDone = done.includes(t.id);
            const pkey = keyOf?.(t.id);
            return (
              <li key={t.id} className="flex items-center gap-3 rounded-2xl px-2 py-2 hover:bg-sage-50/60">
                <button
                  type="button"
                  onClick={() => onToggle(t.id)}
                  aria-label={isDone ? `Desmarcar ${t.title}` : `Concluir ${t.title}`}
                  className={clsx(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition active:scale-90',
                    isDone ? 'border-olive-500 bg-olive-500 text-white' : 'border-line',
                  )}
                >
                  {isDone && <Check size={13} strokeWidth={3} className="animate-pop" />}
                </button>
                <div className="min-w-0 flex-1">
                  <p className={clsx('text-sm font-medium', isDone && 'text-muted line-through')}>{t.title}</p>
                  {t.detail && <p className="text-xs text-muted">{t.detail}</p>}
                </div>
                {pkey && onPantry && (
                  <IconButton label={pantry?.includes(pkey) ? 'Não tenho em casa' : 'Tenho em casa'} active={pantry?.includes(pkey)} onClick={() => onPantry(pkey)}>
                    <Home size={14} />
                  </IconButton>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

function PreparedControl() {
  const prepared = useStore((s) => s.prepared);
  const addPrepared = useStore((s) => s.addPrepared);
  const updatePrepared = useStore((s) => s.updatePrepared);
  const removePrepared = useStore((s) => s.removePrepared);
  const [label, setLabel] = useState('');
  const [portions, setPortions] = useState('4');
  const [storage, setStorage] = useState<'geladeira' | 'freezer'>('geladeira');
  const [error, setError] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = Number(portions);
    if (label.trim().length < 2) return setError('Descreva o que você preparou.');
    if (!Number.isInteger(n) || n < 1 || n > 50) return setError('Informe um número de porções entre 1 e 50.');
    addPrepared({ label: label.trim(), portions: n, storage, date: todayKey() });
    setLabel('');
    setError('');
    toast('Preparação registrada! 🍱');
  };

  return (
    <Card className="mt-5">
      <CardTitle icon={<Box size={18} />} title="Controle de refeições preparadas" subtitle="Acompanhe as porções prontas na geladeira e no freezer." />
      <form onSubmit={submit} className="mb-4 grid gap-2 sm:grid-cols-[1fr_7rem_9rem_auto]">
        <input className="input" placeholder="Ex.: frango grelhado porcionado" value={label} onChange={(e) => setLabel(e.target.value)} aria-label="O que foi preparado" />
        <input className="input" inputMode="numeric" value={portions} onChange={(e) => setPortions(e.target.value)} aria-label="Porções" placeholder="Porções" />
        <select className="input" value={storage} onChange={(e) => setStorage(e.target.value as 'geladeira' | 'freezer')} aria-label="Armazenamento">
          <option value="geladeira">Geladeira</option>
          <option value="freezer">Freezer</option>
        </select>
        <Button type="submit" icon={<Plus size={15} />}>
          Adicionar
        </Button>
      </form>
      {error && <p className="-mt-2 mb-3 text-xs text-blush-700">{error}</p>}
      {prepared.length === 0 ? (
        <p className="text-sm text-muted">Nada registrado ainda. Depois do seu dia de preparo, anote aqui o que ficou pronto.</p>
      ) : (
        <ul className="divide-y divide-line/60">
          {prepared.map((p) => {
            const left = p.portions - p.consumed;
            return (
              <li key={p.id} className="flex items-center gap-3 py-3">
                <div className={clsx('flex h-9 w-9 items-center justify-center rounded-xl', p.storage === 'freezer' ? 'bg-sky-100 text-sky-700' : 'bg-sage-100 text-sage-700')}>
                  {p.storage === 'freezer' ? <Snowflake size={16} /> : <Box size={16} />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={clsx('text-sm font-semibold', left === 0 && 'text-muted line-through')}>{p.label}</p>
                  <p className="text-xs text-muted">
                    Preparado em {formatShort(p.date)} · <Badge tone={left ? 'olive' : 'neutral'}>{left} de {p.portions} porções restantes</Badge>
                  </p>
                </div>
                <IconButton label="Consumi uma porção" disabled={left === 0} onClick={() => updatePrepared(p.id, { consumed: p.consumed + 1 })}>
                  <Minus size={15} />
                </IconButton>
                <IconButton label="Devolver uma porção" disabled={p.consumed === 0} onClick={() => updatePrepared(p.id, { consumed: p.consumed - 1 })}>
                  <Plus size={15} />
                </IconButton>
                <IconButton label="Excluir" onClick={() => removePrepared(p.id)}>
                  <Trash2 size={15} />
                </IconButton>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
