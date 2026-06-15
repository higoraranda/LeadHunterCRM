export type Nicho =
  | 'CLINICA_MEDICA' | 'CLINICA_ODONTO' | 'CLINICA_ESTETICA' | 'IMOBILIARIA'
  | 'ECOMMERCE' | 'RESTAURANTE' | 'PROFISSIONAL_LIBERAL' | 'PRESTADOR_LOCAL'
  | 'CASA_DE_FESTA' | 'CONSTRUTORA' | 'OUTRO';

export type CategoriaServico = 'AUTOMACAO' | 'SITE' | 'COMBO';

export type StatusSite = 'SIM' | 'NAO' | 'DESATUALIZADO' | 'NAO_VERIFICADO';

export type StatusNegociacao =
  | 'NAO_CONTATADO' | 'TENTATIVA_1' | 'TENTATIVA_2' | 'TENTATIVA_3'
  | 'EM_NEGOCIACAO' | 'REUNIAO_AGENDADA' | 'PROPOSTA_ENVIADA'
  | 'FECHADO' | 'PERDIDO';

export type Canal = 'COLD_CALL' | 'WHATSAPP' | 'EMAIL' | 'INSTAGRAM' | 'PRESENCIAL';

export type StatusPagamentoSetup = 'NAO_PAGO' | 'PAGO_50' | 'PAGO_100';

export interface MensalidadePagamento {
  vencimento: string;        // ISO date (yyyy-MM-dd)
  dataPagamento?: string;
  valorPago?: number;
}

export interface Financeiro {
  setupValor?: number;
  setupStatus?: StatusPagamentoSetup;
  setupDataPagamento?: string;  // ISO date — mês em que a receita do setup entra no lucro
  mensalidadeValor?: number;
  dataEntrega?: string;      // ISO date — 1º vencimento = +30 dias
  pagamentos?: MensalidadePagamento[];
}

export interface Lead {
  id: string;
  nomeNegocio: string;
  telefone?: string;
  siteAtual?: string;
  statusSite?: StatusSite;
  endereco?: string;
  cidade?: string;
  avaliacao?: number;
  numeroReviews?: number;
  nicho?: Nicho;
  categoriaServico?: CategoriaServico;
  statusNegociacao?: StatusNegociacao;
  canalUltimoContato?: Canal;
  dataUltimoContato?: string;
  observacoes?: string;
  financeiro?: Financeiro;
  createdAt?: string;
  updatedAt?: string;
}

export interface Despesa {
  id: string;
  descricao?: string;
  valor: number;
  data: string;              // ISO date
}

export interface CobrancaItem {
  leadId: string;
  nome: string;
  cidade?: string;
  servico?: CategoriaServico;
  vencimento: string;
  mensalidade: number;
  diasAtraso: number;
  multa: number;
  totalDevido: number;
  situacao: 'ABERTO' | 'VENCE_HOJE' | 'ATRASADO';
}

export interface ClienteReceita {
  leadId: string;
  nome: string;
  servico?: CategoriaServico;
  setup: number;
  mensalidades: number;
  total: number;
}

export interface ResumoMes {
  mes: string;
  receitaSetup: number;
  receitaMensalidades: number;
  receitaTotal: number;
  despesas: number;
  lucro: number;
  roi: number | null;
  mrrAtivo: number;
  porCliente: ClienteReceita[];
  porServico: Record<string, number>;
}

export interface SeriePonto {
  mes: string;
  receita: number;
  despesas: number;
  lucro: number;
  roi: number | null;
}

export interface CidadePasta { nome: string; total: number; }
export interface NichoPasta { nicho: Nicho; total: number; label?: string; }

export interface Interacao {
  id: string;
  leadId: string;
  dataHora: string;
  canal: Canal;
  resultado?: string;
  proximoPasso?: string;
  dataProximoPasso?: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export const NICHOS: Nicho[] = [
  'CLINICA_MEDICA', 'CLINICA_ODONTO', 'CLINICA_ESTETICA', 'IMOBILIARIA',
  'ECOMMERCE', 'RESTAURANTE', 'PROFISSIONAL_LIBERAL', 'PRESTADOR_LOCAL',
  'CASA_DE_FESTA', 'CONSTRUTORA', 'OUTRO',
];

export const STATUS_NEGOCIACAO: StatusNegociacao[] = [
  'NAO_CONTATADO', 'TENTATIVA_1', 'TENTATIVA_2', 'TENTATIVA_3',
  'EM_NEGOCIACAO', 'REUNIAO_AGENDADA', 'PROPOSTA_ENVIADA',
  'FECHADO', 'PERDIDO',
];

export const CATEGORIAS: CategoriaServico[] = ['AUTOMACAO', 'SITE', 'COMBO'];
export const STATUS_SITE: StatusSite[] = ['SIM', 'NAO', 'DESATUALIZADO', 'NAO_VERIFICADO'];
export const CANAIS: Canal[] = ['COLD_CALL', 'WHATSAPP', 'EMAIL', 'INSTAGRAM', 'PRESENCIAL'];
export const STATUS_PAGAMENTO_SETUP: StatusPagamentoSetup[] = ['NAO_PAGO', 'PAGO_50', 'PAGO_100'];

/** Pasta virtual dos leads sem cidade (deve casar com o backend). */
export const SEM_CIDADE = '__SEM_CIDADE__';

export const labelNicho = (n?: Nicho) => n ? n.replaceAll('_', ' ') : '';
export const labelStatus = (s?: StatusNegociacao) => s ? s.replaceAll('_', ' ') : '';
export const labelSetupStatus = (s?: StatusPagamentoSetup) =>
  s === 'PAGO_100' ? 'Pago 100%' : s === 'PAGO_50' ? 'Pago 50%' : s === 'NAO_PAGO' ? 'Não pago' : '';
