import clsx from 'clsx';
import {
  AlertTriangle,
  Apple,
  BookOpen,
  Check,
  ChefHat,
  Coffee,
  Moon,
  RefreshCw,
  Salad,
  Search,
  Shuffle,
  Sparkles,
  Star,
} from 'lucide-react';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { DENSITY_LABEL, VEGETABLES, foodById } from '../data/plan/foods';
import { OPTIONS_BY_SLOT, optionById } from '../data/plan/meals';
import type { ChoiceGroup, MealOption, MealSlot, Selection, Tag } from '../data/types';
import {
  ALL_TAGS,
  SLOT_LABEL,
  TAG_LABEL,
  alternatives,
  emptySelection,
  fruitPool,
  isValidSelection,
  resolveSelection,
  signature,
} from '../lib/menu';
import { useStore } from '../store/useStore';
import { toast } from './toast';
import { Badge, Button, Chip, EmptyState, IconButton, Modal, Notice, Segmented } from './ui';

export const SLOT_ICON: Record<MealSlot, typeof Coffee> = {
  cafe: Coffee,
  almoco: Salad,
  lanche: Apple,
  jantar: Moon,
};

export const SLOT_TONE: Record<MealSlot, string> = {
  cafe: 'bg-butter-100 text-butter-700',
  almoco: 'bg-sage-100 text-sage-700',
  lanche: 'bg-blush-50 text-blush-700',
  jantar: 'bg-sky-100 text-sky-700',
};

export function SlotIcon({ slot, size = 20, className }: { slot: MealSlot; size?: number; className?: string }) {
  const Icon = SLOT_ICON[slot];
  return (
    <div className={clsx('flex shrink-0 items-center justify-center rounded-2xl', SLOT_TONE[slot], className ?? 'h-11 w-11')}>
      <Icon size={size} />
    </div>
  );
}

