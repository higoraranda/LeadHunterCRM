package com.leadhunter;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface NichoLabelRepository extends MongoRepository<NichoLabel, String> {
    Optional<NichoLabel> findByNicho(Nicho nicho);
}
