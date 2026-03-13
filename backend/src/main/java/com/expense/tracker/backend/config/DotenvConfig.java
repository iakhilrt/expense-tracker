package com.expense.tracker.backend.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.PropertySourcesPlaceholderConfigurer;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import jakarta.annotation.PostConstruct;
import java.util.HashMap;
import java.util.Map;

@Configuration
public class DotenvConfig {

    private final ConfigurableEnvironment environment;

    public DotenvConfig(ConfigurableEnvironment environment) {
        this.environment = environment;
    }

    @PostConstruct
    public void init() {
        Dotenv dotenv = Dotenv.configure()
                .directory("./")
                .ignoreIfMalformed()
                .ignoreIfMissing()
                .load();

        Map<String, Object> dotEnvMap = new HashMap<>();
        dotenv.entries().forEach(entry -> dotEnvMap.put(entry.getKey(), entry.getValue()));

        environment.getPropertySources().addFirst(new MapPropertySource("dotenvProperties", dotEnvMap));
    }
}
