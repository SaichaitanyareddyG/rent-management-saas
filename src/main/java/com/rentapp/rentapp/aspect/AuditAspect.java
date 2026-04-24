package com.rentapp.rentapp.aspect;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rentapp.rentapp.entity.AuditLog;
import com.rentapp.rentapp.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.slf4j.MDC;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;

/**
 * AuditAspect - Saves user actions to database for audit trail
 */
@Aspect
@Component
@Slf4j
@RequiredArgsConstructor
public class AuditAspect {
    
    private final AuditLogService auditLogService;
    private final ObjectMapper objectMapper;
    
    /**
     * Pointcut for all controller methods
     */
    @Pointcut("execution(* com.rentapp.rentapp.controller..*(..))")
    public void controllerMethods() {}
    
    /**
     * Audit all controller method calls
     */
    @Around("controllerMethods()")
    public Object auditRequest(ProceedingJoinPoint joinPoint) throws Throwable {
        HttpServletRequest request = getCurrentRequest();
        long startTime = System.currentTimeMillis();
        
        AuditLog auditLog = new AuditLog();
        auditLog.setRequestId(MDC.get("requestId"));
        
        if (request != null) {
            auditLog.setHttpMethod(request.getMethod());
            auditLog.setEndpoint(request.getRequestURI());
            auditLog.setAction(joinPoint.getSignature().getName());
            auditLog.setIpAddress(MDC.get("clientIp"));
            auditLog.setUserAgent(MDC.get("userAgent"));
            
            // Get user info from MDC
            String userEmail = MDC.get("userId");
            String ownerIdStr = MDC.get("ownerId");
            
            if (userEmail != null) {
                auditLog.setUserEmail(userEmail);
            }
            
            if (ownerIdStr != null && !ownerIdStr.equals("null")) {
                try {
                    auditLog.setOwnerId(Long.parseLong(ownerIdStr));
                } catch (NumberFormatException e) {
                    // Ignore
                }
            }
            
            // Capture request data (excluding sensitive info)
            Object[] args = joinPoint.getArgs();
            if (args != null && args.length > 0) {
                try {
                    String requestData = objectMapper.writeValueAsString(args);
                    // Mask sensitive data
                    requestData = maskSensitiveData(requestData);
                    // Limit size
                    if (requestData.length() > 2000) {
                        requestData = requestData.substring(0, 2000);
                    }
                    auditLog.setRequestData(requestData);
                } catch (Exception e) {
                    // Ignore
                }
            }
        }
        
        try {
            Object result = joinPoint.proceed();
            
            long executionTime = System.currentTimeMillis() - startTime;
            auditLog.setExecutionTimeMs(executionTime);
            
            // Extract HTTP status from ResponseEntity
            if (result instanceof ResponseEntity) {
                ResponseEntity<?> response = (ResponseEntity<?>) result;
                auditLog.setResponseStatus(response.getStatusCode().value());
            } else {
                auditLog.setResponseStatus(200);
            }
            
            // Save audit log asynchronously
            auditLogService.saveAuditLog(auditLog);
            
            return result;
            
        } catch (Exception e) {
            long executionTime = System.currentTimeMillis() - startTime;
            auditLog.setExecutionTimeMs(executionTime);
            auditLog.setResponseStatus(500);
            auditLog.setErrorMessage(e.getMessage());
            
            // Save audit log even on error
            auditLogService.saveAuditLog(auditLog);
            
            throw e;
        }
    }
    
    private HttpServletRequest getCurrentRequest() {
        ServletRequestAttributes attributes = 
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        return attributes != null ? attributes.getRequest() : null;
    }
    
    private String maskSensitiveData(String data) {
        if (data == null) return null;
        
        data = data.replaceAll("(\"password\"\\s*:\\s*\")([^\"]+)(\")", "$1***$3");
        data = data.replaceAll("(\"token\"\\s*:\\s*\")([^\"]+)(\")", "$1***$3");
        
        return data;
    }
}
