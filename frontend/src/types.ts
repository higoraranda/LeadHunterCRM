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
  createdAt?: string;
  updatedAt?: string;
}

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

export const labelNicho = (n?: Nicho) => n ? n.replaceAll('_', ' ') : '';
export const labelStatus = (s?: StatusNegociacao) => s ? s.replaceAll('_', ' ') : '';
