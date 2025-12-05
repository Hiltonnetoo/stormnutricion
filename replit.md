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

## Design System
The application uses a modern, professional design with:
- **Primary Color**: Sage/Teal (#0D9488)
- **Typography**: Plus Jakarta Sans / Inter
- **Border Radius**: xl (12px), 2xl (16px), 3xl (24px)
- **Shadows**: Soft shadows with color accents
- **Animations**: Smooth transitions and micro-interactions

### Key Design Patterns
- Split-screen layouts for authentication pages
- Gradient accent buttons with hover effects
- Card-based UI with subtle borders and shadows
- Skeleton loading states with shimmer animation
- Responsive navigation with active state indicators

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

**Important**: Configure Firestore Security Rules in Firebase Console to allow authenticated users to read/write their own data.

## Recent Changes
- December 2024: Initial setup on Replit
- Fixed AuthContext.tsx closing tag error
- Configured Vite for Replit environment (port 5000, allowedHosts)
- Created index.css for base styles
- December 2024: Major UI/UX Redesign
  - Redesigned Register page with split-screen layout
  - Enhanced Sidebar with animations and micro-interactions
  - Modernized Dashboard with improved stat cards and quick actions
  - Updated Breadcrumbs with icons and sticky positioning
  - Improved EmptyState and LoadingState components
  - Added global CSS animations (fadeIn, scaleIn, shimmer)

## User Preferences
- Language: Portuguese (Brazil)
- Date Format: DD/MM/YYYY
