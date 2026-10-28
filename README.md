# VYOMSENTINEL

A space traffic management, orbital propagation, and collision avoidance platform engineered for high-density orbital regimes. Built with React 18, Three.js / React Three Fiber, FastAPI, and SGP4 astrodynamics.

---

## Architectural Overview

VYOMSENTINEL coordinates four distinct runtime services:

```
+-------------------------------------------------------------------------+
|                        VYOMSENTINEL PLATFORM                            |
+-------------------------------------------------------------------------+
                                     |
    +--------------------------------+--------------------------------+
    |                                |                                |
    v                                v                                v
+-----------------------+  +-----------------------+  +-----------------------+
|   FRONTEND CLIENT     |  |    FASTAPI BACKEND    |  |  PRIVACY SHIELD DEMO  |
|  React 18 + Three.js  |  | SGP4 Astrodynamics    |  |  Streamlit SMPC       |
|  Port 5173            |  | Port 8000             |  |  Port 8501            |
+-----------------------+  +-----------------------+  +-----------------------+
            |                          |
            |     REST HTTP / JSON     |
            +------------------------->+
                                       |
                     +-----------------+-----------------+
                     |                                   |
                     v                                   v
         +-----------------------+           +-----------------------+
         | Space-Track.org API   |           | Local Disk Cache      |
         | Live TLE Ephemeris    |           | TTL Validated Cache   |
         +-----------------------+           +-----------------------+
```

1. **Frontend (React + Vite, Port 5173)**: Interactive 3D celestial visualization featuring a curved cinematic video plane, instanced orbital constellations (150 satellites), high-density debris fields (500 fragments across three historical collision clusters), pulsing hazard rings, and an automated 8-second cinematic conjunction near-miss simulation.
2. **Backend API (FastAPI, Port 8000)**: Numerical SGP4 orbit propagation, parallel catalog processing (ThreadPoolExecutor), vectorized minimum separation distance screening, and 2D Gaussian probability of collision (Pc) integration on the B-plane.
3. **Privacy Shield Demonstration (Streamlit, Port 8501)**: Simulated Secure Multi-Party Computation (SMPC) workflow demonstrating zero-knowledge conjunction risk verification between defense and commercial operators without exposing raw ephemerides.
4. **Data Layer (Deterministic Fallback / Space-Track)**: Operates out-of-the-box with zero configuration using deterministic high-fidelity orbital data. Automatically connects to live Space Command tracking when credentials are configured.

---

## Prerequisites

- **Node.js**: v20.0.0 or later
- **Python**: v3.11 or later
- **Package Managers**: `npm` and `pip`
- **Optional**: Space-Track.org user account credentials for live data ingestion

---

## Installation and Quick Start

### 1. Frontend Setup (Port 5173)

From the project root directory:

```bash
# Install frontend dependencies
npm install

# Start Vite development server
npm run dev
```

The frontend client will be available at: `http://localhost:5173`

To build for production and verify type safety:

```bash
npm run typecheck
npm run build
```

### 2. Backend Setup (Port 8000)

In a separate terminal:

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Windows Command Prompt:
.\venv\Scripts\activate.bat
# Linux/macOS:
source venv/bin/activate

# Install backend dependencies
pip install -r requirements.txt

# Execute test suite
pytest -v

# Start FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Verify backend health at: `http://localhost:8000/api/health`

### 3. Privacy Shield Demo Setup (Port 8501)

In a third terminal:

```bash
# Navigate to privacy shield directory
cd privacy-shield

# Activate backend virtualenv or install directly
pip install -r requirements.txt

# Run Streamlit service
streamlit run app.py --server.port 8501
```

The demo will be available at: `http://localhost:8501`

---

## Live Data Ingestion vs. Demo Mode

- **Demo Mode (Default, Zero Configuration)**:
  When `SPACETRACK_USER` is empty, the system operates in demo mode. The backend serves high-fidelity deterministic ephemeris datasets including 5 conjunction scenarios with diverse collision probabilities. The frontend runs with zero manual setup.

- **Live Space-Track Mode**:
  To activate live orbital ingestion from US Space Command, configure your credentials in `backend/.env`:
  ```ini
  SPACETRACK_USER=your_email@domain.com
  SPACETRACK_PASS=your_password
  SPACETRACK_BASE_URL=https://www.space-track.org
  ```
  The client enforces a 2-second rate-limiting throttle between queries and caches responses in `.cache/` with an hourly TTL to comply with Space-Track API usage policies.

