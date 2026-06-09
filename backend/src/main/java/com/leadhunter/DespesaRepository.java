package com.leadhunter;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface DespesaRepository extends MongoRepository<Despesa, String> {
}
