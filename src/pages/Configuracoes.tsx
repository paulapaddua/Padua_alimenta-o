import clsx from 'clsx';
import { Bell, Clock, Database, Download, Droplets, Heart, Home, Search, ShieldCheck, Star, ThumbsDown, Trash2, Upload, User, Wand2 } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { RecipeCard } from './MeuPlano';
import { SlotIcon } from '../components/meal';
import { toast } from '../components/toast';
import { Badge, Button, Card, CardTitle, Chip, IconButton, Modal, Notice, PageHeader, Toggle } from '../components/ui';
import { ALL_FOODS } from '../data/plan/foods';
import { WATER } from '../data/plan/guidelines';
import { INGREDIENT_NAMES } from '../data/plan/ingredients';
import { ALL_OPTIONS, COMPLEMENTOS } from '../data/plan/meals';
import { SWEETS } from '../data/plan/sweets';
import { ALL_TAGS, SLOTS, SLOT_LABEL, TAG_LABEL, isValidSelection, resolveSelection } from '../lib/menu';
import { notify, requestNotificationPermission } from '../lib/reminders';
import { dayStats } from '../lib/stats';
import { exportSnapshot, useStore } from '../store/useStore';

const FOOD_CHOICES = [
  ...Object.entries(INGREDIENT_NAMES).map(([key, name]) => ({ key, name })),
  ...ALL_FOODS.filter((f) => !INGREDIENT_NAMES[f.id]).map((f) => ({ key: f.id, name: f.name })),
].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

