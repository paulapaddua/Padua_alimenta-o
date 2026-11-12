import clsx from 'clsx';
import { AlertTriangle, BookOpen, ChefHat, ChevronDown, Heart, Ruler, Search, Sparkles, Star } from 'lucide-react';
import { useMemo, useState } from 'react';
import { SlotIcon, TagList } from '../components/meal';
import { Badge, Card, CardTitle, Chip, EmptyState, IconButton, Notice, PageHeader } from '../components/ui';
import { CITRUS_FRUITS, VEGETABLES } from '../data/plan/foods';
import {
  HEALTHY_PLATE,
  HOUSEHOLD_MEASURES,
  ORGANIZATION_TEXT,
  PLAN_FLAGS,
  PLAN_META,
  PLAN_QUOTE,
  SELF_CARE,
  WATER,
} from '../data/plan/guidelines';
import { COMPLEMENTOS, OPTIONS_BY_SLOT } from '../data/plan/meals';
import type { MealOption, MealSlot, Recipe, Tag } from '../data/types';
import { ALL_TAGS, TAG_LABEL, optionCanMatch } from '../lib/menu';
import { useStore } from '../store/useStore';

type Tab = MealSlot | 'complementos' | 'orientacoes';

const TABS: { value: Tab; label: string }[] = [
  { value: 'cafe', label: 'Café da manhã' },
  { value: 'almoco', label: 'Almoço' },
  { value: 'lanche', label: 'Lanche da tarde' },
  { value: 'jantar', label: 'Jantar' },
  { value: 'complementos', label: 'Complementos' },
  { value: 'orientacoes', label: 'Orientações' },
];

export default function MeuPlano() {
  const [tab, setTab] = useState<Tab>('cafe');
  const [filters, setFilters] = useState<Tag[]>([]);
  const [q, setQ] = useState('');
  const [onlyFav, setOnlyFav] = useState(false);
  const favs = useStore((s) => s.settings.favoriteRecipes);

  const options = useMemo(() => {
    if (tab === 'complementos' || tab === 'orientacoes') return [];
    return OPTIONS_BY_SLOT[tab].filter((o) => {
      if (!optionCanMatch(o, filters)) return false;
      if (onlyFav && !favs.includes(o.id)) return false;
      if (!q) return true;
      const hay = [o.title, ...o.fixed.map((i) => i.text), ...o.groups.flatMap((g) => g.choices?.map((c) => c.label) ?? [])].join(' ').toLowerCase();
      return hay.includes(q.toLowerCase());
    });
  }, [tab, filters, q, onlyFav, favs]);

  return (
    <div>
      <PageHeader
        eyebrow={`Prescrito por ${PLAN_META.nutritionist} · ${PLAN_META.date}`}
        title="Meu plano alimentar"
        subtitle="Todas as opções do seu plano, com as quantidades originais. Esta é a fonte de verdade do app — suas preferências pessoais nunca alteram estes dados."
      />

      <div className="scrollbar-none -mx-4 mb-5 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        {TABS.map((t) => (
          <Chip key={t.value} active={tab === t.value} onClick={() => setTab(t.value)}>
            {t.label}
          </Chip>
        ))}
      </div>

      {tab === 'orientacoes' ? (
        <Guidelines />
      ) : tab === 'complementos' ? (
        <div className="space-y-3">
          <Notice tone="sky" icon={<BookOpen size={14} />}>
            Receitas complementares do plano — acompanham outras refeições e não são refeições isoladas.
          </Notice>
          {COMPLEMENTOS.map((r) => (
            <RecipeCard key={r.id} recipe={r} />
          ))}
        </div>
      ) : (
        <>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search size={16} className="absolute top-1/2 left-3.5 -translate-y-1/2 text-muted" />
              <input className="input pl-10" placeholder="Buscar opção ou ingrediente…" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <Chip active={onlyFav} onClick={() => setOnlyFav((x) => !x)} icon={<Star size={13} />}>
              Só favoritas
            </Chip>
          </div>
          <div className="scrollbar-none -mx-4 mb-5 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
            {ALL_TAGS.map((t) => (
              <Chip key={t} active={filters.includes(t)} onClick={() => setFilters((f) => (f.includes(t) ? f.filter((x) => x !== t) : [...f, t]))}>
                {TAG_LABEL[t]}
              </Chip>
            ))}
          </div>

          {tab === 'almoco' || tab === 'jantar' ? <PlateNotice slot={tab} /> : null}

          {options.length ? (
            <div className="space-y-3">
              {tab === 'jantar' && options.some((o) => o.variant === 'diferente') && (
                <>
                  {options.filter((o) => o.variant === 'padrao').map((o) => (
                    <OptionCard key={o.id} option={o} />
                  ))}
                  <h2 className="flex items-center gap-2 pt-4 font-display text-xl font-semibold">
                    <Sparkles size={18} className="text-butter-500" /> Hoje quero algo diferente
                  </h2>
                  <p className="-mt-2 text-sm text-muted">No plano: "Opções de lanches, caso não queira comer comida".</p>
                  {options.filter((o) => o.variant === 'diferente').map((o) => (
                    <OptionCard key={o.id} option={o} />
                  ))}
                </>
              )}
              {!(tab === 'jantar' && options.some((o) => o.variant === 'diferente')) && options.map((o) => <OptionCard key={o.id} option={o} />)}
            </div>
          ) : (
            <Card>
              <EmptyState icon={<Search size={26} />} title="Nenhuma opção encontrada" text="Tente outra busca ou remova algum filtro." />
            </Card>
          )}
        </>
      )}
    </div>
  );
}

