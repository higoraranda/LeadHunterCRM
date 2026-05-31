package com.leadhunter;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@SpringBootApplication
@EnableMongoAuditing
public class LeadhunterApplication {
    public static void main(String[] args) {
        SpringApplication.run(LeadhunterApplication.class, args);
    }
}
