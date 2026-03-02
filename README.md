<div align="center">

# 🚨 ResQ-AI

### Autonomous Crisis Nerve Center

*AI-powered disaster response platform built with Google Gemini*

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Gemini](https://img.shields.io/badge/Google%20Gemini-2.0%20Flash-4285F4?logo=google&logoColor=white)](https://ai.google.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org)

**Geminithon 2026 — Natural Disaster Response**

</div>

---

## 📋 Problem Statement

During natural disasters, emergency control rooms are overwhelmed with thousands of unstructured, chaotic reports. Dispatchers waste critical minutes trying to determine:
- **What** type of disaster occurred
- **How severe** it is
- **What resources** to deploy
- **Whether the report is genuine** or a hoax

**ResQ-AI** solves this by using Google Gemini to instantly transform raw citizen reports (text + images) into structured, actionable triage data.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CITIZEN PORTAL                           │
│  [📝 Text Report]  [📸 Image Upload]  [📞 Phone]  [📍 Location] │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │  REACT APP  │
                    │  (Vite 7)   │
                    └──────┬──────┘
                           │
              ┌────────────▼────────────┐
              │   THREE-LAYER AI ENGINE  │
              │                          │
              │  Layer 1: Gemini JS SDK  │──→ Google Gemini API
              │   (Browser → Direct)     │    (Multimodal: Text + Image)
              │          │               │
              │          ▼ (if fails)    │
              │  Layer 2: Backend API    │──→ Google Gemini REST API
              │   (Spring Boot → REST)   │    (Server-side, Secure)
              │          │               │
              │          ▼ (if fails)    │
              │  Layer 3: Smart Fallback │
              │   (Keyword Engine)       │    No internet needed!
              └────────────┬─────────────┘
                           │
                    ┌──────▼──────┐
                    │ SPRING BOOT │
                    │   Backend   │
                    │  (Port 8080)│
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │ PostgreSQL  │
                    │  Database   │
                    └──────┬──────┘
                           │
              ┌────────────▼────────────┐
              │   ADMIN COMMAND CENTER   │
              │                          │
              │  📊 Live Dashboard       │
              │  🔴 Severity Alerts      │
              │  🚀 One-Click Dispatch   │
              │  ✅ Resolve Incidents    │
              │  🔄 Auto-Refresh (10s)   │
              └──────────────────────────┘
```

---

## ✨ Key Features

### For Citizens
| Feature | Description |
|---------|-------------|
| 🆘 Emergency Types | Quick-select: Flood, Fire, Collapse, Earthquake, Medical, Other |
| 📸 Image Upload | Drag-and-drop damage photos — Gemini analyzes visually |
| 📞 Phone Verification | 10-digit Indian mobile validation for accountability |
| 🤖 Real-time AI | Instant severity scoring, resource recommendation, hoax detection |
| 🚦 Rate Limiting | Max 3 reports/hour to prevent abuse |

### For Admins
| Feature | Description |
|---------|-------------|
| 🔐 Secure Login | Protected dashboard with authentication |
| 📊 Live Stats | Total incidents, critical count, pending, resolved |
| 🔴 Critical Alerts | Pulsing red glow for severity 9-10 with alert ticker |
| ⚡ One-Click Actions | Dispatch or resolve incidents instantly |
| 🔍 Smart Filters | Filter by severity, status, or type |

### AI Capabilities
| Feature | Description |
|---------|-------------|
| 📝 Text Analysis | NLP-based incident classification and severity scoring |
| 📸 Multimodal Vision | Gemini analyzes disaster photos for damage assessment |
| 🛡️ Hoax Detection | AI flags suspicious/fake reports automatically |
| 🔄 Graceful Fallback | Works offline with keyword-weighted fallback engine |

---

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:

| Software | Version | Download |
|----------|---------|----------|
| **Java JDK** | 17+ | [adoptium.net](https://adoptium.net) |
| **Node.js** | 18+ | [nodejs.org](https://nodejs.org) |
| **PostgreSQL** | 14+ | [postgresql.org/download](https://www.postgresql.org/download) |
| **Git** | Latest | [git-scm.com](https://git-scm.com) |

---

## 🚀 Installation & Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/GuruMohith24/ResQ-AI.git
cd ResQ-AI
```

### Step 2: Database Setup

```sql
-- Open pgAdmin or psql and run:
CREATE DATABASE resqai;
```

### Step 3: Backend Setup

```bash
cd resq-backend
```

Edit `src/main/resources/application.properties`:

```properties
# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/resqai
spring.datasource.username=YOUR_DB_USERNAME
spring.datasource.password=YOUR_DB_PASSWORD

# Gemini API
gemini.api.key=YOUR_GEMINI_API_KEY
gemini.api.url=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent
```

Run the backend:

```bash
./mvnw spring-boot:run        # Linux/Mac
.\mvnw.cmd spring-boot:run    # Windows
```

> Backend starts at **http://localhost:8080**

### Step 4: Frontend Setup

```bash
cd resq-frontend
npm install
```

Create a `.env` file:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

> Get your API key from [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

Run the frontend:

```bash
npm run dev
```

> Frontend starts at **http://localhost:5173**

### Step 5: Open the App

- **Citizen Portal:** http://localhost:5173 (default view)
- **Admin Dashboard:** Click "Admin" button → Login with `admin` / `resq2024`

---

## 🔌 API Reference

### Report Endpoints

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `POST` | `/api/incidents/report/text` | `{ "text": "..." }` | Submit text report |
| `POST` | `/api/incidents/report/image` | `{ "image": "base64", "mimeType": "image/jpeg", "text": "..." }` | Submit image + text |

### Query Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/incidents` | All incidents |
| `GET` | `/api/incidents/high-severity` | Severity ≥ 7 |
| `GET` | `/api/incidents/pending` | Pending incidents |

### Action Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `PUT` | `/api/incidents/{id}/dispatch` | Dispatch resources |
| `PUT` | `/api/incidents/{id}/resolve` | Mark resolved |

### Sample Response

```json
{
  "id": 1,
  "incidentType": "Flood",
  "severityScore": 8,
  "summary": "AI Analysis: Flood detected. Severity 8/10. Immediate response required.",
  "requiredResources": ["Rescue Boat", "Life Jackets", "Pumping Vehicle", "Ambulance"],
  "reporterText": "Water level rising fast in Anna Nagar, families stuck on rooftops",
  "status": "PENDING",
  "hoax": false,
  "timestamp": "2026-03-02T11:53:30.519"
}
```

---

## 📁 Project Structure

```
ResQ-AI/
│
├── resq-backend/                          # Spring Boot Backend
│   ├── pom.xml                            # Maven dependencies
│   └── src/main/java/.../e_commerce/
│       ├── ECommerceApplication.java      # Application entry point
│       ├── config/
│       │   └── SecurityConfig.java        # CORS & security configuration
│       ├── controller/
│       │   └── IncidentController.java    # REST API endpoints
│       ├── dto/
│       │   └── GeminiAnalysis.java        # AI response data model
│       ├── model/
│       │   ├── Incident.java              # Incident entity (JPA)
│       │   └── Resource.java              # Resource entity
│       ├── repository/
│       │   └── IncidentRepository.java    # Database queries
│       └── service/
│           ├── GeminiService.java         # Gemini API + Smart Fallback
│           └── IncidentService.java       # Business logic
│
├── resq-frontend/                         # React Frontend
│   ├── .env                               # Gemini API key (not in repo)
│   ├── index.html                         # Entry HTML
│   └── src/
│       ├── App.jsx                        # Main app (Citizen + Admin)
│       ├── api.js                         # Backend API client
│       ├── gemini.js                      # Direct Gemini SDK integration
│       ├── index.css                      # Command-center theme (1100+ lines)
│       └── main.jsx                       # React entry point
│
├── .gitignore
└── README.md
```

---

## 🧠 AI Architecture Deep Dive

### Gemini Prompt Engineering

```
You are a Disaster Response AI.
Analyze the input (text + image) and return structured JSON:
{
  "incident_type": "Flood|Fire|Earthquake|Medical|Collapse|Other",
  "severity_score": 1-10,
  "casualties_suspected": true|false,
  "resources_required": ["list of resources"],
  "brief_summary": "one sentence",
  "is_hoax": true|false
}
```

### Smart Fallback Engine

When Gemini is unavailable, the keyword-weighted engine provides:

| Keywords | Type | Severity | Resources |
|----------|------|----------|-----------|
| flood, water, rain, drowning | Flood | 7 | Rescue Boat, Life Jackets, Pumping Vehicle |
| fire, burn, flame, smoke | Fire | 8 | Fire Truck, Water Tanker, Ambulance |
| collapse, trapped, debris | Collapse | 9 | Heavy Crane, K9 Unit, Search & Rescue |
| earthquake, quake, shaking | Earthquake | 9 | Search & Rescue, Medical Team, Heavy Equipment |
| medical, injured, hurt | Medical | 6 | Ambulance, Medical Team, First Aid Kit |

Severity modifiers: +1 for "urgent", "critical", "many people" (max 10)

---

## 👥 Team

| Member | Role |
|--------|------|
| **Guru Mohith** | Full-Stack Developer |
| **Team Member 2** | Full-Stack Developer |

Built with ❤️ for **Geminithon 2026**

---

## 📄 License

This project is licensed under the MIT License.
