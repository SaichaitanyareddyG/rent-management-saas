package com.rentapp.service;

import com.rentapp.model.PaymentAttempt;
import com.rentapp.model.PaymentIntent;
import com.rentapp.repository.PaymentAttemptRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * PaymentVerificationService - Multi-signal scoring engine
 * Implements confidence scoring based on multiple fraud signals
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentVerificationService {

    private final PaymentAttemptRepository attemptRepository;

    // UTR pattern validation (12 alphanumeric characters, typical format)
    private static final Pattern UTR_PATTERN = Pattern.compile("^[A-Z0-9]{10,16}$");
    private static final Pattern SUSPICIOUS_PATTERN = Pattern.compile("(.)\\1{5,}"); // Repeated chars

    // Scoring weights (total = 100)
    private static final int WEIGHT_AMOUNT_MATCH = 40;
    private static final int WEIGHT_TIME_WINDOW = 25;
    private static final int WEIGHT_UTR_UNIQUENESS = 20;
    private static final int WEIGHT_BEHAVIOR = 10;
    private static final int WEIGHT_PATTERN = 5;

    /**
     * Main verification method - calculates confidence score and explainability
     */
    public VerificationResult verify(PaymentIntent intent, String utrNumber, Double submittedAmount) {
        Map<String, Object> factors = new HashMap<>();
        int totalScore = 0;

        // 1. Amount Uniqueness Check (40 points)
        int amountScore = scoreAmountMatch(intent, submittedAmount, factors);
        totalScore += amountScore;

        // 2. Time Window Check (25 points)
        int timeScore = scoreTimeWindow(intent, factors);
        totalScore += timeScore;

        // 3. UTR Uniqueness (20 points)
        int utrScore = scoreUTRUniqueness(utrNumber, factors);
        totalScore += utrScore;

        // 4. Behavior Analysis (10 points)
        int behaviorScore = scoreBehavior(intent, factors);
        totalScore += behaviorScore;

        // 5. Pattern Validation (5 points)
        int patternScore = scorePattern(utrNumber, factors);
        totalScore += patternScore;

        // Determine status based on score
        String status = determineStatus(totalScore);
        String recommendation = getRecommendation(totalScore, factors);

        log.info("Verification result for intent {}: score={}, status={}", 
                intent.getIntentToken(), totalScore, status);

        return new VerificationResult(totalScore, status, recommendation, factors);
    }

    /**
     * Score: Amount Match (40 points)
     * Checks if submitted amount matches unique amount
     */
    private int scoreAmountMatch(PaymentIntent intent, Double submittedAmount, Map<String, Object> factors) {
        if (submittedAmount == null) {
            factors.put("amountMatch", "❌ No amount submitted");
            return 0;
        }

        Double expectedAmount = intent.getUniqueAmount();
        boolean exactMatch = Math.abs(submittedAmount - expectedAmount) < 0.01;

        if (exactMatch) {
            factors.put("amountMatch", String.format("✅ Exact match (₹%.2f)", expectedAmount));
            return WEIGHT_AMOUNT_MATCH;
        } else {
            Double baseAmount = intent.getBaseAmount();
            boolean baseMatch = Math.abs(submittedAmount - baseAmount) < 0.01;

            if (baseMatch) {
                factors.put("amountMatch", String.format("⚠️ Base amount match (expected ₹%.2f, got ₹%.2f)", 
                        expectedAmount, submittedAmount));
                return WEIGHT_AMOUNT_MATCH / 2; // 20 points
            } else {
                factors.put("amountMatch", String.format("❌ Amount mismatch (expected ₹%.2f, got ₹%.2f)", 
                        expectedAmount, submittedAmount));
                return 0;
            }
        }
    }

    /**
     * Score: Time Window (25 points)
     * 0-2 min: 25 points
     * 2-5 min: 15 points
     * 5-10 min: 5 points
     * >10 min: 0 points
     */
    private int scoreTimeWindow(PaymentIntent intent, Map<String, Object> factors) {
        Duration elapsed = Duration.between(intent.getCreatedAt(), LocalDateTime.now());
        long minutes = elapsed.toMinutes();

        if (minutes <= 2) {
            factors.put("timeWindow", String.format("✅ Very recent (%d min)", minutes));
            return WEIGHT_TIME_WINDOW;
        } else if (minutes <= 5) {
            factors.put("timeWindow", String.format("✅ Recent (%d min)", minutes));
            return 15;
        } else if (minutes <= 10) {
            factors.put("timeWindow", String.format("⚠️ Within window (%d min)", minutes));
            return 5;
        } else {
            factors.put("timeWindow", String.format("❌ Expired (%d min)", minutes));
            return 0;
        }
    }

    /**
     * Score: UTR Uniqueness (20 points)
     * Checks if UTR has been used before
     */
    private int scoreUTRUniqueness(String utrNumber, Map<String, Object> factors) {
        List<PaymentAttempt> previousAttempts = attemptRepository.findByUtrNumber(utrNumber);

        if (previousAttempts.isEmpty()) {
            factors.put("utrUniqueness", "✅ First use of UTR");
            return WEIGHT_UTR_UNIQUENESS;
        } else {
            factors.put("utrUniqueness", String.format("❌ UTR used %d time(s) before", previousAttempts.size()));
            return 0;
        }
    }

    /**
     * Score: Behavior Analysis (10 points)
     * Checks attempt frequency and patterns
     */
    private int scoreBehavior(PaymentIntent intent, Map<String, Object> factors) {
        int attemptCount = intent.getAttemptCount();

        if (attemptCount == 0) {
            factors.put("behavior", "✅ First attempt");
            return WEIGHT_BEHAVIOR;
        } else if (attemptCount <= 2) {
            factors.put("behavior", String.format("⚠️ %d attempts", attemptCount + 1));
            return WEIGHT_BEHAVIOR / 2;
        } else {
            factors.put("behavior", String.format("❌ Too many attempts (%d)", attemptCount + 1));
            return 0;
        }
    }

    /**
     * Score: Pattern Validation (5 points)
     * Validates UTR format and detects suspicious patterns
     */
    private int scorePattern(String utrNumber, Map<String, Object> factors) {
        if (utrNumber == null || utrNumber.trim().isEmpty()) {
            factors.put("pattern", "❌ Empty UTR");
            return 0;
        }

        String utr = utrNumber.trim().toUpperCase();

        // Check length
        if (utr.length() < 10 || utr.length() > 16) {
            factors.put("pattern", "❌ Invalid length");
            return 0;
        }

        // Check format
        if (!UTR_PATTERN.matcher(utr).matches()) {
            factors.put("pattern", "❌ Invalid format");
            return 0;
        }

        // Check for suspicious patterns (repeated characters)
        if (SUSPICIOUS_PATTERN.matcher(utr).find()) {
            factors.put("pattern", "❌ Suspicious pattern");
            return 0;
        }

        factors.put("pattern", "✅ Valid format");
        return WEIGHT_PATTERN;
    }

    /**
     * Determine status based on confidence score
     */
    private String determineStatus(int score) {
        if (score >= 80) {
            return "HIGH";  // Auto-approve
        } else if (score >= 50) {
            return "MEDIUM";  // Manual verification
        } else {
            return "LOW";  // Reject or flag
        }
    }

    /**
     * Get recommendation based on score and factors
     */
    private String getRecommendation(int score, Map<String, Object> factors) {
        if (score >= 80) {
            return "✅ Auto-approve recommended - High confidence";
        } else if (score >= 50) {
            return "⚠️ Manual verification required - Medium confidence";
        } else {
            return "❌ Reject or investigate - Low confidence";
        }
    }

    /**
     * Verification Result DTO
     */
    public static class VerificationResult {
        private final int confidenceScore;
        private final String status;
        private final String recommendation;
        private final Map<String, Object> factors;

        public VerificationResult(int confidenceScore, String status, String recommendation, 
                                Map<String, Object> factors) {
            this.confidenceScore = confidenceScore;
            this.status = status;
            this.recommendation = recommendation;
            this.factors = factors;
        }

        public int getConfidenceScore() { return confidenceScore; }
        public String getStatus() { return status; }
        public String getRecommendation() { return recommendation; }
        public Map<String, Object> getFactors() { return factors; }
    }
}
