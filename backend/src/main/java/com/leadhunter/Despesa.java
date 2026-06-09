package com.leadhunter;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

/** Gasto/investimento lançado pelo usuário, usado no cálculo de ROI mensal. */
@Document(collection = "despesas")
@Data
public class Despesa {

    @Id
    private String id;

    private String descricao;

    private Double valor;

    /** Data do gasto. O mês (YYYY-MM) é derivado dela no dashboard. */
    @Indexed
    private LocalDate data;
}
