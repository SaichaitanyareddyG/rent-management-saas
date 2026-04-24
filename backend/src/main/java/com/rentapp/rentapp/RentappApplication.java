package com.rentapp.rentapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableAspectJAutoProxy
@EnableAsync
@EnableScheduling  // Enable scheduled tasks for payment intent cleanup
public class RentappApplication {

	public static void main(String[] args) {
		SpringApplication.run(RentappApplication.class, args);
	}

}
