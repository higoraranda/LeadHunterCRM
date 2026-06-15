package com.leadhunter;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.*;

/**
 * Centraliza as regras financeiras: geração dos vencimentos das mensalidades,
 * multa por atraso (1% ao dia), cobranças em aberto e os resumos mensais (ROI).
 */
@Service
@RequiredArgsConstructor
public class FinanceiroService {

    /** Dias após a entrega para o 1º vencimento da mensalidade. */
    private static final int DIAS_PRIMEIRO_VENCIMENTO = 30;
    /** Multa diária sobre a mensalidade em atraso (1% ao dia). */
    private static final double MULTA_DIA = 0.01;

    private final LeadRepository leadRepo;
    private final DespesaRepository despesaRepo;

    // ---------- Helpers de regra ----------

    static double fracaoSetup(StatusPagamentoSetup s) {
        if (s == null) return 0.0;
        return switch (s) {
            case PAGO_100 -> 1.0;
            case PAGO_50 -> 0.5;
            case NAO_PAGO -> 0.0;
        };
    }

    /** Vencimentos do 1º (entrega+30) até a data limite, recorrência mensal. */
    static List<LocalDate> vencimentosAte(LocalDate dataEntrega, LocalDate limite) {
        List<LocalDate> out = new ArrayList<>();
        if (dataEntrega == null || limite == null) return out;
        LocalDate venc = dataEntrega.plusDays(DIAS_PRIMEIRO_VENCIMENTO);
        int n = 0;
        while (!venc.isAfter(limite)) {
            out.add(venc);
            venc = dataEntrega.plusDays(DIAS_PRIMEIRO_VENCIMENTO).plusMonths(++n);
        }
        return out;
    }

    static LocalDate proximoVencimento(LocalDate dataEntrega, LocalDate hoje) {
        if (dataEntrega == null) return null;
        LocalDate venc = dataEntrega.plusDays(DIAS_PRIMEIRO_VENCIMENTO);
        int n = 0;
        while (venc.isBefore(hoje)) venc = dataEntrega.plusDays(DIAS_PRIMEIRO_VENCIMENTO).plusMonths(++n);
        return venc;
    }

    /** Multa acumulada de uma mensalidade vencida e ainda não paga até `referencia`. */
    static double multa(double mensalidade, LocalDate vencimento, LocalDate referencia) {
        long atraso = diasAtraso(vencimento, referencia);
        return atraso <= 0 ? 0.0 : round2(mensalidade * MULTA_DIA * atraso);
    }

    static long diasAtraso(LocalDate vencimento, LocalDate referencia) {
        if (vencimento == null || referencia == null || !referencia.isAfter(vencimento)) return 0;
        return ChronoUnit.DAYS.between(vencimento, referencia);
    }

    /** Valor a receber numa quitação feita em `dataPagamento` (mensalidade + multa). */
    double valorComMulta(double mensalidade, LocalDate vencimento, LocalDate dataPagamento) {
        return round2(mensalidade + multa(mensalidade, vencimento, dataPagamento));
    }

    private static boolean pago(Financeiro f, LocalDate vencimento) {
        if (f.getPagamentos() == null) return false;
        return f.getPagamentos().stream()
                .anyMatch(p -> vencimento.equals(p.getVencimento()));
    }

    private List<Lead> fechadosComFinanceiro() {
        List<Lead> out = new ArrayList<>();
        for (Lead l : leadRepo.findAll()) {
            if (l.getStatusNegociacao() == StatusNegociacao.FECHADO && l.getFinanceiro() != null)
                out.add(l);
        }
        return out;
    }

    // ---------- Cobranças (mensalidades em aberto / vencidas) ----------

    public List<Cobranca> cobrancas(LocalDate hoje) {
        List<Cobranca> out = new ArrayList<>();
        for (Lead l : fechadosComFinanceiro()) {
            Financeiro f = l.getFinanceiro();
            Double m = f.getMensalidadeValor();
            if (m == null || m <= 0 || f.getDataEntrega() == null) continue;
            for (LocalDate venc : vencimentosAte(f.getDataEntrega(), hoje)) {
                if (pago(f, venc)) continue;
                long atraso = diasAtraso(venc, hoje);
                double multa = multa(m, venc, hoje);
                String situacao = venc.isEqual(hoje) ? "VENCE_HOJE" : (atraso > 0 ? "ATRASADO" : "ABERTO");
                out.add(new Cobranca(l.getId(), l.getNomeNegocio(), l.getCidade(),
                        l.getCategoriaServico(), venc, round2(m), atraso, multa, round2(m + multa), situacao));
            }
        }
        out.sort(Comparator.comparing(Cobranca::vencimento));
        return out;
    }

    // ---------- Resumo mensal + ROI ----------

