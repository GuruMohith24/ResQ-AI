package com.example.e_commerce.service;

import com.example.e_commerce.dto.GeminiAnalysis;
import com.example.e_commerce.model.Incident;
import com.example.e_commerce.repository.IncidentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final GeminiService geminiService;

    public IncidentService(IncidentRepository incidentRepository, GeminiService geminiService) {
        this.incidentRepository = incidentRepository;
        this.geminiService = geminiService;
    }

    // Create incident from TEXT report
    @Transactional
    public Incident reportFromText(String reporterText) {
        GeminiAnalysis analysis = geminiService.analyzeText(reporterText);
        return saveIncident(analysis, reporterText, null);
    }

    // Create incident from IMAGE + optional text
    @Transactional
    public Incident reportFromImage(String base64Image, String mimeType, String reporterText) {
        GeminiAnalysis analysis = geminiService.analyzeImageAndText(base64Image, mimeType, reporterText);
        return saveIncident(analysis, reporterText, null);
    }

    private Incident saveIncident(GeminiAnalysis analysis, String reporterText, String imageUrl) {
        Incident incident = new Incident();
        incident.setIncidentType(analysis.getIncident_type());
        incident.setSeverityScore(analysis.getSeverity_score());
        incident.setSummary(analysis.getBrief_summary());
        incident.setRequiredResources(analysis.getResources_required());
        incident.setHoax(analysis.isIs_hoax());
        incident.setReporterText(reporterText);
        incident.setImageUrl(imageUrl);
        return incidentRepository.save(incident);
    }

    public List<Incident> getAllIncidents() {
        return incidentRepository.findAll();
    }

    public List<Incident> getHighSeverityIncidents() {
        return incidentRepository.findBySeverityScoreGreaterThanEqual(7);
    }

    public List<Incident> getPendingIncidents() {
        return incidentRepository.findByStatus("PENDING");
    }

    @Transactional
    public Incident dispatch(Long id) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Incident not found: " + id));
        incident.setStatus("DISPATCHED");
        return incidentRepository.save(incident);
    }

    @Transactional
    public Incident resolve(Long id) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Incident not found: " + id));
        incident.setStatus("RESOLVED");
        return incidentRepository.save(incident);
    }
}
