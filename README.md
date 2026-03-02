# 🚨 ResQ-AI — Autonomous Crisis Nerve Center

> **Geminithon 2026** | AI-powered disaster response platform using Google Gemini

ResQ-AI transforms chaotic citizen distress reports into structured, actionable intelligence for emergency dispatchers — in under 2 seconds.

---

## ✨ Features

### 🆘 Citizen Report Portal
- Quick emergency type selection (Flood, Fire, Collapse, Earthquake, Medical)
- 📸 **Image upload** with drag-and-drop — Gemini analyzes damage photos (multimodal)
- 📞 Phone number verification & location tracking
- 🤖 Real-time AI analysis with hoax detection
- 🚦 Rate limiting to prevent abuse

### 🛡️ Admin Command Center
- 🔐 Secure login for dispatchers
- 📊 Live dashboard with severity-based color coding
- 🔴 Pulsing alerts for critical incidents (severity 9-10)
- ⚡ One-click Dispatch & Resolve actions
- 🔄 Auto-refresh every 10 seconds

### 🧠 Three-Layer AI Architecture
```
Layer 1: React → Gemini JS SDK (instant, multimodal)
Layer 2: Spring Boot → Gemini REST API (secure, server-side)
Layer 3: Smart Fallback Engine (offline-capable, keyword-weighted)
```

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java Spring Boot 3.4 |
| Database | PostgreSQL |
| AI Engine | Google Gemini 2.0 Flash (Multimodal) |
| Frontend | React 19 + Vite 7 |
| Gemini SDK | @google/generative-ai |

---

## 🚀 Quick Start

### Backend
```bash
cd resq-backend
# Set up PostgreSQL database named 'resqai'
# Update application.properties with your DB credentials & Gemini API key
./mvnw spring-boot:run
```

### Frontend
```bash
cd resq-frontend
npm install
# Create .env with: VITE_GEMINI_API_KEY=your_key_here
npm run dev
```

Open **http://localhost:5173** — citizen page loads by default.

---

## 📸 How It Works

```
Citizen uploads photo + description of disaster
    ↓
Gemini AI analyzes text + image (multimodal)
    ↓
Returns: Incident Type, Severity (1-10), Required Resources, Hoax Check
    ↓
Saved to PostgreSQL → Appears on Admin Dashboard instantly
    ↓
Dispatcher clicks "Dispatch" → Resources deployed
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/incidents/report/text` | Report via text |
| POST | `/api/incidents/report/image` | Report via image + text |
| GET | `/api/incidents` | Get all incidents |
| GET | `/api/incidents/high-severity` | Get severity ≥ 7 |
| PUT | `/api/incidents/{id}/dispatch` | Dispatch resources |
| PUT | `/api/incidents/{id}/resolve` | Resolve incident |

---

## 👥 Team

Built by a team of **2** for Geminithon 2026.

---

## 📄 License

MIT
