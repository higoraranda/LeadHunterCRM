package com.leadhunter;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * "Pasta" de cidade criada pelo usuário. Permite ter uma cidade visível na
 * navegação mesmo antes de existir qualquer lead nela (ex.: criar a pasta e
 * só depois importar o CSV daquela cidade).
 */
@Document(collection = "cidades")
@Data
public class Cidade {

    @Id
    private String id;

    @Indexed(unique = true)
    private String nome;
}
