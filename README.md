# TenantX: Enterprise Multi-Tenant SaaS & Threat Intelligence Platform

TenantX is a production-grade, multi-tenant B2B SaaS platform engineered for **Threat Intelligence**, **Workflow Automation**, and **Granular RBAC Management**. Built with a security-first mindset, it provides enterprises with a robust infrastructure for security scanning (OpenVAS/ZAP), hierarchical approval workflows, and bulletproof tenant isolation.

---

## 🚀 Key Capabilities

*   **🔒 Hardened Multi-Tenancy**: Organization-level data isolation using slug-based routing and isolated session namespaces.
*   **🛡️ Hierarchical RBAC**: Granular permission system (13+ actions) with RS256 JWT signature verification and `perm_version` token invalidation.
*   **🔄 Workflow Engine**: Hierarchical approval state machine (`draft` → `submitted` → `approved`/`rejected`) for enterprise requests.
*   **🔍 Security Scanning Pipeline**: Asynchronous, long-running vulnerability scanning integration using **OpenVAS** and **OWASP ZAP** via Celery/Redis.
*   **💰 Enterprise Billing**: Integrated **Razorpay** payment gateway for subscription and quota management.
*   **📋 Security Auditing**: Full-spectrum activity logging at both SaaS (Platform) and Tenant (Portal) levels.

---

## 🛠️ Tech Stack

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Backend** | **Django + DRF** | Enterprise-grade ORM, robust security middleware, and extensive auth ecosystem. |
| **Frontend** | **React (Vite)** | High-performance SPA with optimized build times and component reusability. |
| **Styling** | **Tailwind CSS** | Utility-first design system for rapid, consistent UI development. |
| **State Management** | **Zustand** | Lightweight, performant state management for complex auth/session states. |
| **Async Processing** | **Celery + Redis** | Reliable handling of long-running security scans and background notifications. |
| **Database** | **PostgreSQL** | Relational excellence with JSONB support for dynamic workflow definitions. |
| **Infrastructure** | **Docker Swarm** | Scalable, high-availability container orchestration on Ubuntu. |

---

## 🏗️ System Architecture

### High-Level Component Layout

```text
                                  +---------------------------+
                                  |   TenantX Cloud Gateway   |
                                  | (Nginx/Traefik Ingress)   |
                                  +-------------+-------------+
                                                |
                                                v
               +--------------------------------+--------------------------------+
               |                                                                 |
    +----------+----------+                                           +----------+----------+
    |   Admin SaaS Hub    |                                           |   Tenant Portal UI  |
    | (Platform Control)  |                                           |  (Enterprise Access)|
    +----------+----------+                                           +----------+----------+
               |                                                                 |
               |             +----------------------------------+                |
               +------------>|   Multi-Tenant Backend (Django)  |<---------------+
                             | Auth | RBAC | Workflows | Billing|
                             +-----------------+----------------+
                                               |
               +-------------------------------+--------------------------------+
               |                               |                                |
    +----------+----------+         +----------+----------+          +----------+----------+
    |    PostgreSQL       |         |      Redis          |          |     Celery          |
    | (Tenant Partitioned)|         | (Message Broker/Cache)|          | (Async Task Runner) |
    +---------------------+         +---------------------+          +----------+----------+
                                                                                |
                                                               +----------------+----------------+
                                                               |                                 |
                                                    +----------+----------+           +----------+----------+
                                                    |  Security Scanners  |           | Notification Service|
                                                    | (OpenVAS / ZAP)     |           | (Email / OTP / SSE) |
                                                    +---------------------+           +---------------------+
```

### Request Lifecycle & Security Enforcement

1.  **Auth Ingress**: Client requests include a Bearer token Signed with **RS256**.
2.  **Middleware Validation**: The Backend verifies the signature using the Tenant's **Public Key**.
3.  **Isolation Check**: Requests are scoped to the `tenant_id` provided in the JWT payload.
4.  **RBAC Check**: Middleware validates if the required permission string (e.g., `workflow.approve`) exists in the token.
5.  **Audit Injection**: Every cross-tenant action is logged to the **Audit Activity** table before execution.

---

## 🔐 Advanced Security Features

### 1. Granular RBAC & Permission Versioning
TenantX uses 13 hierarchical permissions for workflows, allowing for fine-grained control over who can `submit`, `reassign`, or `archive` requests. The `perm_version` in the JWT ensures that any role change immediately invalidates old tokens, triggering a secure re-authentication flow.

### 2. Multi-Tenant Session Isolation
The frontend maintains strict namespace isolation for platform vs. portal sessions:
*   `accessToken` / `refreshToken`: Used for the Main SaaS Admin Hub.
*   `portal_access_token` / `portal_refresh_token`: Used for the Tenant-specific Portal.
This prevents session bleeding and allows admins to manage multiple tenant contexts simultaneously.

### 3. Asynchronous Scanning Pipeline
Security scans are never blocking. A scan request is:
1.  Validated and stored in the database.
2.  Dispatched to a **Celery Worker** via Redis.
3.  Executed by the **Scanning Engine** (triggering ZAP/OpenVAS APIs).
4.  Results are ingested back into the tenant's security dashboard asynchronously.

---

## 📂 Project Structure

```bash
├── MULTI-TENANT-SAAS-FRONTEND/  # Main SaaS Admin Application
│   ├── src/modules/             # Module-based React architecture
│   └── src/services/            # Centralized API and Auth services
├── Tenant-platfrom/             # Reusable Tenant Portal Frontend
└── BACKEND_API_CONTRACT.md      # Source of truth for all API interactions
```

---

## 🛠️ Local Setup

### Prerequisites
*   Node.js (>=20.12.0)
*   Python (3.11+)
*   Docker & Docker Compose
*   Redis & PostgreSQL

### Frontend Installation
1.  Navigate to the project root.
2.  Install dependencies: `npm install` (or `bun install`).
3.  Create a `.env` file from the template.
4.  Start dev server: `npm run dev`.

---

## 🔮 Future Roadmap

*   **Kubernetes Migration**: Transition from Docker Swarm to K8s for enhanced orchestration.
*   **SSO Integration**: Support for SAML and OIDC enterprise providers.
*   **Advanced AI Analytics**: Predicting threat patterns using predictive ML on scan history.
*   **Global CDN**: Edge delivery for tenant portals to reduce global latency.

---
> [!IMPORTANT]
> This documentation serves as the high-level technical reference for **TenantX**. For specific API endpoint definitions, refer to the [BACKEND_API_CONTRACT.md](../BACKEND_API_CONTRACT.md).
