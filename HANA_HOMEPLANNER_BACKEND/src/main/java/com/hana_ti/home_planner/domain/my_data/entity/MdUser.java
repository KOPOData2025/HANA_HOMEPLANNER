package com.hana_ti.home_planner.domain.my_data.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "MD_USER")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MdUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "USER_ID")
    private Long userId;

    @Column(name = "NAME", length = 100)
    private String name;

    @Column(name = "CI", length = 88, unique = true)
    private String ci;

    @Column(name = "BIRTH_DATE")
    private LocalDate birthDate;

    @Column(name = "PHONE", length = 20)
    private String phone;

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;

    @Builder
    public MdUser(String name, String ci, LocalDate birthDate, String phone) {
        this.name = name;
        this.ci = ci;
        this.birthDate = birthDate;
        this.phone = phone;
        this.createdAt = LocalDateTime.now();
    }
}
