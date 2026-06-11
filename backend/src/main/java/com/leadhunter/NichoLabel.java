package com.leadhunter;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Nome customizado de uma pasta de nicho. O nicho em si é um enum fixo;
 * este documento guarda apenas o "apelido" que o usuário deu à pasta.
 * Sem registro aqui, a pasta usa o nome padrão derivado do enum.
 */
@Document(collection = "nicho_labels")
@Data
public class NichoLabel {

    @Id
    private String id;

    @Indexed(unique = true)
    private Nicho nicho;

    private String label;
}
