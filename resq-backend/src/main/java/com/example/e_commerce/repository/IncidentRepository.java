package com.example.e_commerce.repository;

import com.example.e_commerce.model.Incident;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IncidentRepository extends JpaRepository<Incident, Long> {
    List<Incident> findByStatus(String status);

    List<Incident> findBySeverityScoreGreaterThanEqual(int score);

    List<Incident> findByIncidentType(String type);
}
