# Flowelle - Women's Health Platform

Your body, your rhythm. A comprehensive women's health platform for menstrual cycle tracking and wellness.

## Project Overview

Flowelle is a modern, user-centric women's health platform that provides:
- Menstrual cycle tracking
- Fertility window prediction
- Symptom and mood logging
- Health insights & personalized tips
- Community features and doctor consultations

## Tech Stack

### Frontend
- React 18+
- Redux Toolkit
- TailwindCSS
- Chart.js
- date-fns

### Backend
- Spring Boot Microservices
- PostgreSQL
- Redis
- JWT Authentication

### Infrastructure
- Docker & Docker Compose
- AWS Services (S3, RDS)
- CI/CD with GitHub Actions

## Project Structure

```
flowelle/
├── frontend/           # React frontend application
├── api-gateway/        # Spring Boot API Gateway
├── services/
│   ├── auth-service/   # Authentication & User Management
│   ├── cycle-service/  # Cycle Tracking & Predictions
│   ├── report-service/ # Analytics & Reporting
│   ├── doctor-service/ # Doctor Consultation
│   └── community/      # Community & Forum
└── docker/            # Docker configurations
```

## Getting Started

### Prerequisites
- Node.js 18+
- Java 17+
- Docker & Docker Compose
- PostgreSQL 14+
- Redis

### Development Setup

1. Clone the repository:
```bash
git clone https://github.com/your-org/flowelle.git
cd flowelle
```

2. Start the infrastructure services:
```bash
docker-compose up -d
```

3. Start the backend services:
```bash
cd api-gateway
./mvnw spring-boot:run
```

4. Start the frontend development server:
```bash
cd frontend
npm install
npm run dev
```

## Color Palette

- Primary Accent: #FF6F91 (Rose Quartz)
- Background/Depth: #2E3A59 (Deep Indigo)
- Base/Contrast: #FAF4EF (Cream)
- Calm/Success: #B7D6C2 (Sage Green)
- Highlights: #FF9A8B (Soft Coral)

## Contributing

Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 