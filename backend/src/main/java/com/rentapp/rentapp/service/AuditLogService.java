package com.rentapp.rentapp.service;

import com.rentapp.rentapp.entity.AuditLog;
import com.rentapp.rentapp.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * AuditLogService - Manages audit log operations
 * Uses async processing to not impact request performance
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogService {
    
    private final AuditLogRepository auditLogRepository;
    
    /**
     * Save audit log asynchronously
     * Won't block the main request thread
     */
    @Async
    @Transactional
    public void saveAuditLog(AuditLog auditLog) {
        try {
            auditLogRepository.save(auditLog);
            log.debug("Audit log saved: RequestId={}, Action={}", 
                     auditLog.getRequestId(), auditLog.getAction());
        } catch (Exception e) {
            log.error("Failed to save audit log: {}", e.getMessage());
        }
    }
    
    /**
     * Get audit logs for an owner
     */
    @Transactional(readOnly = true)
    public List<AuditLog> getOwnerAuditLogs(Long ownerId) {
        return auditLogRepository.findByOwnerId(ownerId);
    }
    
    /**
     * Get audit logs for date range
     */
    @Transactional(readOnly = true)
    public List<AuditLog> getAuditLogsByDateRange(Long ownerId, LocalDateTime start, LocalDateTime end) {
        return auditLogRepository.findByOwnerIdAndTimestampBetween(ownerId, start, end);
    }
    
    /**
     * Get recent audit logs
     */
    @Transactional(readOnly = true)
    public List<AuditLog> getRecentLogs() {
        return auditLogRepository.findTop100ByOrderByTimestampDesc();
    }
    
    /**
     * Get failed requests
     */
    @Transactional(readOnly = true)
    public List<AuditLog> getFailedRequests() {
        return auditLogRepository.findByErrorMessageIsNotNull();
    }
}
