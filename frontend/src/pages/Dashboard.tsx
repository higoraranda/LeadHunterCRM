import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid, Cell as PieCell,
} from 'recharts';
import {
  Users, TrendingUp, CheckCircle2, Percent, ArrowUpRight, Trophy, Calculator, ExternalLink,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { STATUS_NEGOCIACAO, labelNicho } from '@/types';
import { STATUS_META, CATEGORIA_META } from '@/lib/status';
import { useTheme } from '@/lib/use-theme';
import { cn } from '@/lib/utils';

interface Resumo {
  totalLeads: number;
  totalFechados: number;
  totalPerdidos: number;
  totalEmAndamento: number;
  taxaConversao: number;
  leadsUltimos7Dias: number;
  porCategoria: Record<string, number>;
  porNicho: Record<string, number>;
}

export default function Dashboard() {
  const { theme } = useTheme();
  const [resumo, setResumo] = useState<Resumo | null>(null);
  const [funil, setFunil] = useState<Record<string, number>>({});

  useEffect(() => {
    Promise.all([
      api.get<Resumo>('/dashboard/resumo'),
      api.get<Record<string, number>>('/dashboard/funil'),
    ])
      .then(([r, f]) => {
        setResumo(r.data);
        setFunil(f.data);
      })
      .catch(() => toast.error('Erro ao carregar dashboard'));
  }, []);

  const axisColor = theme === 'dark' ? '#94a3b8' : '#64748b';
  const gridColor = theme === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(2,6,23,0.06)';
  const tooltipStyle = {
    background: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: 12,
    color: 'hsl(var(--foreground))',
    fontSize: 12,
    boxShadow: '0 10px 30px -12px rgba(0,0,0,0.5)',
  } as const;

  const funilData = STATUS_NEGOCIACAO.map((s) => ({
    status: STATUS_META[s].label,
    count: funil[s] ?? 0,
    fill: STATUS_META[s].hex,
  }));

  const categoriaData = Object.entries(resumo?.porCategoria ?? {}).map(([name, value]) => ({
    name: CATEGORIA_META[name as keyof typeof CATEGORIA_META]?.label ?? name,
    value,
    fill: CATEGORIA_META[name as keyof typeof CATEGORIA_META]?.hex ?? '#818cf8',
  }));

  const nichoData = Object.entries(resumo?.porNicho ?? {})
    .map(([n, v]) => ({ nicho: labelNicho(n as any), count: v }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Visão geral do seu funil de prospecção.</p>
        </div>
        <a
          href="https://project-k3a8s.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 self-start rounded-lg gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-all hover:brightness-110"
        >
          <Calculator size={18} className="shrink-0" />
          Fazer orçamento
          <ExternalLink size={14} className="opacity-80" />
        </a>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total de Leads"
          value={resumo?.totalLeads ?? 0}
          Icon={Users}
          tone="primary"
          hint={
            resumo && resumo.leadsUltimos7Dias > 0 ? (
              <span className="inline-flex items-center gap-1 text-success">
                <ArrowUpRight size={13} /> +{resumo.leadsUltimos7Dias} nos últimos 7 dias
              </span>
            ) : (
              'Base de prospecção'
            )
          }
        />
        <StatCard title="Em Andamento" value={resumo?.totalEmAndamento ?? 0} Icon={TrendingUp} tone="blue" hint="Negociações ativas" />
        <StatCard title="Fechados" value={resumo?.totalFechados ?? 0} Icon={CheckCircle2} tone="success" hint="Negócios ganhos" />
        <StatCard title="Taxa de Conversão" value={`${resumo?.taxaConversao ?? 0}%`} Icon={Percent} tone="accent" hint="Fechados / total" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Funil por status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={funilData} margin={{ top: 4, right: 8, bottom: 60, left: -8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="status" tick={{ fontSize: 10, fill: axisColor }} angle={-30} textAnchor="end" height={70} tickLine={false} axisLine={{ stroke: gridColor }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: axisColor }} tickLine={false} axisLine={false} width={32} />
                <Tooltip cursor={{ fill: gridColor }} contentStyle={tooltipStyle} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {funilData.map((d, i) => (
                    <Cell key={i} fill={d.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição por categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {categoriaData.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoriaData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={66}
                    outerRadius={104}
                    paddingAngle={3}
                    stroke="transparent"
                  >
                    {categoriaData.map((d, i) => (
                      <PieCell key={i} fill={d.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend
                    iconType="circle"
                    formatter={(v) => <span className="text-xs text-muted-foreground">{v}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Leads por nicho</CardTitle>
          <Trophy size={16} className="text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {nichoData.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(240, nichoData.length * 38)}>
              <BarChart data={nichoData} layout="vertical" margin={{ left: 90, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: axisColor }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="nicho" width={150} tick={{ fontSize: 11, fill: axisColor }} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: gridColor }} contentStyle={tooltipStyle} />
                <defs>
                  <linearGradient id="nichoBar" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#059669" />
                    <stop offset="100%" stopColor="#34d399" />
                  </linearGradient>
                </defs>
                <Bar dataKey="count" fill="url(#nichoBar)" radius={[0, 6, 6, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

const TONES: Record<string, string> = {
  primary: 'bg-primary/12 text-primary',
  blue: 'bg-blue-500/12 text-blue-500 dark:text-blue-400',
  success: 'bg-success/12 text-success',
  accent: 'bg-accent/12 text-accent',
};

function StatCard({
  title,
  value,
  Icon,
  tone,
  hint,
}: {
  title: string;
  value: number | string;
  Icon: React.ElementType;
  tone: keyof typeof TONES | string;
  hint?: React.ReactNode;
}) {
  return (
    <Card className="group relative overflow-hidden transition-shadow hover:shadow-glow">
      <CardContent className="py-5">
        <div className="flex items-start justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <span className={cn('grid h-9 w-9 place-items-center rounded-lg', TONES[tone] ?? TONES.primary)}>
            <Icon size={18} />
          </span>
        </div>
        <p className="tabular mt-3 text-3xl font-bold tracking-tight">{value}</p>
        {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}

function EmptyChart() {
  return (
    <div className="grid h-[260px] place-items-center text-sm text-muted-foreground">
      Sem dados para exibir ainda.
    </div>
  );
}
