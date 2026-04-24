package com.rentapp.rentapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Response DTO for payment verification results
 * Contains confidence score and explainability factors
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerificationScoreResponse {
    private Integer confidenceScore;  // 0-100
    private String status;  // HIGH, MEDIUM, LOW
    private String recommendation;  // What admin should do
    private Map<String, Object> factors;  // Detailed scoring breakdown
    private Boolean autoApproved;  // If score >= 80
}
