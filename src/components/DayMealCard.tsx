import clsx from 'clsx';
import { Check, ChevronDown, Clock, MoreHorizontal, PenLine, RefreshCw, Shuffle, SkipForward, Undo2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { MealSlot } from '../data/types';
import { timeHHMM } from '../lib/dates';
import { SLOT_LABEL, resolveSelection } from '../lib/menu';
import { MEAL_DONE_MESSAGES, SKIP_MESSAGE } from '../lib/messages';
import { useDayLog, useStore } from '../store/useStore';
import { FavoriteButton, MealDetail, MealPicker, SlotIcon } from './meal';
import { toast } from './toast';
import { Badge, Button, IconButton, Modal } from './ui';

export function StatusBadge({ status }: { status?: string }) {
  if (status === 'concluida') return <Badge tone="olive"><Check size={11} strokeWidth={3} /> Concluída</Badge>;
  if (status === 'pulada') return <Badge tone="neutral">Pulada</Badge>;
  return <Badge tone="butter">Pendente</Badge>;
}

export function DayMealCard({ date, slot, highlight, defaultOpen }: { date: string; slot: MealSlot; highlight?: boolean; defaultOpen?: boolean }) {
  const plan = useStore((s) => s.plans[date]);
  const time = useStore((s) => s.settings.mealTimes[slot]);
  const setMeal = useStore((s) => s.setMeal);
  const regenerateMeal = useStore((s) => s.regenerateMeal);
  const setMealLog = useStore((s) => s.setMealLog);
  const log = useDayLog(date).meals[slot];
  const [open, setOpen] = useState(!!defaultOpen);
  const [picker, setPicker] = useState(false);
  const [menu, setMenu] = useState(false);
  const [other, setOther] = useState(false);
  const [burst, setBurst] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) return;
    const close = (e: MouseEvent) => !menuRef.current?.contains(e.target as Node) && setMenu(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menu]);

  const selection = plan?.meals[slot];
  const status = log?.status ?? 'pendente';
  const shown = status === 'concluida' && log?.selection ? log.selection : selection;
  const r = shown ? resolveSelection(shown) : null;

  const register = () => {
    if (!selection) return;
    const prev = log;
    setMealLog(date, slot, { status: 'concluida', selection, other: undefined, time: timeHHMM() });
    setBurst(true);
    setTimeout(() => setBurst(false), 800);
    toast(MEAL_DONE_MESSAGES[Math.floor(Math.random() * MEAL_DONE_MESSAGES.length)], {
      action: { label: 'Desfazer', onClick: () => setMealLog(date, slot, prev ?? { status: 'pendente', selection: undefined, time: undefined }) },
    });
  };

  const skip = () => {
    setMealLog(date, slot, { status: 'pulada', selection: undefined, other: undefined, time: undefined });
    setMenu(false);
    toast(SKIP_MESSAGE, { tone: 'info' });
  };

  const undo = () => {
    setMealLog(date, slot, { status: 'pendente', selection: undefined, other: undefined, time: undefined });
    setMenu(false);
  };

  return (
    <div
      className={clsx(
        'card relative overflow-hidden p-4 transition sm:p-5',
        highlight && status === 'pendente' && 'ring-2 ring-butter-300',
        status === 'concluida' && 'bg-olive-50/50',
      )}
    >
      <div className="flex items-start gap-3">
        <div className="relative">
          <SlotIcon slot={slot} />
          {status === 'concluida' && (
            <span className="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full bg-olive-500 text-white ring-2 ring-paper animate-pop">
              <Check size={12} strokeWidth={3} />
            </span>
          )}
          {burst && <span className="pointer-events-none absolute inset-0 rounded-2xl bg-olive-500/40 animate-burst" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold">{SLOT_LABEL[slot]}</h3>
            <span className="flex items-center gap-1 text-xs text-muted">
              <Clock size={12} /> {time}
            </span>
            <StatusBadge status={status} />
            {highlight && status === 'pendente' && <Badge tone="sky">Próxima</Badge>}
          </div>
          {status === 'concluida' && log?.other ? (
            <p className="mt-1 text-sm text-ink-soft">
              Comi outra coisa: <span className="font-medium">{log.other}</span>
            </p>
          ) : r ? (
            <button className="mt-1 block w-full text-left" onClick={() => setOpen((o) => !o)}>
              <p className="text-sm leading-snug font-medium">{r.option.kind === 'prato' ? r.summary : r.title}</p>
              {r.option.kind !== 'prato' && r.summary !== r.title && <p className="text-xs text-muted">{r.summary.replace(`${r.title} · `, '')}</p>}
            </button>
          ) : (
            <p className="mt-1 text-sm text-muted">Gerando sugestão…</p>
          )}
          {status === 'concluida' && log?.time && <p className="mt-0.5 text-xs text-olive-600">Registrada às {log.time}</p>}
        </div>
        <div className="flex items-center">
          {shown && <FavoriteButton slot={slot} selection={shown} />}
          <IconButton label={open ? 'Ocultar detalhes' : 'Ver detalhes e quantidades'} onClick={() => setOpen((o) => !o)}>
            <ChevronDown size={18} className={clsx('transition', open && 'rotate-180')} />
          </IconButton>
        </div>
      </div>

      {open && shown && (
        <div className="mt-4 border-t border-line/70 pt-4 animate-fade-up">
          <MealDetail selection={shown} />
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {status !== 'concluida' ? (
          <Button size="sm" onClick={register} icon={<Check size={15} />} disabled={!selection}>
            Registrar refeição
          </Button>
        ) : (
          <Button size="sm" variant="soft" onClick={undo} icon={<Undo2 size={14} />}>
            Desfazer registro
          </Button>
        )}
        <Button size="sm" variant="secondary" onClick={() => setPicker(true)} icon={<Shuffle size={14} />}>
          Ver outras opções
        </Button>
        {status === 'pendente' && (
          <IconButton
            label="Trocar só esta refeição"
            onClick={() => {
              regenerateMeal(date, slot);
              toast(`Nova sugestão para ${SLOT_LABEL[slot].toLowerCase()}`, { tone: 'info' });
            }}
          >
            <RefreshCw size={16} />
          </IconButton>
        )}
        <div className="relative ml-auto" ref={menuRef}>
          <IconButton label="Mais ações" onClick={() => setMenu((m) => !m)}>
            <MoreHorizontal size={18} />
          </IconButton>
          {menu && (
            <div className="absolute right-0 bottom-11 z-20 w-56 overflow-hidden rounded-2xl border border-line bg-white py-1 shadow-lift animate-fade">
              <MenuItem
                icon={<PenLine size={15} />}
                onClick={() => {
                  setOther(true);
                  setMenu(false);
                }}
              >
                Comi outra coisa
              </MenuItem>
              <MenuItem icon={<SkipForward size={15} />} onClick={skip}>
                Pulei esta refeição
              </MenuItem>
              {status !== 'pendente' && (
                <MenuItem icon={<Undo2 size={15} />} onClick={undo}>
                  Voltar para pendente
                </MenuItem>
              )}
            </div>
          )}
        </div>
      </div>

      <MealPicker
        open={picker}
        onClose={() => setPicker(false)}
        slot={slot}
        current={selection}
        onSelect={(sel) => {
          setMeal(date, slot, sel, true);
          toast('Refeição atualizada no seu cardápio');
        }}
      />
      <OtherMealModal
        open={other}
        onClose={() => setOther(false)}
        onSave={(text, t) => {
          setMealLog(date, slot, { status: 'concluida', other: text, selection: undefined, time: t });
          toast('Anotado, sem julgamentos. 🌿');
        }}
      />
    </div>
  );
}

function MenuItem({ icon, children, onClick }: { icon: React.ReactNode; children: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm hover:bg-sage-50">
      <span className="text-muted">{icon}</span>
      {children}
    </button>
  );
}

function OtherMealModal({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (text: string, time: string) => void }) {
  const [text, setText] = useState('');
  const [time, setTime] = useState(timeHHMM());
  const [error, setError] = useState('');
  useEffect(() => {
    if (open) {
      setText('');
      setTime(timeHHMM());
      setError('');
    }
  }, [open]);
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Comi outra coisa"
      subtitle="Está tudo bem. Registrar ajuda a conhecer sua rotina — sem culpa."
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              if (text.trim().length < 2) {
                setError('Descreva brevemente o que você comeu.');
                return;
              }
              onSave(text.trim(), time);
              onClose();
            }}
          >
            Salvar
          </Button>
        </div>
      }
    >
      <label className="label" htmlFor="other-text">
        O que você comeu?
      </label>
      <textarea id="other-text" className="input min-h-24" value={text} onChange={(e) => setText(e.target.value)} placeholder="Ex.: almoço no restaurante do trabalho" />
      {error && <p className="mt-1 text-xs text-blush-700">{error}</p>}
      <label className="label mt-4" htmlFor="other-time">
        Horário
      </label>
      <input id="other-time" type="time" className="input" value={time} onChange={(e) => setTime(e.target.value)} />
    </Modal>
  );
}