function PlateNotice({ slot }: { slot: 'almoco' | 'jantar' }) {
  return (
    <Notice tone="sage" className="mb-4" icon={<BookOpen size={14} />}>
      Montagem do prato: vegetais à vontade (pelo menos 50%), proteína (25%), carboidrato (25% – {slot === 'almoco' ? 5 : 4} colheres de sopa) e grãos (3 colheres de sopa). Não ingerir
      líquidos durante a refeição e até 30 minutos após.
    </Notice>
  );
}

export function FavRecipeButton({ id }: { id: string }) {
  const fav = useStore((s) => s.settings.favoriteRecipes.includes(id));
  const toggle = useStore((s) => s.toggleFavoriteRecipe);
  return (
    <IconButton label={fav ? 'Remover receita dos favoritos' : 'Favoritar receita'} active={fav} onClick={() => toggle(id)}>
      <Star size={17} fill={fav ? 'currentColor' : 'none'} />
    </IconButton>
  );
}

function OptionCard({ option }: { option: MealOption }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card p-5 animate-fade-up">
      <div className="flex items-start gap-3">
        <SlotIcon slot={option.slot} />
        <div className="min-w-0 flex-1">
          <button className="text-left" onClick={() => setOpen((o) => !o)}>
            <h3 className="font-bold">{option.title}</h3>
          </button>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <Badge tone="sage">{option.source}</Badge>
            {option.kind === 'receita' && <Badge tone="butter"><ChefHat size={11} /> Receita</Badge>}
            {option.manualOnly && <Badge tone="blush">Porção a confirmar</Badge>}
            <TagList tags={option.tags} />
          </div>
        </div>
        <FavRecipeButton id={option.id} />
        <IconButton label={open ? 'Recolher' : 'Expandir'} onClick={() => setOpen((o) => !o)}>
          <ChevronDown size={18} className={clsx('transition', open && 'rotate-180')} />
        </IconButton>
      </div>
      {open && (
        <div className="mt-4 space-y-4 border-t border-line/70 pt-4 text-sm animate-fade-up">
          {option.fixed.length > 0 && (
            <div>
              <p className="label">Ingredientes</p>
              <ul className="space-y-1">
                {option.fixed.map((i, idx) => (
                  <li key={idx}>• {i.text}</li>
                ))}
              </ul>
            </div>
          )}
          {option.groups.map((g) => (
            <div key={g.id}>
              <p className="label">
                {g.label}
                {g.optional && ' — opcional'}
              </p>
              {g.note && <p className="mb-1 text-xs text-muted">{g.note}</p>}
              {g.choices && (
                <ul className="space-y-1">
                  {g.choices.map((c, idx) => (
                    <li key={c.id}>
                      {idx > 0 && <span className="mr-1 text-xs font-bold text-sage-600">OU</span>}
                      {c.label}
                    </li>
                  ))}
                </ul>
              )}
              {g.fruitSource === 'tabela' && <p className="text-ink-soft">Qualquer fruta da tabela de densidade calórica, na porção indicada.</p>}
              {g.fruitSource === 'citrica' && <p className="text-ink-soft">{CITRUS_FRUITS.map((f) => `${f.name} (${f.portion})`).join(' · ')}</p>}
              {g.vegetableSource && <p className="text-ink-soft">{VEGETABLES.slice(0, 14).map((v) => v.name).join(', ')}… (ver tabela completa)</p>}
            </div>
          ))}
          {option.steps && (
            <div>
              <p className="label">Modo de preparo</p>
              <ol className="list-decimal space-y-1 pl-5 text-ink-soft">
                {option.steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            </div>
          )}
          {option.notes?.map((n) => (
            <Notice key={n} tone="sky" icon={<BookOpen size={14} />}>
              {n}
            </Notice>
          ))}
          {[...(option.flags ?? []), ...option.fixed.filter((i) => i.flag).map((i) => i.flag!), ...option.groups.flatMap((g) => g.choices?.flatMap((c) => c.ingredients.filter((i) => i.flag).map((i) => i.flag!)) ?? [])]
            .filter((v, i, a) => a.indexOf(v) === i)
            .map((f) => (
              <Notice key={f} icon={<AlertTriangle size={14} />}>
                <strong>Ponto a confirmar:</strong> {f}
              </Notice>
            ))}
        </div>
      )}
    </div>
  );
}

