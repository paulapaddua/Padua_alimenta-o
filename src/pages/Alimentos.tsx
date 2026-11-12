import clsx from 'clsx';
import { Apple, Info, Leaf, Search, ThumbsDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge, Card, Chip, EmptyState, IconButton, Notice, PageHeader } from '../components/ui';
import { DENSITY_INFO, DENSITY_LABEL, FRUITS, VEGETABLES } from '../data/plan/foods';
import type { Density, FoodItem } from '../data/types';
import { useStore } from '../store/useStore';

type TypeFilter = 'todos' | 'fruta' | 'vegetal';

const DENSITY_TONE: Record<Density, string> = {
  'muito-baixa': 'bg-olive-100 text-olive-700',
  baixa: 'bg-sage-100 text-sage-800',
  media: 'bg-butter-100 text-butter-700',
  'media-alta': 'bg-blush-50 text-blush-700',
};

export default function Alimentos() {
  const [q, setQ] = useState('');
  const [type, setType] = useState<TypeFilter>('todos');
  const [density, setDensity] = useState<Density | 'todas'>('todas');
  const dislikes = useStore((s) => s.settings.dislikes);
  const toggleDislike = useStore((s) => s.toggleDislike);

  const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  const sections = useMemo(() => {
    const match = (f: FoodItem) =>
      (type === 'todos' || (type === 'fruta' ? f.type !== 'vegetal' : f.type === 'vegetal')) &&
      (density === 'todas' || f.density === density) &&
      (!q || norm(f.name).includes(norm(q)));
    return [
      { title: 'Vegetais', icon: Leaf, items: VEGETABLES.filter(match) },
      { title: 'Frutas', icon: Apple, items: FRUITS.filter(match) },
    ].filter((s) => s.items.length);
  }, [q, type, density]);

  const densities: Density[] = ['muito-baixa', 'baixa', 'media', 'media-alta'];

  return (
    <div>
      <PageHeader
        eyebrow="Plano p. 10 e 11"
        title="Frutas e vegetais"
        subtitle="Tabela de densidade calórica do seu plano, com as porções exatamente como aparecem no documento. Vegetais são à vontade."
      />

      <Notice tone="sky" icon={<Info size={14} />} className="mb-5">
        {DENSITY_INFO}
      </Notice>

      <div className="mb-3 relative">
        <Search size={16} className="absolute top-1/2 left-3.5 -translate-y-1/2 text-muted" />
        <input className="input pl-10" placeholder="Buscar por nome (ex.: morango, abobrinha)…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar alimento" />
      </div>
      <div className="mb-6 flex flex-wrap gap-1.5">
        {(['todos', 'fruta', 'vegetal'] as TypeFilter[]).map((t) => (
          <Chip key={t} active={type === t} onClick={() => setType(t)}>
            {t === 'todos' ? 'Todos' : t === 'fruta' ? 'Frutas' : 'Vegetais'}
          </Chip>
        ))}
        <span className="mx-1 w-px self-stretch bg-line" />
        <Chip active={density === 'todas'} onClick={() => setDensity('todas')}>
          Todas as densidades
        </Chip>
        {densities.map((d) => (
          <Chip key={d} active={density === d} onClick={() => setDensity(d)}>
            {DENSITY_LABEL[d].replace('Densidade ', '')}
          </Chip>
        ))}
      </div>

      {sections.length === 0 ? (
        <Card>
          <EmptyState icon={<Search size={26} />} title="Nada encontrado" text="Esse alimento não está na tabela do seu plano. Confira a grafia ou os filtros." />
        </Card>
      ) : (
        sections.map((sec) => (
          <section key={sec.title} className="mb-8">
            <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-semibold">
              <sec.icon size={18} className="text-sage-600" /> {sec.title}
              <span className="text-sm font-normal text-muted">({sec.items.length})</span>
            </h2>
            {densities
              .filter((d) => sec.items.some((i) => i.density === d))
              .map((d) => (
                <div key={d} className="mb-4">
                  <p className="label">{DENSITY_LABEL[d]}</p>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {sec.items
                      .filter((i) => i.density === d)
                      .map((f) => {
                        const disliked = dislikes.includes(f.id);
                        return (
                          <div key={f.id} className={clsx('flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3', disliked && 'opacity-60')}>
                            <span className={clsx('h-2.5 w-2.5 shrink-0 rounded-full', DENSITY_TONE[f.density].split(' ')[0])} />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold">
                                {f.name} {f.citrica && <Badge tone="butter">Cítrica</Badge>}
                              </p>
                              <p className="text-xs text-muted">{f.portion ?? 'À vontade'}</p>
                              {f.flag && <p className="mt-0.5 text-[11px] text-butter-700">⚠ {f.flag}</p>}
                            </div>
                            <IconButton label={disliked ? 'Remover de "não gosto"' : 'Marcar como "não gosto"'} active={disliked} onClick={() => toggleDislike(f.id)}>
                              <ThumbsDown size={15} />
                            </IconButton>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
          </section>
        ))
      )}
      <p className="text-xs text-muted">👎 "Não gosto" é uma preferência pessoal: o alimento deixa de ser sugerido automaticamente, mas continua no seu plano.</p>
    </div>
  );
}
