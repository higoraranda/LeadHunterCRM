package com.leadhunter;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;

import java.util.List;
import java.util.regex.Pattern;

@RequiredArgsConstructor
public class LeadRepositoryImpl implements LeadRepositoryCustom {

    private final MongoTemplate mongo;

    private Query montarQuery(String busca, Nicho nicho, String cidade,
                              StatusNegociacao status, CategoriaServico categoria,
                              StatusSite statusSite) {
        Query q = new Query();
        if (busca != null && !busca.isBlank())
            q.addCriteria(Criteria.where("nomeNegocio").regex(Pattern.quote(busca), "i"));
        if ("__SEM_CIDADE__".equals(cidade))
            q.addCriteria(new Criteria().orOperator(
                    Criteria.where("cidade").is(null), Criteria.where("cidade").is("")));
        else if (cidade != null && !cidade.isBlank())
            q.addCriteria(Criteria.where("cidade").regex("^" + Pattern.quote(cidade) + "$", "i"));
        if (nicho != null) q.addCriteria(Criteria.where("nicho").is(nicho));
        if (status != null) q.addCriteria(Criteria.where("statusNegociacao").is(status));
        if (categoria != null) q.addCriteria(Criteria.where("categoriaServico").is(categoria));
        if (statusSite != null) q.addCriteria(Criteria.where("statusSite").is(statusSite));
        return q;
    }

    @Override
    public Page<Lead> filtrar(String busca, Nicho nicho, String cidade,
                              StatusNegociacao status, CategoriaServico categoria,
                              StatusSite statusSite, Pageable pageable) {
        Query q = montarQuery(busca, nicho, cidade, status, categoria, statusSite);
        long total = mongo.count(q, Lead.class);
        q.with(pageable);
        List<Lead> conteudo = mongo.find(q, Lead.class);
        return new PageImpl<>(conteudo, pageable, total);
    }

    @Override
    public List<Lead> filtrarLista(String busca, Nicho nicho, String cidade,
                                   StatusNegociacao status, CategoriaServico categoria,
                                   StatusSite statusSite) {
        return mongo.find(montarQuery(busca, nicho, cidade, status, categoria, statusSite), Lead.class);
    }
}
