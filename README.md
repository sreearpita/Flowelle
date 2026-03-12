# Flowelle

Flowelle is a menstrual health tracking app with a React frontend and two Spring Boot backend services.

## Current Repository State

This repository currently contains:
1. `frontend` (React + TypeScript + Redux Toolkit + Tailwind)
2. `backend/auth-service` (JWT auth, user profile, preferences)
3. `backend/cycles-service` (cycle tracking, symptom logging, predictions)

It does **not** currently contain a checked-in API gateway service.

## Project Structure

```text
flowelle/
├── backend/
│   ├── auth-service/
│   └── cycles-service/
├── frontend/
├── nginx/
└── docker-compose.yml
```

## Runtime Ports

1. Frontend dev server: `http://localhost:3000`
2. Auth service: `http://localhost:8081/api`
3. Cycles service: `http://localhost:8082/api`

## Local Development

### Prerequisites

1. Node.js 18+
2. npm 8+
3. Java 17+
4. Maven 3.8+
5. PostgreSQL 14+

### Database Setup

Create both databases:

```bash
createdb flowelle
createdb flowelle_cycle
```

Defaults in service configs currently use:
1. username: `postgres`
2. password: `postgres`

### Run Backend Services

```bash
cd backend/auth-service
mvn spring-boot:run
```

```bash
cd backend/cycles-service
./mvnw spring-boot:run
```

### Run Frontend

```bash
cd frontend
npm install
npm start
```

## API Routing Note

Frontend API client defaults to `http://localhost:8080/api` (`REACT_APP_API_URL`), which assumes a gateway/proxy is available.

In the current repository, there is no gateway implementation checked in, so full end-to-end routing for both `/auth/*` and `/cycles/*` through one base URL requires adding your own proxy or updating frontend API wiring.

## Docker Compose Note

`docker-compose.yml` still references `api-gateway`, and `nginx/` is incomplete for that setup. Treat compose as a work-in-progress unless you add the missing gateway/proxy pieces.
