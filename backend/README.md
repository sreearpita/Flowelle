# Flowelle Backend

This folder currently contains two Spring Boot services:
1. `auth-service`
2. `cycles-service`

## Services and Ports

1. Auth service: `http://localhost:8081/api`
2. Cycles service: `http://localhost:8082/api`

## Databases

Current default DB config in code:
1. Auth service DB: `flowelle`
2. Cycles service DB: `flowelle_cycle`
3. Username: `postgres`
4. Password: `postgres`

Create both before running:

```bash
createdb flowelle
createdb flowelle_cycle
```

## Run Locally

### Auth Service

```bash
cd auth-service
mvn spring-boot:run
```

### Cycles Service

```bash
cd cycles-service
./mvnw spring-boot:run
```

## Auth Service API (`/api/auth`)

1. `POST /register`
2. `POST /login`
3. `GET /me`
4. `PUT /me`

Behavior notes:
1. Registration creates `users` and `user_preferences` rows.
2. Registration also attempts to create an initial cycle by calling cycles service.
3. JWT is issued on register/login.

## Cycles Service API (`/api/cycles`)

Cycle endpoints:
1. `GET /current?userId={id}`
2. `GET /history?userId={id}`
3. `POST /`
4. `PUT /{id}`
5. `GET /predictions?userId={id}`

Symptom endpoints:
1. `POST /api/cycles/symptoms`
2. `PUT /api/cycles/symptoms/{id}`
3. `DELETE /api/cycles/symptoms/{id}`
4. `GET /api/cycles/symptoms/cycle/{cycleId}`

Prediction behavior:
1. Uses latest cycle as baseline.
2. `nextPeriod = startDate + cycleLength`.
3. `ovulation = nextPeriod - 14 days`.
4. Fertile window = `ovulation - 5` to `ovulation + 1`.

## Security

1. Both services are stateless and JWT-based.
2. Cycles service validates bearer tokens as an OAuth2 resource server.
3. JWT secret must match across both services.

In current code:
1. Auth service secret is configured in `application.yml`.
2. Cycles service reads `jwt.secret` from `JWT_SECRET` env var fallback.

## Current Limitations

1. No API gateway service is present in this repository.
2. Frontend currently expects a single API base URL for both auth and cycles endpoints.
3. There are currently no backend test classes checked in.
