package com.rentapp.rentapp.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Email Service
 * Sends notification emails asynchronously
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    
    private final JavaMailSender mailSender;
    
    @Value("${app.mail.from}")
    private String fromEmail;
    
    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;
    
    /**
     * Send email asynchronously
     */
    @Async
    public void sendEmail(String to, String subject, String body) {
        if (!mailEnabled) {
            log.info("Email disabled. Would send to: {}, subject: {}", to, subject);
            return;
        }
        
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            
            mailSender.send(message);
            log.info("Email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to: {}, error: {}", to, e.getMessage());
        }
    }
    
    /**
     * Send payment notification to owner
     */
    public void sendPaymentNotification(String ownerEmail, String tenantName, 
                                       String month, double amount, String utr) {
        String subject = "💰 New Payment Received - ₹" + String.format("%.2f", amount);
        
        String body = String.format("""
            Dear Owner,
            
            A new payment has been submitted and is awaiting your verification.
            
            Payment Details:
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            Tenant: %s
            Month: %s
            Amount: ₹%.2f
            UTR Number: %s
            Status: PENDING VERIFICATION
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            
            Please login to your dashboard to verify this payment:
            https://rent-management-saas.vercel.app/payments
            
            Thank you,
            RentApp Team
            """, tenantName, month, amount, utr);
        
        sendEmail(ownerEmail, subject, body);
    }
}
