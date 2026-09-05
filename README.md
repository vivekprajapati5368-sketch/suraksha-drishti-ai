# SURAKSHA DRISHTI AI (सुरक्षा दृष्टि AI)
### AI-Powered Disaster Risk Intelligence & Relocation Decision Platform
**Smart India Hackathon (SIH 2026)** | **Problem ID:** SIH26191  
**Category:** Software | **Theme:** Disaster Management  
**Target Ministry:** Ministry of Home Affairs (MHA) / National Disaster Management Authority (NDMA)

---

## 📌 1. Project Overview

India experiences devastating recurring natural disasters including landslides in the Himalayas and Western Ghats, seasonal flood inundations in the Brahmaputra and Ganga basins, cloudbursts, coastal erosion, and storm surges. 

Historically, disaster management authorities have operated **reactively** — organizing relief, shelters, and rehabilitation only *after* devastation has already occurred.

**SURAKSHA DRISHTI AI** transforms this paradigm into a **proactive, intelligence-driven decision-support system**. The platform integrates geospatial intelligence (GIS), explainable Multi-Criteria Decision Analysis (MCDA), demographic carrying capacity evaluation, and real-time calamity simulation to:
1. **Dynamically identify hazard-prone Red, Orange, and Green zones** across vulnerable geographies.
2. **Audit individual habitations** based on slope angle, precipitation thresholds, river proximity, and historical frequency.
3. **Quantify the civic carrying capacity of safe relocation havens** (water supply, healthcare beds, highway connectivity, schooling, and livelihood resilience).
4. **Identify populations requiring immediate evacuation** and compute ranked optimal safe haven pairings.
5. **Empower government leadership with official MHA dossiers, real-time crisis simulators, and configurable risk models.**

---

## 🌟 2. Core Features

| # | Feature | Description |
|---|---|---|
| **1** | **Interactive India Disaster Map** | Fullscreen GIS radar powered by Leaflet.js & OpenStreetMap. Visualizes Red (High Risk), Orange (Medium), and Green (Low) hazard perimeters, vulnerable habitations, and designated safe havens with interactive popups, state filters, and layer toggles. |
| **2** | **AI Hazard Risk Engine** | Explainable AI (XAI) scoring engine evaluating rainfall, terrain slope, elevation, soil type, river proximity, population density, and historical calamities on a normalized 0–100 scale. Generates transparent natural language rationale. |
| **3** | **Vulnerable Habitation Analysis** | Real-time registry of habitations with multi-column sorting, search, and filtering by state, hazard, and priority. Detailed drawer provides radar vulnerability factors and safe zone assignment. |
| **4** | **Carrying Capacity Assessment** | Municipal infrastructure calculator evaluating whether a safe haven can absorb displaced populations without civic collapse. Includes an interactive Stress-Test Simulator for testing hypothetical influxes. |
| **5** | **AI Relocation Recommendation Engine** | Multi-criteria pairing engine generating the **Top 3 Recommended Safe Zones** for any vulnerable habitation with geodesic transit distances, match percentages, and infrastructure readiness. |
| **6** | **Priority Relocation System** | Multi-tier ranking: 🔴 Critical (Immediate Relocation), 🟠 High (Action Required Soon), 🟡 Medium (Monitoring), 🟢 Low (Routine). Provides aggregate civilian count under threat. |
| **7** | **Authority Command Dashboard** | National situation room featuring 7 core government metrics, hazard distribution donut chart, 30-day risk progression curve, and regional risk bar charts. |
| **8** | **Real-Time Alert Simulation** | Crisis scenario trigger console (Monsoon Surge, Himalayan Cloudburst, Flash Flood Inundation, Slope Failure). Recalculates national hazard scores and generates evacuation orders in real-time. |
| **9** | **Official Dossier & Report Generation** | Generates formal Government of India / MHA format reports with print-to-PDF stylesheet, official reference numbers, audit tables, and digital signature blocks. Also includes Field Officer observation reporting. |
| **10** | **Data Management & Configurable AI Weights** | Administrator panel with interactive sliders to tweak risk scoring weights (Rainfall, Slope, Disaster History, Population, Vulnerability). Recalculates the entire national database upon saving. |

---

## 🏗️ 3. Application Architecture & Tech Stack

```
                                  ┌────────────────────────────────┐
                                  │   SURAKSHA DRISHTI AI CLIENT   │
                                  │   React 18 + Vite + Tailwind   │
                                  │   Leaflet GIS + Recharts       │
                                  └───────────────┬────────────────┘
                                                  │
                                       REST APIs  │  JWT Auth
                                       JSON Data  │  CORS Enabled
                                                  ▼
                                  ┌────────────────────────────────┐
                                  │     EXPRESS REST API SERVER    │
                                  │     Node.js (Port 5000)        │
                                  └───────────────┬────────────────┘
                                                  │
                 ┌────────────────────────────────┼────────────────────────────────┐
                 ▼                                ▼                                ▼
   ┌───────────────────────────┐    ┌───────────────────────────┐    ┌───────────────────────────┐
   │    AI RISK SCORING        │    │    CARRYING CAPACITY      │    │   RELOCATION OPTIMIZER    │
   │    Explainable MCDA       │    │    Elasticity & Surplus   │    │   Haversine + MCDA Top-3  │
   └───────────────────────────┘    └───────────────────────────┘    └───────────────────────────┘
                                                  │
                                                  ▼
                                  ┌────────────────────────────────┐
                                  │    BUILT-IN SQLITE ENGINE      │
                                  │    Node 24 native node:sqlite  │
                                  │    Zero C++ dependencies       │
                                  └────────────────────────────────┘
```

