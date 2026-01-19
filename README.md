# GlassBox: Transparent Billing Agent

> **Status:** Prototype (v0.1.0-beta)

GlassBox is a **trustworthy medical billing agent** prototype. It tackles the core challenge of AI adoption in healthcare: lack of trust in "black box" decisions.

## 🎯 Architecture Highlights

1. **Enterprise SSO (Multi-tenancy):**
    * Simulated SAML/OIDC flow for distinct organizations (Charité vs. Helios).
    * Strict logical tenant isolation.

2. **Event-Driven Pipeline:**
    * Decoupled async processing for OCR and LLM tasks.
    * Real-time updates via Server-Sent Events (SSE).

3. **Explainable AI (XAI):**
    * **Evidence-based Billing**: Every generated line item links directly to its source in the PDF.
    * **Verification Loop**: Built-in audit workflows for human oversight.

## 🛠️ Tech Stack

Designed for type safety and rapid iteration:

* **App:** React 19, Vite, Tailwind CSS
* **API:** Hono (Node.js), tRPC
* **Auth:** Better Auth (with Plugins)
* **Data:** Postgres (Drizzle ORM) - *Production ready.*
* **Infrastructure:** Docker, Cloud Run ready.

## 🚀 Quick Start

### Local Development

1. **Install & Seed**:

    ```bash
    npm install
    npm run seed --workspace=@glassbox/db
    ```

2. **Run Dev Server**:

    ```bash
    npm run dev
    ```

    * App: `http://localhost:5173`
    * API: `http://localhost:3001`

### Docker

The easiest way to run the full stack (App + Postgres) is via Docker Compose:

```bash
docker-compose up --build
```

**Access:** `http://localhost:3001`

## 🧪 Verification Flows

* **SSO Login:** Use `greg@charite.de` (Charité) or `dr.house@helios-kliniken.de` (Helios) to see the tenant discovery and redirect flow. *Other domains are not configured and will be rejected.*
* **Background Processing:** Upload `Urlaub_Rechnung_Mallorca.pdf` (or others in `test_data/`) to trigger the async pipeline.
* **Language Support:** Toggle DE/EN in the navbar.

## 📚 Documentation

For detailed architecture, design decisions, and implementation notes:

**[Technical Overview](docs/TECHNICAL_OVERVIEW.md)** — Complete documentation covering SSO, infrastructure, and AI pipeline.
