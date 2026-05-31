package com.leadhunter;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/** Consultas dinâmicas (filtros opcionais combináveis) implementadas via MongoTemplate. */
public interface LeadRepositoryCustom {

    Page<Lead> filtrar(String busca, Nicho nicho, String cidade,
                       StatusNegociacao status, CategoriaServico categoria,
                       StatusSite statusSite, Pageable pageable);

    List<Lead> filtrarLista(String busca, Nicho nicho, String cidade,
                            StatusNegociacao status, CategoriaServico categoria,
                            StatusSite statusSite);
}