export function RecipeCard({ recipe, defaultOpen, footer }: { recipe: Recipe; defaultOpen?: boolean; footer?: React.ReactNode }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="card p-5 animate-fade-up">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <button className="text-left" onClick={() => setOpen((o) => !o)}>
            <h3 className="font-bold">{recipe.title}</h3>
          </button>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <Badge tone="sage">{recipe.source}</Badge>
            {recipe.batch && <Badge tone="butter">{recipe.batch.note}</Badge>}
          </div>
        </div>
        <FavRecipeButton id={recipe.id} />
        <IconButton label={open ? 'Recolher' : 'Expandir'} onClick={() => setOpen((o) => !o)}>
          <ChevronDown size={18} className={clsx('transition', open && 'rotate-180')} />
        </IconButton>
      </div>
      {open && (
        <div className="mt-4 space-y-4 border-t border-line/70 pt-4 text-sm animate-fade-up">
          <div>
            <p className="label">Ingredientes</p>
            <ul className="space-y-1">
              {recipe.ingredients.map((i, idx) => (
                <li key={idx}>• {i.text}</li>
              ))}
            </ul>
            {recipe.variants && (
              <div className="mt-2 space-y-1">
                {recipe.variants.map((v, idx) => (
                  <p key={v.id}>
                    {idx > 0 && <span className="mr-1 text-xs font-bold text-sage-600">OU</span>}• {v.label}
                  </p>
                ))}
              </div>
            )}
          </div>
          <div>
            <p className="label">Modo de preparo</p>
            <ol className="list-decimal space-y-1 pl-5 text-ink-soft">
              {recipe.steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </div>
          {recipe.notes?.map((n) => (
            <Notice key={n} tone="sky" icon={<BookOpen size={14} />}>
              {n}
            </Notice>
          ))}
        </div>
      )}
      {footer && <div className="mt-4">{footer}</div>}
    </div>
  );
}

function Guidelines() {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <CardTitle icon={<Heart size={20} />} title="Prato saudável" subtitle="Plano p. 3" />
        <div className="flex items-center gap-5">
          <svg viewBox="0 0 42 42" className="h-32 w-32 shrink-0 -rotate-90" aria-hidden>
            <circle cx="21" cy="21" r="15.915" fill="#fff" stroke="var(--color-sage-300)" strokeWidth="8" strokeDasharray="50 50" />
            <circle cx="21" cy="21" r="15.915" fill="none" stroke="var(--color-blush-500)" strokeWidth="8" strokeDasharray="25 75" strokeDashoffset="-50" />
            <circle cx="21" cy="21" r="15.915" fill="none" stroke="var(--color-butter-300)" strokeWidth="8" strokeDasharray="25 75" strokeDashoffset="-75" />
          </svg>
          <ul className="space-y-2 text-sm">
            {HEALTHY_PLATE.map((p, i) => (
              <li key={p.label} className="flex items-start gap-2">
                <span className={clsx('mt-1 h-3 w-3 shrink-0 rounded-full', ['bg-sage-300', 'bg-blush-500', 'bg-butter-300'][i])} />
                <span>
                  <strong>{p.pct}% {p.label}</strong> — <span className="text-ink-soft">{p.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Card>

      <Card>
        <CardTitle icon={<Ruler size={20} />} title="Medidas caseiras" subtitle="Plano p. 2 — referência para as porções" />
        <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
          {HOUSEHOLD_MEASURES.map((m) => (
            <li key={m.name} className="flex justify-between border-b border-line/60 py-1">
              <span>{m.name}</span>
              <span className="text-muted">{m.size}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <CardTitle icon={<Sparkles size={20} />} title="Organização é tudo!" subtitle="Plano p. 1" />
        <p className="text-sm leading-relaxed text-ink-soft">{ORGANIZATION_TEXT}</p>
        <p className="mt-3 text-sm text-ink-soft">
          <strong>{WATER.text}</strong>
        </p>
      </Card>

      <Card>
        <CardTitle icon={<Heart size={20} />} title="Meta: autocuidado" subtitle="Plano p. 1" />
        <ul className="space-y-2 text-sm">
          {SELF_CARE.map((s) => (
            <li key={s.title}>
              <strong>{s.title}:</strong> <span className="text-ink-soft">{s.text}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="lg:col-span-2">
        <CardTitle icon={<AlertTriangle size={20} />} title="Pontos a confirmar com a nutricionista" subtitle="Trechos do PDF ilegíveis, incompletos ou ambíguos — mantidos como estão, sem suposições." />
        <ul className="space-y-2 text-sm">
          {PLAN_FLAGS.map((f) => (
            <li key={f.text} className="flex gap-2">
              <Badge tone="butter" className="shrink-0">
                {f.where}
              </Badge>
              <span className="text-ink-soft">{f.text}</span>
            </li>
          ))}
        </ul>
      </Card>

      <p className="text-center font-display text-xl text-sage-700 italic lg:col-span-2">"{PLAN_QUOTE}"</p>
      <p className="text-center text-xs text-muted lg:col-span-2">
        {PLAN_META.nutritionist} · {PLAN_META.crn} · {PLAN_META.instagram}
      </p>
    </div>
  );
}

