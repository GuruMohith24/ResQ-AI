package com.example.e_commerce.controller;

import com.example.e_commerce.model.Incident;
import com.example.e_commerce.service.IncidentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/incidents")
@CrossOrigin(origins = "*") // Allow React frontend
public class IncidentController {

    private final IncidentService incidentService;

    public IncidentController(IncidentService incidentService) {
        this.incidentService = incidentService;
    }

    // Report from TEXT - citizen types what's happening
    @PostMapping("/report/text")
    public ResponseEntity<Incident> reportFromText(@RequestBody Map<String, String> body) {
        String text = body.get("text");
        Incident incident = incidentService.reportFromText(text);
        return ResponseEntity.ok(incident);
    }

    // Report from IMAGE - citizen uploads photo
    @PostMapping("/report/image")
    public ResponseEntity<Incident> reportFromImage(@RequestBody Map<String, String> body) {
        String base64Image = body.get("image"); // base64 encoded image
        String mimeType = body.get("mimeType"); // "image/jpeg" etc
        String text = body.get("text"); // optional description
        Incident incident = incidentService.reportFromImage(base64Image, mimeType, text);
        return ResponseEntity.ok(incident);
    }

    // Get ALL incidents (admin dashboard)
    @GetMapping
    public ResponseEntity<List<Incident>> getAllIncidents() {
        return ResponseEntity.ok(incidentService.getAllIncidents());
    }

    // Get HIGH severity incidents (severity >= 7)
    @GetMapping("/high-severity")
    public ResponseEntity<List<Incident>> getHighSeverity() {
        return ResponseEntity.ok(incidentService.getHighSeverityIncidents());
    }

    // Get PENDING incidents
    @GetMapping("/pending")
    public ResponseEntity<List<Incident>> getPending() {
        return ResponseEntity.ok(incidentService.getPendingIncidents());
    }

    // Dispatch resources to an incident
    @PutMapping("/{id}/dispatch")
    public ResponseEntity<Incident> dispatch(@PathVariable Long id) {
        return ResponseEntity.ok(incidentService.dispatch(id));
    }

    // Resolve an incident
    @PutMapping("/{id}/resolve")
    public ResponseEntity<Incident> resolve(@PathVariable Long id) {
        return ResponseEntity.ok(incidentService.resolve(id));
    }
}
