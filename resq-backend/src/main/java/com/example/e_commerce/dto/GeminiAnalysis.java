package com.example.e_commerce.dto;

import java.util.List;

// This maps exactly to what Gemini returns as JSON
public class GeminiAnalysis {

    private String incident_type; // Fire, Flood, Earthquake, Medical
    private int severity_score; // 1-10
    private boolean casualties_suspected;
    private List<String> resources_required;
    private String brief_summary;
    private boolean is_hoax;

    // Getters and Setters
    public String getIncident_type() {
        return incident_type;
    }

    public void setIncident_type(String incident_type) {
        this.incident_type = incident_type;
    }

    public int getSeverity_score() {
        return severity_score;
    }

    public void setSeverity_score(int severity_score) {
        this.severity_score = severity_score;
    }

    public boolean isCasualties_suspected() {
        return casualties_suspected;
    }

    public void setCasualties_suspected(boolean casualties_suspected) {
        this.casualties_suspected = casualties_suspected;
    }

    public List<String> getResources_required() {
        return resources_required;
    }

    public void setResources_required(List<String> resources_required) {
        this.resources_required = resources_required;
    }

    public String getBrief_summary() {
        return brief_summary;
    }

    public void setBrief_summary(String brief_summary) {
        this.brief_summary = brief_summary;
    }

    public boolean isIs_hoax() {
        return is_hoax;
    }

    public void setIs_hoax(boolean is_hoax) {
        this.is_hoax = is_hoax;
    }
}