    public ResumoMes resumoMes(YearMonth mes) {
        double receitaSetup = 0, receitaMensalidades = 0;
        Map<String, double[]> porClienteAcc = new LinkedHashMap<>(); // leadId -> [setup, mensalidades]
        Map<String, ClienteInfo> info = new LinkedHashMap<>();
        Map<String, Double> porServico = new LinkedHashMap<>();
        double mrrAtivo = 0;

        for (Lead l : fechadosComFinanceiro()) {
            Financeiro f = l.getFinanceiro();
            String servico = l.getCategoriaServico() != null ? l.getCategoriaServico().name() : "OUTRO";

            // Setup reconhecido no mês em que o pagamento foi marcado (pago 50% / 100%).
            // Registros antigos sem essa data caem no mês da entrega (compatibilidade).
            double setupMes = 0;
            LocalDate dataSetup = f.getSetupDataPagamento() != null ? f.getSetupDataPagamento() : f.getDataEntrega();
            if (dataSetup != null && YearMonth.from(dataSetup).equals(mes)
                    && f.getSetupValor() != null) {
                setupMes = round2(f.getSetupValor() * fracaoSetup(f.getSetupStatus()));
            }

            // Mensalidades pagas dentro do mês
            double mensMes = 0;
            if (f.getPagamentos() != null) {
                for (MensalidadePagamento p : f.getPagamentos()) {
                    if (p.getDataPagamento() != null && YearMonth.from(p.getDataPagamento()).equals(mes)) {
                        double v = p.getValorPago() != null ? p.getValorPago()
                                : (f.getMensalidadeValor() != null ? f.getMensalidadeValor() : 0);
                        mensMes += v;
                    }
                }
            }

            if (f.getMensalidadeValor() != null) mrrAtivo += f.getMensalidadeValor();

            if (setupMes != 0 || mensMes != 0) {
                receitaSetup += setupMes;
                receitaMensalidades += mensMes;
                porClienteAcc.computeIfAbsent(l.getId(), k -> new double[2]);
                double[] acc = porClienteAcc.get(l.getId());
                acc[0] += setupMes;
                acc[1] += mensMes;
                info.put(l.getId(), new ClienteInfo(l.getNomeNegocio(), l.getCategoriaServico()));
                porServico.merge(servico, round2(setupMes + mensMes), Double::sum);
            }
        }

        double despesas = 0;
        for (Despesa d : despesaRepo.findAll()) {
            if (d.getData() != null && YearMonth.from(d.getData()).equals(mes) && d.getValor() != null)
                despesas += d.getValor();
        }

        double receitaTotal = round2(receitaSetup + receitaMensalidades);
        despesas = round2(despesas);
        double lucro = round2(receitaTotal - despesas);
        Double roi = despesas > 0 ? round2((lucro / despesas) * 100.0) : null;

        List<ClienteReceita> porCliente = new ArrayList<>();
        porClienteAcc.forEach((id, acc) -> {
            ClienteInfo ci = info.get(id);
            porCliente.add(new ClienteReceita(id, ci.nome(), ci.servico(),
                    round2(acc[0]), round2(acc[1]), round2(acc[0] + acc[1])));
        });
        porCliente.sort(Comparator.comparingDouble(ClienteReceita::total).reversed());

        return new ResumoMes(mes.toString(), round2(receitaSetup), round2(receitaMensalidades),
                receitaTotal, despesas, lucro, roi, round2(mrrAtivo), porCliente, porServico);
    }

    /** Série dos últimos `meses` meses (mais antigo -> mais novo) para o gráfico. */
    public List<SeriePonto> serie(YearMonth ate, int meses) {
        List<SeriePonto> out = new ArrayList<>();
        for (int i = meses - 1; i >= 0; i--) {
            YearMonth ym = ate.minusMonths(i);
            ResumoMes r = resumoMes(ym);
            out.add(new SeriePonto(ym.toString(), r.receitaTotal(), r.despesas(), r.lucro(), r.roi()));
        }
        return out;
    }

    static double round2(double v) { return Math.round(v * 100.0) / 100.0; }

    // ---------- DTOs ----------

    public record Cobranca(String leadId, String nome, String cidade, CategoriaServico servico,
                           LocalDate vencimento, double mensalidade, long diasAtraso,
                           double multa, double totalDevido, String situacao) {}

    public record ClienteReceita(String leadId, String nome, CategoriaServico servico,
                                 double setup, double mensalidades, double total) {}

    public record ResumoMes(String mes, double receitaSetup, double receitaMensalidades, double receitaTotal,
                            double despesas, double lucro, Double roi, double mrrAtivo,
                            List<ClienteReceita> porCliente, Map<String, Double> porServico) {}

    public record SeriePonto(String mes, double receita, double despesas, double lucro, Double roi) {}

    private record ClienteInfo(String nome, CategoriaServico servico) {}
}
