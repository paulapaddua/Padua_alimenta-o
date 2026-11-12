import { useEffect } from 'react';
import { toast } from '../components/toast';
import { useStore } from '../store/useStore';
import { minutesOf, nowMinutes, todayKey } from './dates';
import { SLOTS, SLOT_LABEL } from './menu';

/**
 * Lembretes locais. Limitação: sem servidor de push, só funcionam
 * enquanto o app (ou a aba) estiver aberto.
 */
export function notify(title: string, body: string) {
  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    try {
      navigator.serviceWorker?.getRegistration().then((reg) => {
        if (reg) reg.showNotification(title, { body, icon: '/pwa-192x192.png', badge: '/pwa-64x64.png' });
        else new Notification(title, { body, icon: '/pwa-192x192.png' });
      });
      return;
    } catch {
      /* cai no toast */
    }
  }
  toast(`${title} — ${body}`, { tone: 'info' });
}

export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (typeof Notification === 'undefined') return 'unsupported';
  if (Notification.permission !== 'default') return Notification.permission;
  return Notification.requestPermission();
}

const fired = new Set<string>();

export function useReminders() {
  useEffect(() => {
    const tick = () => {
      const { settings, logs, plans } = useStore.getState();
      const today = todayKey();
      const now = nowMinutes();

      if (settings.mealReminders) {
        for (const slot of SLOTS) {
          const id = `${today}-meal-${slot}`;
          const t = minutesOf(settings.mealTimes[slot]);
          const status = logs[today]?.meals[slot]?.status ?? 'pendente';
          if (!fired.has(id) && now >= t && now < t + 15 && status === 'pendente') {
            fired.add(id);
            notify(`Hora do ${SLOT_LABEL[slot].toLowerCase()} 🍽️`, plans[today] ? 'Sua sugestão do plano está pronta no Meu Prato.' : 'Abra o Meu Prato para ver a sugestão.');
          }
        }
      }

      const w = settings.waterReminder;
      if (w.enabled && now >= minutesOf(w.start) && now <= minutesOf(w.end)) {
        const slotIdx = Math.floor((now - minutesOf(w.start)) / Math.max(15, w.intervalMin));
        const id = `${today}-water-${slotIdx}`;
        const total = (logs[today]?.water ?? []).reduce((a, x) => a + x.ml, 0);
        if (!fired.has(id) && slotIdx > 0 && total < settings.waterGoal) {
          fired.add(id);
          notify('Um golinho de água? 💧', `Você está em ${(total / 1000).toLocaleString('pt-BR')} L de ${(settings.waterGoal / 1000).toLocaleString('pt-BR')} L.`);
        } else fired.add(id);
      }
    };
    tick();
    const t = setInterval(tick, 30_000);
    return () => clearInterval(t);
  }, []);
}