- **Frontend**: React 18, Vite 6, Tailwind CSS, Lucide Icons, Leaflet.js, Recharts, clsx.
- **Backend**: Node.js, Express.js, JWT, bcryptjs, CORS.
- **Database**: SQLite via Node.js native `node:sqlite` (`DatabaseSync`). Designed with clean SQL schemas for zero-friction future migration to PostgreSQL + PostGIS.
- **GIS**: OpenStreetMap dark matter cartography, GeoJSON coordinates, Haversine geodesic calculation engine.
- **AI/ML**: Explainable Multi-Criteria Decision Analysis (MCDA) + Heuristic Multi-Factor Regression with feature importance breakdown.

---

## 🔑 4. Demo Credentials for Evaluators

For fast demonstration during SIH judging rounds, the login page features **1-Click Quick Login Buttons**, or you can use these credentials:

| Role | Email | Password | Intended Capabilities |
|---|---|---|---|
| **Administrator** | `admin@surakshadrishti.in` | `Admin123` | Configure AI Risk Weights, manage habitations, view all states, monitor system telemetry |
| **Disaster Authority** | `authority@surakshadrishti.in` | `Authority123` | Analyze Red Zones, assign safe relocation havens, execute AI batch allocation, print reports |
| **Field Officer** | `officer@surakshadrishti.in` | `Officer123` | Submit real-time field observations, report ground fissuring and immediate tactical needs |

> **Note:** Clearly designated as demonstration credentials and prototype datasets for SIH 2026.

---

## 🚀 5. Installation & Execution Guide

### Prerequisites
- **Node.js**: v18+ (Node.js v20 or v24 recommended)
- **npm**: v9+

### Quick Start (One Terminal Setup)

1. **Clone or navigate into the project directory:**
   ```bash
   cd "c:\Users\Vivek\Desktop\cybertrace ai"
   ```

2. **Install backend and frontend dependencies:**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Initialize and seed database with 24+ habitations & 10+ safe havens
   npm run seed
   
   # Return to root and install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Start the Backend Server (Terminal 1):**
   ```bash
   cd backend
   npm start
   ```
   *The backend will start on `http://localhost:5000` with SQLite database initialized.*

4. **Start the Frontend Development Client (Terminal 2):**
   ```bash
   cd frontend
   npm run dev
   ```
   *The frontend will start on `http://localhost:3000` (or `http://localhost:5173`).*

5. **Access the Application:**
   Open your browser and navigate to `http://localhost:3000` (or the Vite port displayed in Terminal 2).

---

## 🧮 6. AI Algorithms & Mathematical Formulations

### 1. Hazard Risk Scoring Formula
$$\text{Risk Score} = \frac{(W_{\text{rain}} \cdot S_{\text{rain}}) + (W_{\text{slope}} \cdot S_{\text{slope}}) + (W_{\text{disaster}} \cdot S_{\text{disaster}}) + (W_{\text{pop}} \cdot S_{\text{pop}}) + (W_{\text{vuln}} \cdot S_{\text{vuln}})}{\sum W} \times M_{\text{prox}}$$

Where:
- $S_{\text{rain}}$: Normalized 24h rainfall (20mm to 300mm IMD criteria)
- $S_{\text{slope}}$: Terrain inclination (0° to 45° GSI threshold)
- $S_{\text{disaster}}$: Recurrent decadal event frequency
- $S_{\text{pop}}$: Demographic density footprint
- $S_{\text{vuln}}$: Socio-structural vulnerability index
- $M_{\text{prox}}$: River proximity amplification multiplier ($\le 250\text{m}$ adds hydrological surge coefficient)

**Zone Classification:**
- $0 \le \text{Score} \le 30 \longrightarrow$ 🟢 **Green Zone** (Low Risk)
- $31 \le \text{Score} \le 60 \longrightarrow$ 🟠 **Orange Zone** (Medium Risk)
- $61 \le \text{Score} \le 100 \longrightarrow$ 🔴 **Red Zone** (High Risk)

### 2. Carrying Capacity & Sustainability Index
$$\text{Capacity}_{\text{available}} = \text{Capacity}_{\text{maximum}} - \text{Population}_{\text{current}}$$

$$\text{Sustainability Score} = (0.25 \cdot \text{Water}) + (0.25 \cdot \text{Health}) + (0.20 \cdot \text{Road}) + (0.15 \cdot \text{School}) + (0.15 \cdot \text{Livelihood}) - \text{Penalty}_{\text{overload}}$$

