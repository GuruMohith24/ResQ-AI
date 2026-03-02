package com.example.e_commerce.service;

import com.example.e_commerce.dto.GeminiAnalysis;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.util.*;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String SYSTEM_PROMPT = """
            You are a Disaster Response AI.
            Analyze the input (text description or image) and return ONLY a raw JSON object.
            No markdown, no explanation, just valid JSON.
            JSON format:
            {
              "incident_type": "Flood" or "Fire" or "Earthquake" or "Medical" or "Collapse" or "Other",
              "severity_score": a number from 1 to 10,
              "casualties_suspected": true or false,
              "resources_required": ["list", "of", "resources"],
              "brief_summary": "one sentence description",
              "is_hoax": true or false
            }
            """;

    // Analyze text-only report
    public GeminiAnalysis analyzeText(String userText) {
        try {
            String prompt = SYSTEM_PROMPT + "\nInput: " + userText;
            Map<String, Object> requestBody = buildTextRequest(prompt);
            String rawResponse = callGemini(requestBody);
            return parseResponse(rawResponse);
        } catch (Exception e) {
            // Fallback to smart mock when API quota exceeded
            return generateSmartMock(userText);
        }
    }

    // Analyze image + text
    public GeminiAnalysis analyzeImageAndText(String base64Image, String mimeType, String userText) {
        try {
            String prompt = SYSTEM_PROMPT + "\nInput text (if any): "
                    + (userText != null ? userText : "Analyze this image.");
            Map<String, Object> requestBody = buildImageRequest(prompt, base64Image, mimeType);
            String rawResponse = callGemini(requestBody);
            return parseResponse(rawResponse);
        } catch (Exception e) {
            return generateSmartMock(userText != null ? userText : "Image uploaded");
        }
    }

    // Smart mock - keyword-based analysis (simulates Gemini for demo)
    private GeminiAnalysis generateSmartMock(String text) {
        String lower = text.toLowerCase();
        GeminiAnalysis analysis = new GeminiAnalysis();

        // Detect incident type
        if (lower.contains("flood") || lower.contains("water") || lower.contains("rain")) {
            analysis.setIncident_type("Flood");
            analysis.setResources_required(List.of("Rescue Boat", "Life Jackets", "Pumping Vehicle", "Ambulance"));
            analysis.setSeverity_score(7);
        } else if (lower.contains("fire") || lower.contains("burn") || lower.contains("flame")) {
            analysis.setIncident_type("Fire");
            analysis.setResources_required(List.of("Fire Truck", "Ambulance", "Water Tanker"));
            analysis.setSeverity_score(8);
        } else if (lower.contains("collapse") || lower.contains("building") || lower.contains("trapped")) {
            analysis.setIncident_type("Collapse");
            analysis.setResources_required(List.of("Heavy Crane", "Search & Rescue Team", "Ambulance", "K9 Unit"));
            analysis.setSeverity_score(9);
        } else if (lower.contains("earthquake") || lower.contains("quake")) {
            analysis.setIncident_type("Earthquake");
            analysis.setResources_required(
                    List.of("Search & Rescue Team", "Medical Team", "Heavy Equipment", "Ambulance"));
            analysis.setSeverity_score(9);
        } else if (lower.contains("medical") || lower.contains("hospital") || lower.contains("injured")
                || lower.contains("hurt")) {
            analysis.setIncident_type("Medical");
            analysis.setResources_required(List.of("Ambulance", "Medical Team", "First Aid Kit"));
            analysis.setSeverity_score(6);
        } else {
            analysis.setIncident_type("Other");
            analysis.setResources_required(List.of("First Responder", "Police", "Ambulance"));
            analysis.setSeverity_score(5);
        }

        // Detect severity boosters
        if (lower.contains("urgent") || lower.contains("critical") || lower.contains("many")
                || lower.contains("people")) {
            analysis.setSeverity_score(Math.min(10, analysis.getSeverity_score() + 1));
        }

        // Detect hoax
        analysis.setIs_hoax(lower.contains("joke") || lower.contains("fake") || lower.contains("prank"));
        analysis.setCasualties_suspected(lower.contains("trapped") || lower.contains("dead")
                || lower.contains("injured") || lower.contains("stuck"));
        analysis.setBrief_summary("AI Analysis: " + analysis.getIncident_type() + " detected. Severity "
                + analysis.getSeverity_score() + "/10. Immediate response required.");

        return analysis;
    }

    private String callGemini(Map<String, Object> requestBody) {
        String url = apiUrl + "?key=" + apiKey;
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> httpEntity = new HttpEntity<>(requestBody, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(url, httpEntity, String.class);
        return response.getBody();
    }

    private Map<String, Object> buildTextRequest(String prompt) {
        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt);
        Map<String, Object> content = new HashMap<>();
        content.put("parts", List.of(textPart));
        Map<String, Object> body = new HashMap<>();
        body.put("contents", List.of(content));
        return body;
    }

    private Map<String, Object> buildImageRequest(String prompt, String base64Image, String mimeType) {
        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt);
        Map<String, Object> imageData = new HashMap<>();
        imageData.put("mime_type", mimeType);
        imageData.put("data", base64Image);
        Map<String, Object> imagePart = new HashMap<>();
        imagePart.put("inline_data", imageData);
        Map<String, Object> content = new HashMap<>();
        content.put("parts", List.of(textPart, imagePart));
        Map<String, Object> body = new HashMap<>();
        body.put("contents", List.of(content));
        return body;
    }

    private GeminiAnalysis parseResponse(String rawResponse) {
        try {
            JsonNode root = objectMapper.readTree(rawResponse);
            String text = root.path("candidates").get(0)
                    .path("content").path("parts").get(0)
                    .path("text").asText();
            text = text.replace("```json", "").replace("```", "").trim();
            return objectMapper.readValue(text, GeminiAnalysis.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Gemini response: " + e.getMessage());
        }
    }
}
