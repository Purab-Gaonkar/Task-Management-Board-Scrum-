# Scrum Task Management Board — Multi-VM GCP Architecture

A production-ready, polyglot microservices task management application designed for deployment across 4 Google Cloud Platform (GCP) Compute Engine VMs using Docker.

---

## 🏗️ Architecture Overview

```
                          ┌───────────────────────────┐
                          │    👤 Client Browser     │
                          └─────────────┬─────────────┘
                                        │ Port 80
                                        ▼
                          ┌───────────────────────────┐
                          │     VM 4: Frontend UI     │
                          │   (React + Vite + Nginx)  │
                          └─────────────┬─────────────┘
                                        │ API Calls (/api)
                                        ▼
                          ┌───────────────────────────┐
                          │    VM 3: API Gateway      │
                          │     (Nginx Proxy)         │
                          └──────┬─────────────┬──────┘
                   /api/tasks/*  │             │  /api/users/* & /api/auth/*
                                 ▼             ▼
  ┌────────────────────────────────┐         ┌────────────────────────────────┐
  │   VM 1: Task Microservice      │         │   VM 2: User/Auth Service      │
  │   Python (Flask) + MongoDB 7   │         │ Node.js (Express) + Postgres 16│
  │   Port 5001 / MongoDB 27017    │         │   Port 5002 / Postgres 5432    │
  └────────────────────────────────┘         └────────────────────────────────┘
```

### VM Breakdown & Tech Stack

| VM | Service Name | Application Tech | Database Tech | Default Ports |
|---|---|---|---|---|
| **VM 1** | Task Microservice | Python 3.12 (Flask, PyMongo) | MongoDB 7 | App: 5001, DB: 27017 |
| **VM 2** | User & Auth Service | Node.js 20 (Express, Pg) | PostgreSQL 16 | App: 5002, DB: 5432 |
| **VM 3** | API Gateway | Nginx | — | App: 80 |
| **VM 4** | Frontend UI | React 18 (Vite, Axios, CSS) | — | App: 80 |

---

## 🔒 Constraints & Zero Hardcoding Strategy

1. **Zero Hardcoding**: No database credentials, IP addresses, or secret keys are hardcoded in source code.
2. **Environment Variables**: All connections consume runtime environment variables:
   - `MONGO_HOST`, `MONGO_PORT`, `MONGO_DB`, `MONGO_USER`, `MONGO_PASSWORD`
   - `PG_HOST`, `PG_PORT`, `PG_DB`, `PG_USER`, `PG_PASSWORD`
   - `TASK_SERVICE_HOST`, `TASK_SERVICE_PORT`
   - `USER_SERVICE_HOST`, `USER_SERVICE_PORT`
   - `JWT_SECRET`
   - `VITE_API_GATEWAY_URL`
3. **Polyglot Stack**: 2 distinct languages (Python, JavaScript/Node.js) & 2 distinct database engines (MongoDB, PostgreSQL).
4. **Docker Hygiene**: All services feature optimized **multi-stage Dockerfiles**, non-root runtime users, and standalone `docker-compose.yml` configs.

---

## 📁 Repository Structure

```
Task-Management-Board(SCrum)/
├── .gitignore
├── README.md
├── task-service/               # VM 1: Python Flask + MongoDB
│   ├── app.py
│   ├── config.py
│   ├── models/
│   ├── routes/
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── .dockerignore
├── user-service/               # VM 2: Node.js Express + PostgreSQL
│   ├── src/
│   │   ├── index.js
│   │   ├── config.js
│   │   ├── db.js
│   │   ├── models/
│   │   └── routes/
│   ├── package.json
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── .dockerignore
├── api-gateway/                # VM 3: Nginx Gateway
│   ├── nginx.conf.template
│   ├── entrypoint.sh
│   ├── Dockerfile
│   └── docker-compose.yml
└── frontend/                   # VM 4: React UI
    ├── src/
    │   ├── components/
    │   ├── services/
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    ├── nginx.conf
    ├── package.json
    ├── Dockerfile
    └── docker-compose.yml
```

