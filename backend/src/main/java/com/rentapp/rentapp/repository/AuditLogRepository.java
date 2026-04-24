package com.rentapp.rentapp.repository;

import com.rentapp.rentapp.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    
    // Find logs by owner
    List<AuditLog> findByOwnerId(Long ownerId);
    
    // Find logs by action
    List<AuditLog> findByAction(String action);
    
    // Find logs by owner and date range
    List<AuditLog> findByOwnerIdAndTimestampBetween(Long ownerId, LocalDateTime start, LocalDateTime end);
    
    // Find recent logs
    List<AuditLog> findTop100ByOrderByTimestampDesc();
    
    // Find failed requests
    List<AuditLog> findByErrorMessageIsNotNull();
}
