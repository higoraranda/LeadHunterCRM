package com.leadhunter;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface InteracaoRepository extends MongoRepository<Interacao, String> {
    List<Interacao> findByLeadIdOrderByDataHoraDesc(String leadId);
    void deleteByLeadId(String leadId);
}
