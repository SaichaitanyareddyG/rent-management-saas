package com.rentapp.rentapp.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "owners")
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "properties")
public class Owner {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    @Column(nullable = false)
    private String phone;
    
    @Column
    @Enumerated(EnumType.STRING)
    private AuthProvider authProvider = AuthProvider.STANDARD;
    
    @Column(unique = true)
    private String googleId;
    
    @Column
    private Boolean profileComplete = true;
    
    @Column
    private String resetToken;
    
    @Column
    private LocalDateTime resetTokenExpiry;
    
    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Property> properties = new ArrayList<>();
}
