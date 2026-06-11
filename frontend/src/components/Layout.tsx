import { useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { LayoutDashboard, Users, Target, Menu, X, Moon, Sun, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/lib/use-theme';

const links = [
  { to: '/', label: 'Dashboard', Icon: LayoutDashboard, end: true },
  { to: '/leads', label: 'Leads', Icon: Users, end: false },
  { to: '/financeiro', label: 'Financeiro', Icon: Wallet, end: false },
];

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-3">
      <span className="grid h-9 w-9 place-items-center rounded-xl gradient-primary shadow-glow">
        <Target className="h-5 w-5 text-primary-foreground" />
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-bold tracking-tight">LeadHunter</span>
        <span className="block text-[11px] text-muted-foreground">CRM de prospecção</span>
      </span>
    </Link>
  );
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="space-y-1">
      {links.map(({ to, label, Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
              isActive
                ? 'gradient-primary text-primary-foreground shadow-glow'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )
          }
        >
          <Icon size={18} className="shrink-0" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

export default function Layout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen lg:flex">
      {/* Sidebar — desktop */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card/60 p-4 backdrop-blur-xl lg:flex">
        <div className="px-2 py-2">
          <Brand />
        </div>
        <div className="mt-6 flex-1">
          <NavItems />
        </div>
        <div className="flex items-center justify-between border-t border-border px-1 pt-4">
          <span className="text-[11px] text-muted-foreground">v0.0.1</span>
          <ThemeToggle />
        </div>
      </aside>

      {/* Sidebar — mobile (drawer) */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 animate-fade-in bg-background/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-72 animate-slide-up flex-col border-r border-border bg-card p-4">
            <div className="flex items-center justify-between px-1">
              <Brand />
              <button
                onClick={() => setOpen(false)}
                aria-label="Fechar menu"
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mt-6 flex-1">
              <NavItems onNavigate={() => setOpen(false)} />
            </div>
            <div className="flex items-center justify-between border-t border-border px-1 pt-4">
              <span className="text-[11px] text-muted-foreground">v0.0.1</span>
              <ThemeToggle />
            </div>
          </aside>
        </div>
      )}

      {/* Conteúdo */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar — mobile */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card/70 px-4 py-3 backdrop-blur-xl lg:hidden">
          <button
            onClick={() => setOpen(true)}
            aria-label="Abrir menu"
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Menu size={22} />
          </button>
          <Brand />
          <ThemeToggle />
        </header>

        <main className="app-aurora min-h-screen flex-1 overflow-auto p-5 sm:p-8">
          <div className="mx-auto w-full max-w-7xl animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
