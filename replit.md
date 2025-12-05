# Isanutri v5 - Nutritional Management System

## Overview
Isanutri is a comprehensive nutritional management platform for dietitians and nutritionists. The application provides tools for patient management, diet generation, metabolic calculations, and food database management.

## Tech Stack
- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS (via CDN)
- **Backend/Auth**: Firebase (Authentication, Firestore, Storage)
- **Routing**: React Router DOM v7

## Project Structure
```
/
├── components/           # React components
│   ├── diet-generator/   # Diet generation wizard components
│   ├── modals/           # Modal dialogs
│   ├── patient-form/     # Patient registration form steps
│   └── patient-list/     # Patient list components
├── contexts/             # React contexts (Auth)
├── data/                 # Static data (foods database)
├── hooks/                # Custom React hooks
├── services/             # API and business logic services
│   ├── dietAlgorithmService.ts    # Diet generation algorithm
│   ├── firebaseService.ts         # Firebase integration
│   ├── foodService.ts             # Food database service
│   └── metabolicCalculations.ts   # BMR, TDEE calculations
├── utils/                # Utility functions
├── App.tsx               # Main application component
├── index.tsx             # Application entry point
├── types.ts              # TypeScript type definitions
└── vite.config.ts        # Vite configuration
```

## Key Features
1. **Patient Management**: Full CRUD for patient records with detailed profiles
2. **Diet Generator**: Step-by-step wizard for creating personalized diet plans
3. **Metabolic Calculator**: BMR, TDEE, BMI calculations using multiple formulas
4. **Food Database**: Comprehensive food nutritional information
5. **PDF Export**: Export diet plans to PDF format
6. **Dark Mode**: Full dark mode support

## Running the Application
The application runs on port 5000 with:
```bash
npm run dev
```

## Firebase Configuration
The app uses Firebase for:
- User authentication (email/password + Google)
- Firestore database for patient and diet storage
- Cloud Storage for profile pictures

## Recent Changes
- December 2024: Initial setup on Replit
- Fixed AuthContext.tsx closing tag error
- Configured Vite for Replit environment (port 5000, allowedHosts)
- Created index.css for base styles

## User Preferences
- Language: Portuguese (Brazil)
- Date Format: DD/MM/YYYY
