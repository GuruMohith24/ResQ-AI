package com.example.e_commerce.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "incidents")
public class Incident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String incidentType;       // Fire, Flood, Earthquake, Medical

    private int severityScore;         // 1-10

    private String summary;

    @ElementCollection
    @CollectionTable(name = "incident_resources", joinColumns = @JoinColumn(name = "incident_id"))
    @Column(name = "resource")
    private List<String> requiredResources;

    private String imageUrl;           // uploaded image path/url

    private String reporterText;       // raw text from citizen

    private boolean isHoax;

    private String status;             // PENDING, DISPATCHED, RESOLVED

    private LocalDateTime timestamp;

    @PrePersist
    public void prePersist() {
        this.timestamp = LocalDateTime.now();
        if (this.status == null) this.status = "PENDING";
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getIncidentType() { return incidentType; }
    public void setIncidentType(String incidentType) { this.incidentType = incidentType; }

    public int getSeverityScore() { return severityScore; }
    public void setSeverityScore(int severityScore) { this.severityScore = severityScore; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public List<String> getRequiredResources() { return requiredResources; }
    public void setRequiredResources(List<String> requiredResources) { this.requiredResources = requiredResources; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getReporterText() { return reporterText; }
    public void setReporterText(String reporterText) { this.reporterText = reporterText; }

    public boolean isHoax() { return isHoax; }
    public void setHoax(boolean hoax) { isHoax = hoax; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