export function TagList({ tags, className }: { tags: Tag[]; className?: string }) {
  if (!tags.length) return null;
  return (
    <div className={clsx('flex flex-wrap gap-1.5', className)}>
      {tags.map((t) => (
        <Badge key={t} tone={t === 'doce' ? 'blush' : t === 'rapido' ? 'butter' : t === 'levar' || t === 'antecipado' ? 'sky' : 'neutral'}>
          {TAG_LABEL[t]}
        </Badge>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Detalhe de uma refeição (quantidades exatas, preparo, avisos)
// ---------------------------------------------------------------------------

export function MealDetail({ selection, compact }: { selection: Selection; compact?: boolean }) {
  const r = resolveSelection(selection);
  if (!r) return <Notice icon={<AlertTriangle size={14} />}>Esta refeição não foi encontrada no plano.</Notice>;
  const flags = [...(r.option.flags ?? []), ...r.ingredients.filter((i) => i.flag).map((i) => i.flag!)];
  const uniqueFlags = [...new Set(flags)];
  return (
    <div className="space-y-4 text-sm">
      <ul className="space-y-2">
        {r.fixed.map((i, idx) => (
          <li key={`f${idx}`} className="flex gap-2.5">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sage-400" />
            <span>{i.text}</span>
          </li>
        ))}
        {r.lines.map((l) => (
          <li key={l.groupId} className="flex gap-2.5">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-olive-500" />
            <span>
              <span className="text-xs font-semibold text-muted">{l.groupLabel}: </span>
              {l.text}
              {l.note && !compact && <span className="block text-xs text-muted">{l.note}</span>}
            </span>
          </li>
        ))}
      </ul>

      {!compact && r.option.steps && (
        <div>
          <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold tracking-wide text-ink-soft uppercase">
            <ChefHat size={14} /> Modo de preparo
          </h4>
          <ol className="space-y-1.5">
            {r.option.steps.map((s, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sage-100 text-[11px] font-bold text-sage-700">{i + 1}</span>
                <span className="text-ink-soft">{s}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
      {!compact && r.option.kind === 'receita' && !r.option.steps && (
        <p className="text-xs text-muted italic">O plano não descreve o modo de preparo desta opção.</p>
      )}

      {!compact && r.option.notes?.map((n) => (
        <Notice key={n} tone="sky" icon={<BookOpen size={14} />}>
          {n}
        </Notice>
      ))}
      {!compact &&
        uniqueFlags.map((f) => (
          <Notice key={f} icon={<AlertTriangle size={14} />}>
            <strong>Ponto a confirmar no plano:</strong> {f}
          </Notice>
        ))}
      {!compact && (
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="sage">Prescrito · {r.option.source}</Badge>
          <TagList tags={r.tags} />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Montagem manual
// ---------------------------------------------------------------------------

function GroupEditor({ group, value, onChange }: { group: ChoiceGroup; value: string | string[] | undefined; onChange: (v: string | string[]) => void }) {
  const dislikes = useStore((s) => s.settings.dislikes);
  const [q, setQ] = useState('');

  if (group.vegetableSource) {
    const selected = Array.isArray(value) ? value : [];
    const list = VEGETABLES.filter((v) => v.name.toLowerCase().includes(q.toLowerCase()));
    return (
      <div>
        <div className="relative mb-2">
          <Search size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-muted" />
          <input className="input py-2 pl-8 text-xs" placeholder="Buscar vegetal..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="flex max-h-40 flex-wrap gap-1.5 overflow-y-auto">
          {list.map((v) => (
            <Chip
              key={v.id}
              active={selected.includes(v.id)}
              onClick={() => onChange(selected.includes(v.id) ? selected.filter((x) => x !== v.id) : [...selected, v.id])}
              className={clsx(dislikes.includes(v.id) && 'opacity-50')}
            >
              {v.name}
            </Chip>
          ))}
        </div>
      </div>
    );
  }

  if (group.fruitSource) {
    const pool = fruitPool(group);
    const groups = (['muito-baixa', 'baixa', 'media-alta'] as const).map((d) => ({ d, items: pool.filter((f) => f.density === d) }));
    return (
      <select className="input" value={typeof value === 'string' ? value : ''} onChange={(e) => onChange(e.target.value)}>
        {groups
          .filter((g) => g.items.length)
          .map((g) => (
            <optgroup key={g.d} label={DENSITY_LABEL[g.d]}>
              {g.items.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} – {f.portion}
                  {dislikes.includes(f.id) ? ' (não gosto)' : ''}
                </option>
              ))}
            </optgroup>
          ))}
      </select>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      {group.optional && (
        <RadioRow active={value === '' || value === undefined} onClick={() => onChange('')}>
          Nenhuma
        </RadioRow>
      )}
      {group.choices?.map((c) => (
        <RadioRow key={c.id} active={value === c.id} onClick={() => onChange(c.id)} muted={c.ingredients.some((i) => dislikes.includes(i.key))}>
          {c.label}
          {group.portion && !c.label.includes('(') && <span className="text-muted"> – {group.portion.text}</span>}
        </RadioRow>
      ))}
    </div>
  );
}

function RadioRow({ active, onClick, children, muted }: { active: boolean; onClick: () => void; children: ReactNode; muted?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={clsx(
        'flex items-center gap-3 rounded-2xl border px-3.5 py-2.5 text-left text-sm transition',
        active ? 'border-sage-500 bg-sage-50' : 'border-line bg-white hover:border-sage-300',
        muted && 'opacity-60',
      )}
    >
      <span className={clsx('flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border-2', active ? 'border-sage-600 bg-sage-600' : 'border-line')}>
        {active && <Check size={11} className="text-white" strokeWidth={3} />}
      </span>
      <span>{children}</span>
    </button>
  );
}

export function MealBuilder({ slot, value, onChange }: { slot: MealSlot; value: Selection; onChange: (s: Selection) => void }) {
  const options = OPTIONS_BY_SLOT[slot];
  const option = optionById(value.optionId) ?? options[0];
  const sections =
    slot === 'jantar'
      ? [
          { title: 'Prato padrão', items: options.filter((o) => o.variant === 'padrao') },
          { title: 'Hoje quero algo diferente', items: options.filter((o) => o.variant === 'diferente') },
        ]
      : [{ title: 'Opções do plano', items: options }];

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        {sections.map((sec) => (
          <div key={sec.title}>
            <p className="label">{sec.title}</p>
            <div className="flex flex-wrap gap-1.5">
              {sec.items.map((o) => (
                <Chip key={o.id} active={o.id === option.id} onClick={() => onChange(emptySelection(o))}>
                  {o.title}
                </Chip>
              ))}
            </div>
          </div>
        ))}
      </div>

      {option.fixed.length > 0 && (
        <div className="rounded-2xl bg-cream-2/60 p-4">
          <p className="label">Ingredientes fixos (prescritos)</p>
          <ul className="space-y-1 text-sm">
            {option.fixed.map((i, idx) => (
              <li key={idx}>• {i.text}</li>
            ))}
          </ul>
        </div>
      )}

      {option.groups.map((g) => (
        <div key={g.id}>
          <p className="label">{g.label}</p>
          {g.note && <p className="-mt-1 mb-2 text-xs text-muted">{g.note}</p>}
          <GroupEditor group={g} value={value.choices[g.id]} onChange={(v) => onChange({ ...value, choices: { ...value.choices, [g.id]: v } })} />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cartão de sugestão
// ---------------------------------------------------------------------------

export function FavoriteButton({ slot, selection }: { slot: MealSlot; selection: Selection }) {
  const fav = useStore((s) => s.favorites.some((f) => signature(f.selection) === signature(selection)));
  const toggleFavorite = useStore((s) => s.toggleFavorite);
  return (
    <IconButton
      label={fav ? 'Remover dos favoritos' : 'Favoritar refeição'}
      active={fav}
      onClick={(e) => {
        e.stopPropagation();
        toggleFavorite(slot, selection);
        toast(fav ? 'Removida dos favoritos' : 'Adicionada aos favoritos ⭐');
      }}
    >
      <Star size={17} fill={fav ? 'currentColor' : 'none'} />
    </IconButton>
  );
}

export function SuggestionCard({ slot, selection, onChoose, chooseLabel = 'Escolher' }: { slot: MealSlot; selection: Selection; onChoose: () => void; chooseLabel?: string }) {
  const [open, setOpen] = useState(false);
  const r = resolveSelection(selection);
  if (!r) return null;
  return (
    <div className="rounded-3xl border border-line bg-white p-4 transition hover:border-sage-300 animate-fade-up">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold leading-snug">{r.option.kind === 'prato' ? r.option.title : r.title}</p>
          <p className="mt-0.5 text-xs text-muted">{r.option.kind === 'prato' ? r.summary : r.summary !== r.title ? r.summary : SLOT_LABEL[slot]}</p>
          <TagList tags={r.tags} className="mt-2" />
        </div>
        <FavoriteButton slot={slot} selection={selection} />
      </div>
      {open && (
        <div className="mt-4 border-t border-line/70 pt-4">
          <MealDetail selection={selection} />
        </div>
      )}
      <div className="mt-3 flex gap-2">
        <Button size="sm" onClick={onChoose} icon={<Check size={14} />}>
          {chooseLabel}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen((o) => !o)}>
          {open ? 'Ocultar detalhes' : 'Ver quantidades'}
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Seletor: sugestões / montar / favoritas
// ---------------------------------------------------------------------------

type PickerTab = 'sugestoes' | 'montar' | 'favoritas';

export function MealPicker({
  open,
  onClose,
  slot,
  current,
  onSelect,
  initialTab = 'sugestoes',
  title,
}: {
  open: boolean;
  onClose: () => void;
  slot: MealSlot;
  current?: Selection;
  onSelect: (sel: Selection, manual: boolean) => void;
  initialTab?: PickerTab;
  title?: string;
}) {
  const [tab, setTab] = useState<PickerTab>(initialTab);
  const [filters, setFilters] = useState<Tag[]>([]);
  const [variant, setVariant] = useState<'todas' | 'diferente'>('todas');
  const [seed, setSeed] = useState(0);
  const settings = useStore((s) => s.settings);
  const favorites = useStore((s) => s.favorites).filter((f) => f.slot === slot && isValidSelection(f.selection));
  const [draft, setDraft] = useState<Selection>(() => current ?? emptySelection(OPTIONS_BY_SLOT[slot][0]));

  useEffect(() => {
    if (open) {
      setTab(initialTab);
      setDraft(current ?? emptySelection(OPTIONS_BY_SLOT[slot][0]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const suggestions = useMemo(
    () =>
      open
        ? alternatives(slot, current, 4, {
            dislikes: settings.dislikes,
            prefer: settings.prefer,
            filters,
            variant: slot === 'jantar' && variant === 'diferente' ? 'diferente' : undefined,
          })
        : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open, slot, filters, variant, seed, current && signature(current), settings.dislikes, settings.prefer],
  );

  const choose = (sel: Selection, manual: boolean) => {
    onSelect(sel, manual);
    onClose();
  };

  const toggleFilter = (t: Tag) => setFilters((f) => (f.includes(t) ? f.filter((x) => x !== t) : [...f, t]));
  const draftValid = isValidSelection(draft);

  return (
    <Modal
      open={open}
      onClose={onClose}
      wide
      title={title ?? SLOT_LABEL[slot]}
      subtitle="Todas as opções vêm do seu plano alimentar, com as quantidades prescritas."
      footer={
        tab === 'montar' ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-muted">{draftValid ? 'Tudo certo — combinação prevista no plano.' : 'Complete as escolhas obrigatórias.'}</p>
            <Button disabled={!draftValid} onClick={() => choose(draft, true)} icon={<Check size={16} />}>
              Usar esta refeição
            </Button>
          </div>
        ) : undefined
      }
    >
      <Segmented
        className="mb-4"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'sugestoes', label: 'Sugestões' },
          { value: 'montar', label: 'Montar' },
          { value: 'favoritas', label: `Favoritas${favorites.length ? ` (${favorites.length})` : ''}` },
        ]}
      />

      {tab === 'sugestoes' && (
        <div className="space-y-3">
          {slot === 'jantar' && (
            <div className="flex gap-2">
              <Chip active={variant === 'todas'} onClick={() => setVariant('todas')}>
                Todas
              </Chip>
              <Chip active={variant === 'diferente'} onClick={() => setVariant('diferente')} icon={<Sparkles size={13} />}>
                Hoje quero algo diferente
              </Chip>
            </div>
          )}
          <div className="scrollbar-none -mx-6 flex gap-1.5 overflow-x-auto px-6 pb-1">
            {ALL_TAGS.map((t) => (
              <Chip key={t} active={filters.includes(t)} onClick={() => toggleFilter(t)}>
                {TAG_LABEL[t]}
              </Chip>
            ))}
          </div>
          {suggestions.length === 0 ? (
            <EmptyState
              icon={<Search size={26} />}
              title="Nenhuma opção com esses filtros"
              text="O seu plano não tem uma opção que combine todos esses filtros nesta refeição. Tente remover algum."
              action={
                <Button variant="soft" onClick={() => setFilters([])}>
                  Limpar filtros
                </Button>
              }
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {suggestions.map((s) => (
                <SuggestionCard key={signature(s)} slot={slot} selection={s} onChoose={() => choose(s, true)} />
              ))}
            </div>
          )}
          <div className="flex justify-center pt-1">
            <Button variant="secondary" icon={<Shuffle size={15} />} onClick={() => setSeed((x) => x + 1)}>
              Ver outras opções
            </Button>
          </div>
        </div>
      )}

      {tab === 'montar' && (
        <div className="grid gap-6 md:grid-cols-[1fr_0.9fr]">
          <MealBuilder slot={slot} value={draft} onChange={setDraft} />
          <div className="md:sticky md:top-0 md:self-start">
            <div className="rounded-3xl border border-sage-100 bg-sage-50/60 p-4">
              <p className="label">Sua refeição</p>
              {draftValid ? <MealDetail selection={draft} /> : <p className="text-sm text-muted">Escolha os itens ao lado.</p>}
            </div>
          </div>
        </div>
      )}

      {tab === 'favoritas' &&
        (favorites.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {favorites.map((f) => (
              <SuggestionCard key={f.id} slot={slot} selection={f.selection} onChoose={() => choose(f.selection, true)} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Star size={26} />}
            title="Nenhuma favorita ainda"
            text="Toque na estrela de uma refeição para guardá-la aqui e escolher rapidinho depois."
          />
        ))}
    </Modal>
  );
}

/** Botão "trocar só esta refeição". */
export function RegenerateButton({ onClick }: { onClick: () => void }) {
  return (
    <IconButton label="Trocar esta refeição" onClick={onClick}>
      <RefreshCw size={16} />
    </IconButton>
  );
}

export function optionTitle(o: MealOption) {
  return o.kind === 'prato' ? `${o.title} (${SLOT_LABEL[o.slot]})` : o.title;
}

export function fruitName(id: string) {
  return foodById(id)?.name ?? id;
}
