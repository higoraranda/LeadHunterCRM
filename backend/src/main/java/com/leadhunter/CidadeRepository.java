package com.leadhunter;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface CidadeRepository extends MongoRepository<Cidade, String> {
    Optional<Cidade> findByNomeIgnoreCase(String nome);
    boolean existsByNomeIgnoreCase(String nome);
}
