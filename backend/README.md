# Flowelle Backend Services

## Architecture Overview

### Microservices
1. **Auth Service**
   - User authentication and authorization
   - JWT token management
   - User profile management

2. **Cycle Service**
   - Menstrual cycle tracking
   - Symptom logging
   - Predictions and analytics

### Tech Stack
- **Framework:** Spring Boot 3.x
- **Database:** PostgreSQL 15
- **Security:** Spring Security with JWT
- **Documentation:** SpringDoc OpenAPI (Swagger)
- **Build Tool:** Maven
- **Testing:** JUnit 5, Mockito

## Database Schema

### Auth Service Database

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User preferences table
CREATE TABLE user_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    cycle_length INTEGER DEFAULT 28,
    period_length INTEGER DEFAULT 5,
    birth_control_use BOOLEAN DEFAULT false,
    notifications_enabled BOOLEAN DEFAULT true,
    reminder_time TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Cycle Service Database

```sql
-- Cycles table
CREATE TABLE cycles (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    start_date DATE NOT NULL,
    end_date DATE,
    period_length INTEGER,
    cycle_length INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Symptoms table
CREATE TABLE symptoms (
    id UUID PRIMARY KEY,
    cycle_id UUID REFERENCES cycles(id),
    type VARCHAR(50) NOT NULL,
    severity INTEGER CHECK (severity BETWEEN 1 AND 5),
    date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Predictions table
CREATE TABLE predictions (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    cycle_id UUID REFERENCES cycles(id),
    next_period_date DATE,
    fertile_window_start DATE,
    fertile_window_end DATE,
    ovulation_date DATE,
    confidence_score FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### Auth Service

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update user profile

#### User Preferences
- `GET /api/preferences` - Get user preferences
- `PUT /api/preferences` - Update user preferences

### Cycle Service

#### Cycle Management
- `GET /api/cycles/current` - Get current cycle
- `GET /api/cycles/history` - Get cycle history
- `POST /api/cycles` - Start new cycle
- `PUT /api/cycles/{id}` - Update cycle

#### Symptom Tracking
- `POST /api/symptoms` - Log new symptom
- `PUT /api/symptoms/{id}` - Update symptom
- `DELETE /api/symptoms/{id}` - Delete symptom
- `GET /api/symptoms/cycle/{cycleId}` - Get symptoms for cycle

#### Predictions
- `GET /api/predictions/next-period` - Get next period prediction
- `GET /api/predictions/fertile-window` - Get fertile window prediction
- `GET /api/predictions/ovulation` - Get ovulation prediction

## Implementation Steps

1. **Project Setup**
   - Initialize Spring Boot projects
   - Configure PostgreSQL connection
   - Set up project structure

2. **Auth Service Implementation**
   - User entity and repository
   - JWT configuration
   - Authentication controllers
   - User service implementation

3. **Cycle Service Implementation**
   - Cycle and symptom entities
   - Repositories setup
   - Service layer implementation
   - Prediction algorithm implementation

4. **Database Setup**
   - Create databases
   - Run migration scripts
   - Set up test data

5. **Testing**
   - Unit tests
   - Integration tests
   - API tests

6. **Documentation**
   - API documentation
   - Swagger UI setup
   - Postman collection

## Development Guidelines

1. **Code Organization**
   - Follow clean architecture principles
   - Use DTOs for API responses
   - Implement proper error handling
   - Follow SOLID principles

2. **Security**
   - Implement proper authentication
   - Input validation
   - CORS configuration
   - Rate limiting

3. **Testing**
   - Write comprehensive unit tests
   - Integration tests for critical flows
   - API tests for endpoints

4. **Documentation**
   - Document all APIs
   - Include example requests/responses
   - Document error codes

## Getting Started

1. **Prerequisites**
   - JDK 17+
   - Maven 3.8+
   - PostgreSQL 15+

2. **Database Setup**
   ```bash
   # Create databases
   createdb flowelle_auth
   createdb flowelle_cycle

   # Run migrations
   # (Instructions for running migrations will be added)
   ```

3. **Running Services**
   ```bash
   # Auth Service
   cd auth-service
   mvn spring-boot:run

   # Cycle Service
   cd cycle-service
   mvn spring-boot:run
   ```

## Contributing

1. Create a feature branch
2. Implement changes
3. Write tests
4. Submit pull request

## License

[Your License Here] 