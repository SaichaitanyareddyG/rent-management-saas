package com.rentapp.rentapp.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "rooms")
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"property", "tenants"})
public class Room {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String roomNumber;
    
    @Column(nullable = false)
    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;
    
    @Column(nullable = false)
    @Min(value = 0, message = "Occupied count cannot be negative")
    private Integer occupiedCount = 0;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    @JsonBackReference
    private Property property;
    
    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<Tenant> tenants = new ArrayList<>();
    
    /**
     * Calculate available beds in this room
     * @return number of available beds
     */
    public Integer getAvailableBeds() {
        return capacity - occupiedCount;
    }
    
    /**
     * Check if room is full
     * @return true if no beds available
     */
    public boolean isFull() {
        return occupiedCount >= capacity;
    }
    
    /**
     * Increment occupied count (when tenant is added)
     * @throws IllegalStateException if room is already full
     */
    public void incrementOccupied() {
        if (isFull()) {
            throw new IllegalStateException("Room is already full. Cannot add more tenants.");
        }
        this.occupiedCount++;
    }
    
    /**
     * Decrement occupied count (when tenant is removed)
     * @throws IllegalStateException if occupied count is already 0
     */
    public void decrementOccupied() {
        if (this.occupiedCount <= 0) {
            throw new IllegalStateException("Occupied count is already 0. Cannot decrement.");
        }
        this.occupiedCount--;
    }
}
