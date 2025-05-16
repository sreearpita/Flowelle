# Flowelle Frontend

A modern, user-friendly women's health tracking platform built with React and TypeScript.

## Tech Stack

- **Framework:** React 19 with TypeScript
- **State Management:** Redux Toolkit
- **Routing:** React Router v6
- **Styling:** Tailwind CSS v3
- **Date Handling:** date-fns v4
- **HTTP Client:** Axios
- **Form Components:** react-datepicker
- **Charts:** Chart.js with react-chartjs-2
- **Development Tools:**
  - Create React App
  - TypeScript
  - ESLint
  - PostCSS

## Features

### Implemented
- ✅ User Authentication (Login/Register)
- ✅ Protected Routes
- ✅ Calendar View with Cycle Tracking
- ✅ Symptom Logging
- ✅ Cycle Phase Visualization
- ✅ Predictions for:
  - Next Period
  - Fertile Window
  - Ovulation Day

### In Progress
- 🔄 Insights Dashboard
- 🔄 Community Features
- 🔄 User Profile Management

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm (v8 or higher)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd frontend
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm start
```

The application will be available at `http://localhost:3000`.

## Project Structure

```
src/
├── components/         # Reusable UI components
├── features/          # Feature-specific components and logic
│   ├── auth/         # Authentication related components
│   ├── calendar/     # Calendar and cycle tracking
│   ├── insights/     # Data visualization and insights
│   ├── community/    # Community features
│   └── profile/      # User profile management
├── services/         # API service layer
├── store/           # Redux store configuration and slices
├── types/           # TypeScript type definitions
└── utils/           # Utility functions and helpers
```

## State Management

- Using Redux Toolkit for global state management
- Separate slices for:
  - Authentication state
  - Cycle tracking data
  - User preferences

## API Integration

- RESTful API communication via Axios
- Centralized API configuration
- Token-based authentication
- Error handling and interceptors

## Styling

- Tailwind CSS for utility-first styling
- Custom theme configuration:
  - Color palette (deep-indigo, rose-quartz, sage-green, cream)
  - Typography (Playfair Display for headings, Inter for body text)
  - Responsive design breakpoints

## Development Guidelines

1. **TypeScript**
   - Strict type checking enabled
   - Interface-first approach for data structures
   - Proper type definitions for all components and functions

2. **Component Structure**
   - Functional components with hooks
   - Props interface definitions
   - Proper error boundaries
   - Loading states handled consistently

3. **State Management**
   - Use local state for component-specific data
   - Redux for shared/global state
   - Proper action typing and error handling

4. **Code Style**
   - ESLint configuration
   - Consistent naming conventions
   - Component and function documentation

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

[Your License Here]
