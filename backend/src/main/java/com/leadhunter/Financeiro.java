package com.leadhunter;

import lombok.Data;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Dados financeiros de um lead FECHADO. Fica embutido no documento do Lead.
 *
 * Regras de negócio:
 *  - O setup é cobrado uma vez (à vista, 50% de entrada ou 100%).
 *  - A mensalidade é recorrente. O 1º vencimento é exatamente 30 dias após a
 *    data de entrega do site/automação; os seguintes caem todo mês no mesmo dia.
 *  - Cada mensalidade é marcada como paga manualmente. Se passar do vencimento
 *    sem pagamento, incide multa de 1% ao dia sobre o valor da mensalidade.
 */
@Data
public class Financeiro {

    private Double setupValor;
    private StatusPagamentoSetup setupStatus;

    private Double mensalidadeValor;

    /** Data em que o site/automação foi entregue. Define o 1º vencimento (+30 dias). */
    private LocalDate dataEntrega;

    /** Mensalidades já quitadas (uma por ciclo, identificadas pela data de vencimento). */
    private List<MensalidadePagamento> pagamentos = new ArrayList<>();
}