**Sustainability Bands:**
- $80 - 100 \longrightarrow$ **Excellent Absorption**
- $60 - 79 \longrightarrow$ **Suitable Relocation**
- $40 - 59 \longrightarrow$ **Limited Capacity**
- $0 - 39 \longrightarrow$ **Unsuitable / Saturated**

### 3. Geodesic Relocation Suitability
$$\text{Distance} = 2 R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta\phi}{2}\right) + \cos\phi_1 \cos\phi_2 \sin^2\left(\frac{\Delta\lambda}{2}\right)}\right)$$

$$\text{Suitability Score} = (0.35 \cdot \text{CapacityFit}) + (0.25 \cdot \text{Proximity}) + (0.25 \cdot \text{Sustainability}) + (0.15 \cdot \text{HighwayAccess})$$

---

## 📡 7. REST API Endpoints

### Authentication
- `POST /api/auth/login`: Authenticate user & issue JWT token.
- `GET /api/auth/me`: Fetch authenticated user profile.

### Dashboard & Analytics
- `GET /api/dashboard/stats`: Returns 7 core metrics, Recharts datasets, and active alerts.
- `GET /api/analytics`: Macro-historical disaster correlation, casualties, and state capacity balances.

### Habitations
- `GET /api/habitations`: Query with `search`, `state`, `hazard`, `priority`, `sortBy`, `order`.
- `GET /api/habitations/:id`: Returns radar vulnerability dimensions and top 3 safe zone recommendations.
- `POST /api/habitations`: Register new habitation (triggers risk calculation).
- `PUT /api/habitations/:id`: Update habitation attributes.
- `DELETE /api/habitations/:id`: Remove habitation from registry.
- `POST /api/habitations/:id/allocate`: Confirm safe haven allocation.

### Hazard Zones & Safe Havens
- `GET /api/hazard-zones`: List all 12+ hazard zones with AI explanations.
- `GET /api/safe-zones`: List safe havens with dynamic occupancy and sustainability scores.
- `POST /api/safe-zones/test-intake`: Stress-test hypothetical incoming population influx.

### Relocation & Simulation
- `GET /api/recommendations/:habitationId`: Get top 3 ranked safe havens.
- `GET /api/relocation/matrix`: Full matrix of critical habitations and haven pairings.
- `POST /api/relocation/batch-allocate`: 1-Click autonomous batch assignment.
- `GET /api/simulation/status`: Get current crisis simulation status.
- `POST /api/simulate-alert`: Trigger severe weather/geotechnical simulation.
- `POST /api/simulation/reset`: Restore baseline realistic conditions.

### Risk Weights & Reports
- `GET /api/risk-weights`: Fetch configurable weights.
- `PUT /api/risk-weights`: Update weights and automatically recalculate entire national database.
- `GET /api/reports/official`: Compile formal Government of India MHA dossier.
- `POST /api/field-reports`: Submit field officer ground observation.

---

## 🗺️ 8. Demonstration Datasets (Pan-India)

Pre-seeded with real-world disaster hotspots clearly tagged as prototype data:
1. **Uttarakhand (Himalayan Landslide Belt):** Sunil Ward (Joshimath), Manohar Bagh, Raini Gaon (Rishi Ganga), Tilwara (Mandakini), Dharasu, Guptkashi.
2. **Kerala (Western Ghats Debris Belt):** Chooralmala, Mundakkai, Meppadi, Attamala (Wayanad).
3. **Assam & North-East (Brahmaputra Flood Basin):** Kamalabari Ghat (Majuli Island), Garamur Char, Jonai (Dhemaji), Lahorighat (Morigaon), Chungthang (Sikkim Teesta GLOF).
4. **Himachal Pradesh (Beas Torrent Corridor):** Old Manali waterfront, Pandoh bridge settlement, Sangla Batseri (Kinnaur), Bhagsunag (Kangra).
5. **Coastal Belts (Storm Surge & Erosion):** Satabhaya (Odisha), Pentha seafront, Baliara (Mousuni Island, Sundarbans).

---

## 🔮 9. Future Roadmap & Production Scaling

- **PostGIS & Geoserver Integration**: Seamless drop-in replacement for the SQLite database to support complex spatial polygons and satellite raster tiles.
- **ISRO Bhuvan / Copernicus Sentinel-1 SAR Integration**: Real-time Synthetic Aperture Radar (SAR) interferometry for detecting millimeter-level ground subsidence.
- **Mobile PWA Offline Sync**: Enable field officers in zero-connectivity mountain valleys to cache observations offline and sync when reaching cellular networks.
- **Automated SMS / Cell Broadcast Alerts**: Direct integration with NDMA CAP (Common Alerting Protocol) for cell-broadcast emergency alerts.

---

## 📜 10. License & Attribution

Developed for **Smart India Hackathon 2026** under Problem Statement **SIH26191**.  
Built in adherence with the guidelines of the **Ministry of Home Affairs (MHA)** and the **National Disaster Management Authority (NDMA)**.
