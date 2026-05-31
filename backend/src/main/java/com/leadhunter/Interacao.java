package com.leadhunter;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "interacoes")
@Data
public class Interacao {

    @Id
    private String id;

    @Indexed
    private String leadId;

    private LocalDateTime dataHora;

    private Canal canal;

    private String resultado;

    private String proximoPasso;
    private LocalDate dataProximoPasso;
}