---

## Hero Video Integration and Procedural Fallback

The homepage video plane is rendered at the center of the 3D scene using a custom vertex-curved shader.

- **Adding Custom Footage**:
  Place your video file at `public/videos/hero.mp4` (H.264 format, 1080p recommended).
- **Procedural Fallback**:
  If `hero.mp4` is absent, the custom hook `useVideoTextureSafe` automatically generates a procedural fallback canvas texture rendering concentric cyan orbital paths with animated satellites. A warning is logged to the browser console, and the 3D scene continues running smoothly without failure.

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service uptime, software version, and Space-Track configuration state. |
| `GET` | `/api/demo` | Deterministic conjunction screening dataset matching production schema. |
| `GET` | `/api/tle/{norad_id}` | Query two-line element set for specific catalog object. |
| `GET` | `/api/catalog?limit=100` | Fetch recent active orbital catalog items. |
| `POST` | `/api/screen` | Execute SGP4 propagation, encounter screening, and Pc calculation. |

### Sample Screening Request

```json
POST /api/screen
Content-Type: application/json

{
  "norad_id": 25544,
  "window_hours": 24,
  "threshold_km": 10.0
}
```

---

## Technical Astrodynamics Foundations

### Simplified General Perturbations-4 (SGP4)
The backend leverages the standard `sgp4` numerical propagation engine (Vallado et al.) to compute osculating orbital states in the True Equator, Mean Equinox (TEME) Earth-Centered Inertial coordinate frame. Perturbations modeled include Earth gravitational zonal harmonics (J2, J3, J4), atmospheric drag using modified King-Hele exponential density models, and lunar/solar gravitational perturbations for deep-space regimes.

### Collision Probability Computation (Pc)
Short-encounter collision probability is evaluated in the relative encounter plane (B-plane) perpendicular to the relative velocity vector `v_rel`:

1. Orthonormal basis vectors `(u_hat, w_hat)` spanning the encounter plane are constructed normal to `v_rel / |v_rel|`.
2. 3D relative position `dr` and combined covariance `C = C_primary + C_secondary` are projected onto the 2D plane:
   `r_encounter = P * dr`
   `C_2D = P * C * P^T`
3. The 2D Gaussian probability density function is integrated over a circular hard-body cross section of combined radius `R = R_1 + R_2` (nominally 10 meters):
   `Pc = \iint_{x^2 + y^2 \le R^2} \frac{1}{2\pi \sqrt{|C_{2D}|}} \exp\left(-\frac{1}{2} (r - r_m)^T C_{2D}^{-1} (r - r_m)\right) dx dy`
   The integration is executed using adaptive 2D Gaussian quadrature (`scipy.integrate.dblquad`).

---

## Simulated vs. Production Components

- **Production-Grade**:
  - SGP4 orbit propagation routines (`sgp4.api.Satrec`).
  - Minimum Euclidean distance screening algorithms.
  - B-plane collision probability integration (`scipy.integrate.dblquad`).
  - 3D rendering pipeline (React Three Fiber, custom GLSL shaders, instanced rendering).
  - FastAPI asynchronous architecture and Pydantic validation.

- **Simulated Demonstration**:
  - The Privacy Shield demonstrates the operational protocol and information-flow constraints of Secure Multi-Party Computation (SMPC). In enterprise defense deployment, this workflow is backed by homomorphic encryption and secret-sharing engines (such as MPyC or PySyft) with formal cryptographic proofs.

---

## Troubleshooting

- **Video Not Loading**: Verify that `public/videos/hero.mp4` exists. If not present, the procedural fallback will render concentric orbits automatically.
- **Backend Unreachable in UI**: Ensure the FastAPI server is running on port 8000. The frontend HUD will display `DEMO MODE` (amber dot) when operating autonomously without the backend.
- **Port Conflicts**:
  - Change frontend port in `vite.config.ts`.
  - Change backend port using `uvicorn main:app --port <port>`.
  - Change Streamlit port using `--server.port <port>`.

---

## Asset Credits

- Earth diffuse map and atmospheric textures: Three.js official examples repository (`earth_atmos_2048.jpg`, `earth_lights_2048.png`).
- Astrodynamics formulation: US Space Command / Spacetrack General Perturbations models and Foster 2D collision probability integration.