function download(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function Configuracoes() {
  const settings = useStore((s) => s.settings);
  const update = useStore((s) => s.updateSettings);
  const [perm, setPerm] = useState(typeof Notification === 'undefined' ? 'unsupported' : Notification.permission);

  const enableNotifications = async () => {
    const p = await requestNotificationPermission();
    setPerm(p);
    if (p === 'granted') notify('Notificações ativadas 🌿', 'Vamos te lembrar com carinho.');
    else if (p === 'denied') toast('As notificações foram bloqueadas no navegador. Os lembretes aparecerão dentro do app.', { tone: 'info' });
  };

  return (
    <div>
      <PageHeader
        eyebrow="Preferências pessoais"
        title="Configurações"
        subtitle="Personalize o app do seu jeito. Nada aqui altera o plano prescrito pela nutricionista — são apenas as suas preferências."
      />
      <Notice tone="sage" className="mb-6" icon={<ShieldCheck size={14} />}>
        <strong>Prescrito × pessoal:</strong> quantidades, opções e orientações vêm do plano (somente leitura). Horários, metas dentro da faixa prescrita, alimentos que não gosta, favoritos e
        preferências de preparo são pessoais e ficam salvos só neste aparelho.
      </Notice>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardTitle icon={<User size={18} />} title="Perfil" />
          <label className="label" htmlFor="name">
            Como quer ser chamada?
          </label>
          <input
            id="name"
            className="input"
            value={settings.name}
            maxLength={40}
            onChange={(e) => update({ name: e.target.value })}
            onBlur={(e) => !e.target.value.trim() && update({ name: 'Paula' })}
          />
        </Card>

        <Card>
          <CardTitle icon={<Droplets size={18} />} title="Meta de água" subtitle={WATER.text} />
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={WATER.minMl}
              max={WATER.maxMl}
              step={100}
              value={settings.waterGoal}
              onChange={(e) => update({ waterGoal: Number(e.target.value) })}
              className="flex-1 accent-sky-500"
              aria-label="Meta diária de água"
            />
            <span className="w-20 text-right font-display text-xl font-semibold text-sky-700">{(settings.waterGoal / 1000).toLocaleString('pt-BR')} L</span>
          </div>
          <p className="mt-2 text-xs text-muted">Ajustável somente dentro da faixa prescrita (2,5 a 3 L).</p>
        </Card>

        <Card>
          <CardTitle icon={<Clock size={18} />} title="Horários das refeições" />
          <div className="grid grid-cols-2 gap-3">
            {SLOTS.map((s) => (
              <div key={s}>
                <label className="label" htmlFor={`time-${s}`}>
                  {SLOT_LABEL[s]}
                </label>
                <input
                  id={`time-${s}`}
                  type="time"
                  className="input"
                  value={settings.mealTimes[s]}
                  onChange={(e) => e.target.value && update({ mealTimes: { ...settings.mealTimes, [s]: e.target.value } })}
                />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardTitle icon={<Bell size={18} />} title="Lembretes e notificações" />
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl bg-cream-2/50 px-4 py-3">
              <div>
                <p className="text-sm font-semibold">Notificações do navegador</p>
                <p className="text-xs text-muted">
                  {perm === 'granted' ? 'Ativadas' : perm === 'denied' ? 'Bloqueadas no navegador' : perm === 'unsupported' ? 'Não suportadas neste navegador' : 'Ainda não permitidas'}
                </p>
              </div>
              {perm !== 'granted' && perm !== 'unsupported' && (
                <Button size="sm" variant="soft" onClick={enableNotifications}>
                  Permitir
                </Button>
              )}
              {perm === 'granted' && (
                <Button size="sm" variant="ghost" onClick={() => notify('Teste do Meu Prato', 'Os lembretes estão funcionando!')}>
                  Testar
                </Button>
              )}
            </div>
            <Row label="Lembrar nos horários das refeições" checked={settings.mealReminders} onChange={(v) => update({ mealReminders: v })} />
            <Row
              label="Lembretes de água"
              checked={settings.waterReminder.enabled}
              onChange={(v) => update({ waterReminder: { ...settings.waterReminder, enabled: v } })}
            />
            {settings.waterReminder.enabled && (
              <div className="grid grid-cols-3 gap-2 animate-fade-up">
                <div>
                  <label className="label">A cada</label>
                  <select
                    className="input"
                    value={settings.waterReminder.intervalMin}
                    onChange={(e) => update({ waterReminder: { ...settings.waterReminder, intervalMin: Number(e.target.value) } })}
                  >
                    {[30, 45, 60, 90, 120, 180].map((m) => (
                      <option key={m} value={m}>
                        {m} min
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Das</label>
                  <input type="time" className="input" value={settings.waterReminder.start} onChange={(e) => e.target.value && update({ waterReminder: { ...settings.waterReminder, start: e.target.value } })} />
                </div>
                <div>
                  <label className="label">Até</label>
                  <input type="time" className="input" value={settings.waterReminder.end} onChange={(e) => e.target.value && update({ waterReminder: { ...settings.waterReminder, end: e.target.value } })} />
                </div>
              </div>
            )}
            <p className="text-[11px] text-muted">
              Limitação: sem um servidor, os lembretes só funcionam enquanto o Meu Prato estiver aberto (em uma aba ou instalado como app).
            </p>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardTitle icon={<Wand2 size={18} />} title="Preferências de preparo" subtitle="O gerador de cardápio dará prioridade a opções com estas características (sem alterar as porções)." />
          <div className="flex flex-wrap gap-1.5">
            {ALL_TAGS.map((t) => (
              <Chip
                key={t}
                active={settings.prefer.includes(t)}
                onClick={() => update({ prefer: settings.prefer.includes(t) ? settings.prefer.filter((x) => x !== t) : [...settings.prefer, t] })}
              >
                {TAG_LABEL[t]}
              </Chip>
            ))}
          </div>
        </Card>

        <FoodToggleCard
          title="Alimentos que não gosto"
          subtitle="Deixam de ser sugeridos automaticamente, mas continuam disponíveis no plano."
          icon={<ThumbsDown size={18} />}
          selected={settings.dislikes}
          onToggle={(k) => update({ dislikes: settings.dislikes.includes(k) ? settings.dislikes.filter((x) => x !== k) : [...settings.dislikes, k] })}
        />
        <FoodToggleCard
          title="Alimentos disponíveis em casa"
          subtitle="Aparecem no painel e marcados na lista de compras."
          icon={<Home size={18} />}
          selected={settings.pantry}
          onToggle={(k) => update({ pantry: settings.pantry.includes(k) ? settings.pantry.filter((x) => x !== k) : [...settings.pantry, k] })}
        />

        <FavoritesCard />
        <DataCard />
      </div>
    </div>
  );
}

function Row({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm">{label}</span>
      <Toggle checked={checked} onChange={onChange} label={label} />
    </div>
  );
}

function FoodToggleCard({ title, subtitle, icon, selected, onToggle }: { title: string; subtitle: string; icon: React.ReactNode; selected: string[]; onToggle: (k: string) => void }) {
  const [q, setQ] = useState('');
  const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const list = useMemo(() => FOOD_CHOICES.filter((f) => norm(f.name).includes(norm(q))), [q]);
  return (
    <Card>
      <CardTitle icon={icon} title={title} subtitle={subtitle} />
      {selected.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {selected.map((k) => (
            <button key={k} onClick={() => onToggle(k)} className="inline-flex items-center gap-1 rounded-full bg-sage-100 px-2.5 py-1 text-xs font-semibold text-sage-800 hover:bg-sage-200">
              {FOOD_CHOICES.find((f) => f.key === k)?.name ?? k} ×
            </button>
          ))}
        </div>
      )}
      <div className="relative mb-2">
        <Search size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-muted" />
        <input className="input py-2 pl-8 text-xs" placeholder="Buscar alimento…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="flex max-h-44 flex-wrap gap-1.5 overflow-y-auto">
        {list.map((f) => (
          <Chip key={f.key} active={selected.includes(f.key)} onClick={() => onToggle(f.key)}>
            {f.name}
          </Chip>
        ))}
      </div>
    </Card>
  );
}

function FavoritesCard() {
  const favorites = useStore((s) => s.favorites).filter((f) => isValidSelection(f.selection));
  const favRecipes = useStore((s) => s.settings.favoriteRecipes);
  const toggleFavorite = useStore((s) => s.toggleFavorite);
  const toggleFavRecipe = useStore((s) => s.toggleFavoriteRecipe);
  const recipes = [...SWEETS, ...COMPLEMENTOS].filter((r) => favRecipes.includes(r.id));
  const options = ALL_OPTIONS.filter((o) => favRecipes.includes(o.id));
  const [show, setShow] = useState<string | null>(null);
  const shown = [...SWEETS, ...COMPLEMENTOS].find((r) => r.id === show);

  return (
    <Card className="lg:col-span-2">
      <CardTitle icon={<Star size={18} />} title="Favoritos" subtitle="Refeições e receitas que você marcou com estrela." />
      {favorites.length + recipes.length + options.length === 0 ? (
        <p className="text-sm text-muted">Nenhum favorito ainda. Toque na ⭐ de uma refeição ou receita para guardá-la.</p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {favorites.map((f) => {
            const r = resolveSelection(f.selection)!;
            return (
              <div key={f.id} className="flex items-center gap-3 rounded-2xl border border-line p-3">
                <SlotIcon slot={f.slot} className="h-8 w-8" size={15} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{r.option.kind === 'prato' ? r.summary : r.title}</p>
                  <p className="text-xs text-muted">{SLOT_LABEL[f.slot]}</p>
                </div>
                <IconButton label="Remover favorito" onClick={() => toggleFavorite(f.slot, f.selection)}>
                  <Trash2 size={14} />
                </IconButton>
              </div>
            );
          })}
          {[...options.map((o) => ({ id: o.id, title: o.title, sub: SLOT_LABEL[o.slot] })), ...recipes.map((r) => ({ id: r.id, title: r.title, sub: 'Receita' }))].map((x) => (
            <div key={x.id} className="flex items-center gap-3 rounded-2xl border border-line p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-butter-100 text-butter-700">
                <Heart size={15} />
              </div>
              <button className="min-w-0 flex-1 text-left" onClick={() => setShow(x.id)}>
                <p className="truncate text-sm font-semibold">{x.title}</p>
                <p className="text-xs text-muted">{x.sub}</p>
              </button>
              <IconButton label="Remover favorito" onClick={() => toggleFavRecipe(x.id)}>
                <Trash2 size={14} />
              </IconButton>
            </div>
          ))}
        </div>
      )}
      <Modal open={!!shown} onClose={() => setShow(null)} title={shown?.title ?? ''}>
        {shown && <RecipeCard recipe={shown} defaultOpen />}
      </Modal>
    </Card>
  );
}

function DataCard() {
  const importData = useStore((s) => s.importData);
  const resetAll = useStore((s) => s.resetAll);
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirm, setConfirm] = useState(false);

  const exportCsv = () => {
    const { logs, settings } = useStore.getState();
    const keys = Object.keys(logs).sort();
    if (!keys.length) return toast('Ainda não há registros para exportar.', { tone: 'info' });
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const header = ['data', ...SLOTS.flatMap((s) => [`${s}_status`, `${s}_consumido`]), 'agua_ml', 'habitos', 'vontade_doce', 'receita_doce', 'atividade', 'atividade_min', 'atividade_tipo', 'adesao_pct', 'observacoes'];
    const rows = keys.map((k) => {
      const l = logs[k];
      const st = dayStats(l, settings.waterGoal);
      return [
        k,
        ...SLOTS.flatMap((s) => {
          const m = l.meals[s];
          const r = m?.selection ? resolveSelection(m.selection) : null;
          return [m?.status ?? 'pendente', m?.other ?? (r ? (r.option.kind === 'prato' ? r.summary : r.title) : '')];
        }),
        st.waterMl,
        l.habits.length,
        l.sweetCraving ? 'sim' : 'não',
        SWEETS.find((x) => x.id === l.sweetRecipe)?.title ?? '',
        l.activity.done ? 'sim' : 'não',
        l.activity.minutes ?? '',
        l.activity.kind ?? '',
        st.adherence,
        l.notes,
      ]
        .map(esc)
        .join(';');
    });
    download(`meu-prato-historico-${keys[0]}_a_${keys[keys.length - 1]}.csv`, '﻿' + [header.join(';'), ...rows].join('\n'), 'text/csv;charset=utf-8');
    toast('Histórico exportado (abre no Excel/Planilhas)');
  };

  const backup = () => {
    download(`meu-prato-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(exportSnapshot(), null, 2), 'application/json');
    toast('Backup salvo! Guarde o arquivo em local seguro.');
  };

  const restore = async (file: File) => {
    try {
      const data = JSON.parse(await file.text());
      importData(data);
      toast('Backup restaurado com sucesso');
    } catch (e) {
      toast(e instanceof Error && e.message.startsWith('Arquivo') ? e.message : 'Não foi possível ler este arquivo de backup.', { tone: 'info' });
    }
  };

  return (
    <Card className="lg:col-span-2">
      <CardTitle icon={<Database size={18} />} title="Seus dados" subtitle="Tudo fica salvo neste navegador. Faça backups de vez em quando." />
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" icon={<Download size={15} />} onClick={exportCsv}>
          Exportar histórico (CSV)
        </Button>
        <Button variant="secondary" icon={<Download size={15} />} onClick={backup}>
          Fazer backup (JSON)
        </Button>
        <Button variant="secondary" icon={<Upload size={15} />} onClick={() => fileRef.current?.click()}>
          Restaurar backup
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) restore(f);
            e.target.value = '';
          }}
        />
        <Button variant="danger" icon={<Trash2 size={15} />} onClick={() => setConfirm(true)}>
          Apagar todos os dados
        </Button>
      </div>
      <p className={clsx('mt-3 text-[11px] text-muted')}>
        Para usar em outro aparelho: faça o backup aqui e restaure no outro. A estrutura dos dados já está preparada para uma futura sincronização em nuvem.
      </p>
      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Apagar todos os dados?"
        subtitle="Registros, cardápios, favoritos e preferências serão removidos deste aparelho. O plano da nutricionista continua no app."
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirm(false)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                resetAll();
                setConfirm(false);
                toast('Dados apagados. Um novo começo! 🌱');
              }}
            >
              Sim, apagar
            </Button>
          </div>
        }
      >
        <Badge tone="butter">Dica: faça um backup antes.</Badge>
      </Modal>
    </Card>
  );
}
