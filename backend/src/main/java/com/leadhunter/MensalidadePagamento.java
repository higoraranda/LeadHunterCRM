package com.leadhunter;

import lombok.Data;

import java.time.LocalDate;

/** Registro de uma mensalidade quitada (um ciclo). */
@Data
public class MensalidadePagamento {

    /** Vencimento do ciclo (identifica a competência). */
    private LocalDate vencimento;

    /** Data em que o cliente efetivamente pagou. */
    private LocalDate dataPagamento;

    /** Valor recebido (mensalidade + eventual multa por atraso). */
    private Double valorPago;
}
