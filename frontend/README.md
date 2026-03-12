# Flowelle Frontend

React + TypeScript client for Flowelle.

## Stack

1. React 19 (Create React App)
2. TypeScript
3. Redux Toolkit
4. React Router v6
5. Tailwind CSS
6. Axios
7. date-fns
8. react-datepicker

## Current Features

Implemented:
1. Login / Register
2. Protected routing
3. Calendar month view
4. Symptom logging modal
5. Basic cycle event cards (next period, fertile window, ovulation)
6. Profile view + profile update form

Placeholder pages:
1. Insights
2. Community

## App Routes

1. `/login`
2. `/register`
3. `/calendar` (protected)
4. `/insights` (protected)
5. `/community` (protected)
6. `/profile` (protected)

## Local Run

### Prerequisites

1. Node.js 18+
2. npm 8+

### Install and start

```bash
npm install
npm start
```

Dev server: `http://localhost:3000`

## API Configuration

The Axios base URL is configured in `src/services/api.ts`:
1. `REACT_APP_API_URL` if provided
2. Otherwise defaults to `http://localhost:8080/api`

The app expects these endpoints under one base URL:
1. `/auth/*`
2. `/cycles/*`

In the current repository there is no checked-in API gateway, so if auth and cycle services run on separate ports (`8081` and `8082`), you need a proxy/gateway or service-level frontend API adjustments.

## State Management

Redux slices:
1. `auth` slice (`src/store/slices/authSlice.ts`)
2. `cycle` slice (`src/store/slices/cycleSlice.ts`)

Token handling:
1. JWT stored in `localStorage`
2. Axios request interceptor attaches `Authorization: Bearer <token>`
3. `401` response interceptor clears token and redirects to `/login`

## Current Limitations

1. `updateCycleDay` client method calls `/cycles/days/{date}`, but no matching backend endpoint currently exists.
2. Test coverage is minimal (default CRA test scaffold remains).
