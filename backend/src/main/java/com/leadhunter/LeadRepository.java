package com.leadhunter;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDateTime;

public interface LeadRepository extends MongoRepository<Lead, String>, LeadRepositoryCustom {

    long countByStatusNegociacao(StatusNegociacao s);

    long countByCreatedAtAfter(LocalDateTime dt);
}
