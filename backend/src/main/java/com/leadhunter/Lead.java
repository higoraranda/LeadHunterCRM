package com.leadhunter;

import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "leads")
@Data
public class Lead {

    @Id
    private String id;

    private String nomeNegocio;

    private String telefone;
    private String siteAtual;
    private String endereco;
    private String cidade;
    private Double avaliacao;
    private Integer numeroReviews;

    private StatusSite statusSite;
    @Indexed private Nicho nicho;
    @Indexed private CategoriaServico categoriaServico;
    @Indexed private StatusNegociacao statusNegociacao;
    private Canal canalUltimoContato;

    private LocalDate dataUltimoContato;

    private String observacoes;

    @CreatedDate private LocalDateTime createdAt;
    @LastModifiedDate private LocalDateTime updatedAt;
}
