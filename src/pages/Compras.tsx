import clsx from 'clsx';
import { Check, ChevronDown, ClipboardCopy, Home, Info, Plus, RotateCcw, ShoppingBasket, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from '../components/toast';
import { Badge, Button, Card, Chip, EmptyState, IconButton, Notice, PageHeader, ProgressBar } from '../components/ui';
import type { ShoppingCategory } from '../data/types';
import { addDays, formatShort, rangeDays, todayKey, weekdayShort } from '../lib/dates';
import { SLOTS, SLOT_LABEL } from '../lib/menu';
import { CATEGORY_LABEL, CATEGORY_ORDER, buildShoppingList, formatLineAmounts } from '../lib/shopping';
import { useStore } from '../store/useStore';

interface Row {
  key: string;
  name: string;
  category: ShoppingCategory;
  amount: string;
  manual: boolean;
  sources: string[];
  notes: string[];
}

export default function Compras() {
  const plans = useStore((s) => s.plans);
  const shopping = useStore((s) => s.shopping);
  const pantry = useStore((s) => s.settings.pantry);
  const ensureRange = useStore((s) => s.ensureRange);
  const setShoppingStart = useStore((s) => s.setShoppingStart);
  const toggleChecked = useStore((s) => s.toggleChecked);
  const removeShoppingItem = useStore((s) => s.removeShoppingItem);
  const restoreRemoved = useStore((s) => s.restoreRemoved);
  const addManualItem = useStore((s) => s.addManualItem);
  const removeManualItem = useStore((s) => s.removeManualItem);
  const clearChecked = useStore((s) => s.clearChecked);
  const togglePantry = useStore((s) => s.togglePantry);
  const [hidePantry, setHidePantry] = useState(false);

  const start = shopping.start ?? todayKey();
  const days = rangeDays(start, 7);
  const plannedDays = days.filter((d) => plans[d]);

  const rows: Row[] = useMemo(() => {
    const selections = plannedDays.flatMap((d) => SLOTS.map((s) => ({ selection: plans[d].meals[s], label: `${weekdayShort(d)} ${formatShort(d)} · ${SLOT_LABEL[s]}` })));
    const generated = buildShoppingList(selections)
      .filter((l) => !shopping.removed.includes(l.key))
      .map((l) => ({ key: l.key, name: l.name, category: l.category, amount: formatLineAmounts(l), manual: false, sources: l.sources, notes: l.notes }));
    const manual = shopping.manual.map((m) => ({ key: m.id, name: m.name, category: m.category, amount: m.amount ?? '', manual: true, sources: [], notes: [] }));
    return [...generated, ...manual];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plans, shopping.removed, shopping.manual, plannedDays.join()]);

  const visible = rows.filter((r) => !(hidePantry && pantry.includes(r.key)));
  const toBuy = rows.filter((r) => !pantry.includes(r.key));
  const bought = toBuy.filter((r) => shopping.checked.includes(r.key)).length;

  const generate = (from: string) => {
    ensureRange(from, 7);
    setShoppingStart(from);
    toast('Lista gerada a partir do cardápio dos próximos 7 dias 🛒');
  };

  const copyList = async () => {
    const text = CATEGORY_ORDER.map((c) => {
      const items = toBuy.filter((r) => r.category === c && !shopping.checked.includes(r.key));
      if (!items.length) return '';
      return `${CATEGORY_LABEL[c].toUpperCase()}\n${items.map((i) => `- ${i.name}${i.amount ? ` (${i.amount})` : ''}`).join('\n')}`;
    })
      .filter(Boolean)
      .join('\n\n');
    try {
      await navigator.clipboard.writeText(`Minha lista de compras — Meu Prato\n\n${text}`);
      toast('Lista copiada! Cole no WhatsApp ou nas notas.');
    } catch {
      toast('Não foi possível copiar automaticamente neste navegador.', { tone: 'info' });
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Gerada do seu cardápio"
        title="Minha lista de compras"
        subtitle="Quantidades somadas a partir das refeições planejadas. Itens sem quantidade definida no plano (a gosto, à vontade) aparecem sem número — nada é inventado."
        action={
          <>
            <Button icon={<ShoppingBasket size={16} />} onClick={() => generate(todayKey())}>
              Gerar para os próximos 7 dias
            </Button>
            {rows.length > 0 && (
              <Button variant="secondary" icon={<ClipboardCopy size={16} />} onClick={copyList}>
                Copiar lista
              </Button>
            )}
          </>
        }
      />

      <div className="card mb-5 flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <p className="text-sm font-semibold">
            Período: {formatShort(days[0])} a {formatShort(days[6])}
          </p>
          <p className="text-xs text-muted">
            {plannedDays.length} de 7 dias com cardápio planejado.{' '}
            {plannedDays.length < 7 && (
              <button className="font-semibold text-sage-700 underline" onClick={() => generate(start)}>
                Planejar os dias restantes
              </button>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="ghost" onClick={() => setShoppingStart(addDays(start, -7))}>
            ← Semana anterior
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setShoppingStart(addDays(start, 7))}>
            Próxima semana →
          </Button>
        </div>
      </div>

      {rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={<ShoppingBasket size={28} />}
            title="Sua lista está vazia"
            text="Gere a lista a partir do cardápio dos próximos 7 dias ou adicione produtos manualmente abaixo."
            action={<Button onClick={() => generate(todayKey())}>Gerar lista agora</Button>}
          />
          <div className="border-t border-line/70 pt-5">
            <AddItemForm existing={rows} onAdd={addManualItem} />
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
          <div className="space-y-5">
            {CATEGORY_ORDER.map((cat) => {
              const items = visible.filter((r) => r.category === cat);
              if (!items.length) return null;
              return (
                <section key={cat} className="card overflow-hidden">
                  <h2 className="flex items-center justify-between border-b border-line/70 bg-cream-2/40 px-5 py-3 text-sm font-bold">
                    {CATEGORY_LABEL[cat]}
                    <span className="text-xs font-medium text-muted">{items.length} itens</span>
                  </h2>
                  <ul className="divide-y divide-line/60">
                    {items.map((r) => (
                      <ShoppingRow
                        key={r.key}
                        row={r}
                        checked={shopping.checked.includes(r.key)}
                        inPantry={pantry.includes(r.key)}
                        onCheck={() => toggleChecked(r.key)}
                        onPantry={() => togglePantry(r.key)}
                        onRemove={() => {
                          if (r.manual) removeManualItem(r.key);
                          else removeShoppingItem(r.key);
                          toast(`${r.name} removido da lista`, { tone: 'info' });
                        }}
                      />
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <Card>
              <p className="text-sm font-semibold">Comprados</p>
              <p className="mt-1 font-display text-3xl font-semibold text-olive-600">
                {bought}
                <span className="text-base text-muted"> / {toBuy.length}</span>
              </p>
              <ProgressBar value={toBuy.length ? bought / toBuy.length : 0} tone="olive" className="mt-2" label="Itens comprados" />
              <div className="mt-4 flex flex-wrap gap-2">
                <Chip active={hidePantry} onClick={() => setHidePantry((x) => !x)} icon={<Home size={12} />}>
                  Ocultar o que tenho em casa
                </Chip>
                {shopping.checked.length > 0 && (
                  <Button size="sm" variant="ghost" onClick={clearChecked}>
                    Desmarcar todos
                  </Button>
                )}
                {shopping.removed.length > 0 && (
                  <Button size="sm" variant="ghost" icon={<RotateCcw size={13} />} onClick={restoreRemoved}>
                    Restaurar excluídos ({shopping.removed.length})
                  </Button>
                )}
              </div>
            </Card>
            <Card>
              <AddItemForm existing={rows} onAdd={addManualItem} />
            </Card>
            <Notice tone="sky" icon={<Info size={14} />}>
              Marque <Home size={11} className="inline" /> nos itens que você já tem na despensa ou geladeira. Eles também aparecem no{' '}
              <Link to="/meal-prep" className="font-semibold underline">
                Meal Prep
              </Link>
              .
            </Notice>
          </aside>
        </div>
      )}
    </div>
  );
}

function ShoppingRow({
  row,
  checked,
  inPantry,
  onCheck,
  onPantry,
  onRemove,
}: {
  row: Row;
  checked: boolean;
  inPantry: boolean;
  onCheck: () => void;
  onPantry: () => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <li className={clsx('px-5 py-3 transition', checked && 'bg-olive-50/50')}>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onCheck}
          aria-label={checked ? `Desmarcar ${row.name}` : `Marcar ${row.name} como comprado`}
          className={clsx(
            'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition active:scale-90',
            checked ? 'border-olive-500 bg-olive-500 text-white' : 'border-line hover:border-sage-400',
          )}
        >
          {checked && <Check size={14} strokeWidth={3} className="animate-pop" />}
        </button>
        <div className="min-w-0 flex-1">
          <p className={clsx('text-sm font-semibold', checked && 'text-muted line-through')}>
            {row.name} {row.manual && <Badge tone="sky">manual</Badge>} {inPantry && <Badge tone="sage">tenho em casa</Badge>}
          </p>
          {row.amount && <p className="text-xs text-muted">{row.amount}</p>}
        </div>
        <IconButton label={inPantry ? 'Não tenho em casa' : 'Tenho em casa'} active={inPantry} onClick={onPantry}>
          <Home size={15} />
        </IconButton>
        {!row.manual && (
          <IconButton label="Ver de onde vem" onClick={() => setOpen((o) => !o)}>
            <ChevronDown size={16} className={clsx('transition', open && 'rotate-180')} />
          </IconButton>
        )}
        <IconButton label={`Excluir ${row.name}`} onClick={onRemove}>
          <Trash2 size={15} />
        </IconButton>
      </div>
      {open && (
        <div className="mt-2 ml-9 space-y-1 text-xs text-muted animate-fade">
          <p>
            <strong>Usado em:</strong> {row.sources.join(' · ')}
          </p>
          {row.notes.map((n) => (
            <p key={n} className="text-butter-700">
              ⚠ {n}
            </p>
          ))}
        </div>
      )}
    </li>
  );
}

function AddItemForm({ existing, onAdd }: { existing: Row[]; onAdd: (i: { name: string; category: ShoppingCategory; amount?: string }) => void }) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ShoppingCategory>('outros');
  const [error, setError] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = name.trim();
    if (n.length < 2) return setError('Informe o nome do produto.');
    if (existing.some((r) => r.name.toLowerCase() === n.toLowerCase())) return setError('Este item já está na lista.');
    onAdd({ name: n, category, amount: amount.trim() || undefined });
    setName('');
    setAmount('');
    setError('');
    toast(`${n} adicionado à lista`);
  };

  return (
    <form onSubmit={submit} className="space-y-2.5">
      <p className="text-sm font-semibold">Adicionar produto</p>
      <input className="input" placeholder="Nome do produto" value={name} onChange={(e) => setName(e.target.value)} aria-label="Nome do produto" />
      <div className="flex gap-2">
        <input className="input" placeholder="Quantidade (opcional)" value={amount} onChange={(e) => setAmount(e.target.value)} aria-label="Quantidade" />
        <select className="input" value={category} onChange={(e) => setCategory(e.target.value as ShoppingCategory)} aria-label="Categoria">
          {CATEGORY_ORDER.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABEL[c]}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="text-xs text-blush-700">{error}</p>}
      <Button type="submit" variant="soft" size="sm" icon={<Plus size={14} />} className="w-full">
        Adicionar
      </Button>
    </form>
  );
}
