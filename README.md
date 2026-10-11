# HOPSCOT — Hop Colleges. Catch Vibes.

> **Delhi NCR's Premier College Event Discovery, Ticketing, and Social Travel Matching Platform**

HOPSCOT solves the collegiate commuting dilemma: students often want to attend intercollege fests, concerts, hackathons, and conferences across Delhi NCR (DTU, NSUT, MAIT, IIIT Delhi, IGDTUW, USICT, ADGIPS, etc.), but don't want to travel alone, navigate long transit routes solo, or pay for expensive private cabs. 

With HOPSCOT, students discover fests, get verified digital QR passes, plan their transit corridors, and automatically match with fellow students traveling along the same route at the same time to commute together.

---

## 🚀 Key Feature Matrix

1. **Campus Fest Radar & Ticketing**
   - Live festival directory with category filtering (Hackathons, Cultural fests, Technical, Music, Gaming, Workshops).
   - Multi-tier passes: Free delegate passes & VIP pro-nite tickets.
   - Razorpay test-mode integration with server-side signature verification & atomic inventory tracking.
   - High-contrast holographic festival passes with digital QR barcodes.

2. **Smart Travel Planner & OpenStreetMap Routing**
   - Interactive Leaflet map with pickup and college venue markers.
   - Preset student transit hubs across Delhi NCR (Rohini Sector 14, NSP Pitampura, Dwarka Mor, Janakpuri, Kashmere Gate, Hauz Khas, Noida).
   - Mode recommendations (Metro, Cab pool, Bus, Bike).

3. **Geospatial Social Travel Matching Engine**
   - Matches students attending the **same fest** departing from **nearby origin areas** (using Haversine distance formulas) within compatible departure windows (±30-45 mins).
   - Calculates compatibility scores (e.g. 96% Match) with explainable highlights ("Super close origin - 1.1 km away", "Leaves in ~15 mins").

4. **Campus Travel Squads & Group Coordination**
   - Create or join travel groups (e.g. "Rohini ➡️ DTU Hackathon Squad").
   - Group creator approvals for join requests.
   - Safe student coordination chat.

5. **Organizer Hub & Gate QR Scanner**
   - Real-time entry gate barcode scanner with camera feed and manual entry.
   - Real-time backend validation against ticket registry.
   - Duplicate entry prevention with alert warnings and timestamp of prior scan.

6. **Admin Moderation Console**
   - Platform governance, event approval/rejection, user suspension, and safety reports.

---

## ⚡ Demo Persona Credentials

Use the **Demo Role** dropdown in the top navigation bar to seamlessly switch between personas in 1 click:

| Role | Demo Persona | College & Context | Key Demonstration Flow |
|---|---|---|---|
| **Student** | **Aman Sharma** | DTU (Computer Engg, 3rd Year) • Rohini | Has registered tickets, created "Rohini ➡️ DTU Squad", can accept join requests |
| **Student Companion** | **Riya Sen** | MAIT (IT, 2nd Year) • Rohini Sec-13 | 1.1 km away from Aman, matched with 96% compatibility score, requested to join squad |
| **Organizer** | **DTU Tech Council** | DTU Student Body | Scans student QR passes at Gate, manages Invictus 2026, views ticket revenues |
| **Super Admin** | **HOPSCOT Admin** | Platform Governance | Approves/rejects fests, audits user activity, reviews reports |

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Leaflet, Canvas Confetti, QRCode
- **Backend:** Node.js Express server (`server.ts`) + Python FastAPI standalone architecture (`/backend`)
- **Database Architecture:** PostgreSQL with SQLAlchemy & Alembic schemas (`/backend/app/models.py`)
- **Payments:** Razorpay Test Mode with server-side validation
- **Maps:** Leaflet & OpenStreetMap CartoDB tiles

---

## 🏃 Running the Application

### Option A: Interactive Full-Stack (Current Applet)
```bash
# Start the full-stack server on port 3000
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Option B: FastAPI Backend (Local Python)
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Option C: Docker Compose
```bash
docker-compose up --build
```
This boots PostgreSQL on `5432`, the FastAPI backend on `8000`, and the React frontend on `3000`.

---

## 🎯 Main Demo Flow to Test

1. **Browse Events:** Click **Explore Events** and view *Invictus 2026* at DTU or *Resonance '26* at NSUT.
2. **Book Pass:** Open *Invictus 2026*, select VIP Pass (₹199), click **Book Pass**, and complete the simulated Razorpay test checkout.
3. **View Digital Ticket:** Open **My Tickets** to view your high-res digital QR pass (`#HOP-DTU-7489`).
4. **Plan Transit:** Click **Travel Planner**, choose **Rohini Sector 14**, set departure to **08:45 AM**, and click **Save Plan & Find Companions**.
5. **View Matches:** See **Riya Sen** matched at 96% compatibility (leaves at 09:00 AM, 1.1 km away).
6. **Open Squad & Chat:** Open **Travel Squads** ➔ **Rohini ➡️ DTU Hackathon Squad**, coordinate in chat, and accept Riya Sen's join request.
7. **Simulate Gate Scan:** Switch role to **DTU Tech Council (Organizer)**, open **Organizer Hub**, click **#HOP-DTU-7489** under Quick Test Passes. Observe the green check-in approval. Click it again to see the fraud alert warning for duplicate entry!
