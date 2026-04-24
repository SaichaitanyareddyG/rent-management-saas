package com.rentapp.rentapp.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Async Configuration
 * Enables asynchronous method execution (for email sending)
 */
@Configuration
@EnableAsync
public class AsyncConfig {
}
