import { Component, type ReactNode } from 'react';
import { HashRouter, Link, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Button, EmptyState } from './components/ui';
import { useReminders } from './lib/reminders';
import Alimentos from './pages/Alimentos';
import Cardapio from './pages/Cardapio';
import ComendoFora from './pages/ComendoFora';
import Compras from './pages/Compras';
import Configuracoes from './pages/Configuracoes';
import Dashboard from './pages/Dashboard';
import Diario from './pages/Diario';
import Doces from './pages/Doces';
import Habitos from './pages/Habitos';
import MealPrep from './pages/MealPrep';
import MeuPlano from './pages/MeuPlano';
import Progresso from './pages/Progresso';
import { Compass, LifeBuoy } from 'lucide-react';

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-dvh items-center justify-center p-6">
          <div className="card max-w-md">
            <EmptyState
              icon={<LifeBuoy size={28} />}
              title="Algo não saiu como esperado"
              text="Seus dados continuam salvos. Tente recarregar a página. Se o problema continuar, faça um backup em Configurações."
              action={<Button onClick={() => location.reload()}>Recarregar</Button>}
            />
            <p className="px-6 pb-4 text-center text-[11px] text-muted">{this.state.error.message}</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function NotFound() {
  return (
    <EmptyState
      icon={<Compass size={28} />}
      title="Página não encontrada"
      text="Esse caminho não existe no Meu Prato."
      action={
        <Link to="/">
          <Button>Voltar para hoje</Button>
        </Link>
      }
    />
  );
}

export default function App() {
  useReminders();
  return (
    <ErrorBoundary>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="cardapio" element={<Cardapio />} />
            <Route path="plano" element={<MeuPlano />} />
            <Route path="doces" element={<Doces />} />
            <Route path="alimentos" element={<Alimentos />} />
            <Route path="compras" element={<Compras />} />
            <Route path="meal-prep" element={<MealPrep />} />
            <Route path="diario" element={<Diario />} />
            <Route path="habitos" element={<Habitos />} />
            <Route path="comendo-fora" element={<ComendoFora />} />
            <Route path="progresso" element={<Progresso />} />
            <Route path="config" element={<Configuracoes />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </HashRouter>
    </ErrorBoundary>
  );
}
