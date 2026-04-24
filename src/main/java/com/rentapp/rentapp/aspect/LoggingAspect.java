package com.rentapp.rentapp.aspect;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;

/**
 * LoggingAspect - Centralized logging for all API requests
 * 
 * Logs:
 * - User information (from JWT)
 * - Request details (method, endpoint, parameters)
 * - Response status and time taken
 * - Exceptions
 */
@Aspect
@Component
@Slf4j
@RequiredArgsConstructor
public class LoggingAspect {
    
    private final ObjectMapper objectMapper;
    
    /**
     * Pointcut for all controller methods
     */
    @Pointcut("execution(* com.rentapp.rentapp.controller..*(..))")
    public void controllerMethods() {}
    
    /**
     * Log before controller method execution
     */
    @Before("controllerMethods()")
    public void logBeforeRequest(JoinPoint joinPoint) {
        HttpServletRequest request = getCurrentRequest();
        
        if (request != null) {
            String method = request.getMethod();
            String uri = request.getRequestURI();
            String userId = MDC.get("userId");
            String ownerId = MDC.get("ownerId");
            
            log.info("=== REQUEST START === Method: {} | URI: {} | User: {} | OwnerId: {} | Class: {} | Method: {}",
                    method, uri, userId, ownerId, 
                    joinPoint.getSignature().getDeclaringTypeName(),
                    joinPoint.getSignature().getName());
            
            // Log request parameters (excluding sensitive data)
            Object[] args = joinPoint.getArgs();
            if (args != null && args.length > 0) {
                for (int i = 0; i < args.length; i++) {
                    Object arg = args[i];
                    if (arg != null && !isSensitiveType(arg)) {
                        try {
                            String argJson = objectMapper.writeValueAsString(arg);
                            // Mask password if present
                            argJson = maskSensitiveData(argJson);
                            log.debug("Request Param [{}]: {}", i, argJson);
                        } catch (Exception e) {
                            log.debug("Request Param [{}]: {}", i, arg.getClass().getSimpleName());
                        }
                    }
                }
            }
        }
    }
    
    /**
     * Log around controller method execution (captures response and execution time)
     */
    @Around("controllerMethods()")
    public Object logAroundRequest(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();
        String requestId = MDC.get("requestId");
        
        try {
            Object result = joinPoint.proceed();
            
            long executionTime = System.currentTimeMillis() - startTime;
            
            log.info("=== REQUEST SUCCESS === RequestId: {} | Execution Time: {}ms",
                    requestId, executionTime);
            
            return result;
            
        } catch (Exception e) {
            long executionTime = System.currentTimeMillis() - startTime;
            
            log.error("=== REQUEST FAILED === RequestId: {} | Execution Time: {}ms | Error: {}",
                    requestId, executionTime, e.getMessage());
            
            throw e;
        }
    }
    
    /**
     * Log after successful controller method execution
     */
    @AfterReturning(pointcut = "controllerMethods()", returning = "result")
    public void logAfterSuccess(JoinPoint joinPoint, Object result) {
        String requestId = MDC.get("requestId");
        
        if (result != null) {
            try {
                String responseJson = objectMapper.writeValueAsString(result);
                // Limit response size in logs
                if (responseJson.length() > 1000) {
                    responseJson = responseJson.substring(0, 1000) + "... (truncated)";
                }
                log.debug("Response for RequestId {}: {}", requestId, responseJson);
            } catch (Exception e) {
                log.debug("Response for RequestId {}: {}", requestId, result.getClass().getSimpleName());
            }
        }
    }
    
    /**
     * Log after exception in controller method
     */
    @AfterThrowing(pointcut = "controllerMethods()", throwing = "exception")
    public void logAfterException(JoinPoint joinPoint, Exception exception) {
        String requestId = MDC.get("requestId");
        String userId = MDC.get("userId");
        
        log.error("=== EXCEPTION === RequestId: {} | User: {} | Method: {} | Exception: {} | Message: {}",
                requestId, userId, joinPoint.getSignature().getName(),
                exception.getClass().getSimpleName(), exception.getMessage(), exception);
    }
    
    /**
     * Get current HTTP request from context
     */
    private HttpServletRequest getCurrentRequest() {
        ServletRequestAttributes attributes = 
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        return attributes != null ? attributes.getRequest() : null;
    }
    
    /**
     * Check if argument type should be excluded from logging
     */
    private boolean isSensitiveType(Object arg) {
        String className = arg.getClass().getName();
        return className.contains("HttpServlet") || 
               className.contains("MultipartFile") ||
               className.contains("InputStream");
    }
    
    /**
     * Mask sensitive data in JSON strings
     */
    private String maskSensitiveData(String json) {
        if (json == null) return null;
        
        // Mask password fields
        json = json.replaceAll("(\"password\"\\s*:\\s*\")([^\"]+)(\")", "$1***MASKED***$3");
        json = json.replaceAll("(\"token\"\\s*:\\s*\")([^\"]+)(\")", "$1***MASKED***$3");
        
        return json;
    }
}