---

## ☁️ Manual GCP Setup & Deployment Instructions

### Step 1: Firewall Configuration

Create firewall rules in GCP VPC network:

```bash
# Allow HTTP traffic to API Gateway (VM 3) and Frontend (VM 4)
gcloud compute firewall-rules create allow-http-public \
  --allow=tcp:80 \
  --target-tags=http-server \
  --source-ranges=0.0.0.0/0

# Allow internal microservice communication (Ports 5001, 5002, 27017, 5432)
gcloud compute firewall-rules create allow-internal-mesh \
  --allow=tcp:5001,tcp:5002,tcp:27017,tcp:5432 \
  --source-ranges=10.128.0.0/9
```

---

### Step 2: Provision the 4 Compute Engine VMs

```bash
# VM 1: Task Microservice + MongoDB
gcloud compute instances create vm1-task-service \
  --zone=us-central1-a \
  --machine-type=e2-medium \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud

# VM 2: User/Auth Service + PostgreSQL
gcloud compute instances create vm2-user-service \
  --zone=us-central1-a \
  --machine-type=e2-medium \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud

# VM 3: API Gateway
gcloud compute instances create vm3-api-gateway \
  --zone=us-central1-a \
  --machine-type=e2-medium \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --tags=http-server

# VM 4: Frontend UI
gcloud compute instances create vm4-frontend \
  --zone=us-central1-a \
  --machine-type=e2-medium \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --tags=http-server
```

---

### Step 3: Install Docker on Each VM

SSH into each VM and install Docker + Docker Compose:

```bash
sudo apt update && sudo apt install -y docker.io docker-compose-v2
sudo usermod -aG docker $USER
newgrp docker
```

---

### Step 4: Deploy Container Services to VMs

#### **VM 1 (Task Service & MongoDB)**
```bash
# SSH into VM 1, navigate to project/task-service
export MONGO_USER="scrum_admin"
export MONGO_PASSWORD="SuperSecureMongoPass123!"
export MONGO_DB="scrum_tasks"
export PORT="5001"

docker compose up -d --build
```

#### **VM 2 (User Service & PostgreSQL)**
```bash
# SSH into VM 2, navigate to project/user-service
export PG_USER="scrum_pg_admin"
export PG_PASSWORD="SuperSecurePostgresPass123!"
export PG_DB="scrum_users"
export PORT="5002"
export JWT_SECRET="your_jwt_secret_key_here"

docker compose up -d --build
```

#### **VM 3 (API Gateway)**
```bash
# SSH into VM 3, navigate to project/api-gateway
export TASK_SERVICE_HOST="<VM1_INTERNAL_IP>"
export TASK_SERVICE_PORT="5001"
export USER_SERVICE_HOST="<VM2_INTERNAL_IP>"
export USER_SERVICE_PORT="5002"

docker compose up -d --build
```

#### **VM 4 (Frontend UI)**
```bash
# SSH into VM 4, navigate to project/frontend
export VITE_API_GATEWAY_URL="http://<VM3_EXTERNAL_IP>"

docker compose up -d --build
```

---

## 🧪 Local Testing via Docker Compose

To test services locally before VM deployment, start each stack with environment variables or set up local host mapping.

1. **Start Task Service**:
   ```bash
   cd task-service && docker compose up -d --build
   ```
2. **Start User Service**:
   ```bash
   cd user-service && docker compose up -d --build
   ```
3. **Start Gateway**:
   ```bash
   cd api-gateway && TASK_SERVICE_HOST=host.docker.internal USER_SERVICE_HOST=host.docker.internal docker compose up -d --build
   ```
4. **Start Frontend**:
   ```bash
   cd frontend && VITE_API_GATEWAY_URL=http://localhost docker compose up -d --build
   ```
