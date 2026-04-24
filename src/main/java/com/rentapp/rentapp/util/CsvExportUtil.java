package com.rentapp.rentapp.util;

import com.rentapp.rentapp.dto.*;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.util.List;

/**
 * CSV Export Utility
 * Generates CSV files from DTOs
 */
@Component
public class CsvExportUtil {
    
    /**
     * Export tenants to CSV
     */
    public byte[] exportTenantsToCsv(List<TenantResponse> tenants) {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PrintWriter writer = new PrintWriter(outputStream);
        
        // Write header
        writer.println("ID,Name,Phone,Email,Status,Property,Room,Rent Amount,Due Day,Joining Date");
        
        // Write data
        for (TenantResponse tenant : tenants) {
            writer.printf("%d,%s,%s,%s,%s,%s,%s,%.2f,%d,%s%n",
                tenant.getId(),
                escapeCsv(tenant.getName()),
                escapeCsv(tenant.getPhone()),
                escapeCsv(tenant.getEmail()),
                tenant.getStatus(),
                escapeCsv(tenant.getPropertyName()),
                escapeCsv(tenant.getRoomNumber()),
                tenant.getRentAmount(),
                tenant.getRentDueDay(),
                tenant.getJoiningDate()
            );
        }
        
        writer.flush();
        return outputStream.toByteArray();
    }
    
    /**
     * Export payments to CSV
     */
    public byte[] exportPaymentsToCsv(List<PaymentResponse> payments) {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PrintWriter writer = new PrintWriter(outputStream);
        
        // Write header
        writer.println("ID,Tenant,Property,Room,Month,Amount,Status,UTR,Notes,Created Date,Paid Date");
        
        // Write data
        for (PaymentResponse payment : payments) {
            writer.printf("%d,%s,%s,%s,%s,%.2f,%s,%s,%s,%s,%s%n",
                payment.getId(),
                escapeCsv(payment.getTenantName()),
                escapeCsv(payment.getPropertyName()),
                escapeCsv(payment.getRoomNumber()),
                payment.getMonth(),
                payment.getAmount(),
                payment.getStatus(),
                escapeCsv(payment.getUtr()),
                escapeCsv(payment.getNotes()),
                payment.getCreatedAt(),
                payment.getPaidAt() != null ? payment.getPaidAt() : ""
            );
        }
        
        writer.flush();
        return outputStream.toByteArray();
    }
    
    /**
     * Export properties to CSV
     */
    public byte[] exportPropertiesToCsv(List<PropertyResponse> properties) {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PrintWriter writer = new PrintWriter(outputStream);
        
        // Write header
        writer.println("ID,Name,Address,City,State,Pincode,UPI ID,Default Due Day,Total Rooms,Total Beds,Occupied Beds");
        
        // Write data
        for (PropertyResponse property : properties) {
            writer.printf("%d,%s,%s,%s,%s,%s,%s,%d,%d,%d,%d%n",
                property.getId(),
                escapeCsv(property.getName()),
                escapeCsv(property.getAddressLine1()),
                escapeCsv(property.getCity()),
                escapeCsv(property.getState()),
                escapeCsv(property.getPincode()),
                escapeCsv(property.getUpiId()),
                property.getDefaultRentDueDay(),
                property.getTotalRooms() != null ? property.getTotalRooms() : 0,
                property.getTotalBeds() != null ? property.getTotalBeds() : 0,
                property.getOccupiedBeds() != null ? property.getOccupiedBeds() : 0
            );
        }
        
        writer.flush();
        return outputStream.toByteArray();
    }
    
    /**
     * Export rooms to CSV
     */
    public byte[] exportRoomsToCsv(List<RoomResponse> rooms) {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PrintWriter writer = new PrintWriter(outputStream);
        
        // Write header
        writer.println("ID,Property,Room Number,Capacity,Occupied,Available Beds");
        
        // Write data
        for (RoomResponse room : rooms) {
            writer.printf("%d,%s,%s,%d,%d,%d%n",
                room.getId(),
                escapeCsv(room.getPropertyName()),
                escapeCsv(room.getRoomNumber()),
                room.getCapacity(),
                room.getOccupiedCount(),
                room.getAvailableBeds()
            );
        }
        
        writer.flush();
        return outputStream.toByteArray();
    }
    
    /**
     * Escape CSV special characters
     */
    private String escapeCsv(String value) {
        if (value == null) {
            return "";
        }
        // If value contains comma, quote, or newline, wrap in quotes and escape quotes
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
